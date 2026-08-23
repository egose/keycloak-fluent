import KeycloakAdminClient, { type ConnectionConfig, type Credentials, type GrantTypes } from './keycloak-admin-client';
import { getToken as acquireToken } from '@keycloak/keycloak-admin-client/lib/utils/auth.js';
import RealmHandle from './realm';
import ServerInfoHandle from './server-info';
import WhoAmIHandle from './who-am-i';
import { createManagedKeycloakClientWith, type ManagedKeycloakClientOptions } from './managed-client';

export type SimpleAuthOptions = {
  username?: string;
  password?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
};

type SimpleAuthTokenAcquirer = typeof acquireToken;

type KeycloakAdminClientFluentSeams = {
  adminClient?: KeycloakAdminClient;
  tokenAcquirer?: SimpleAuthTokenAcquirer;
};

const SIMPLE_AUTH_ERROR_FIELD_LIMIT = 200;
const SIMPLE_AUTH_ERROR_MESSAGE_LIMIT = 500;
const SIMPLE_AUTH_CAUSE_DEPTH = 4;

const SIMPLE_AUTH_OAUTH_ERROR_FIELDS = ['error', 'error_description', 'error_uri'] as const;
const SIMPLE_AUTH_SAFE_CAUSE_KEYS = new Set(['code', 'error', 'name', 'status', 'statusCode']);
const SIMPLE_AUTH_SENSITIVE_CAUSE_KEYS = new Set([
  'access_token',
  'accesstoken',
  'authorization',
  'body',
  'client_secret',
  'clientsecret',
  'config',
  'credential',
  'credentials',
  'data',
  'headers',
  'password',
  'refresh_token',
  'refreshtoken',
  'request',
  'response',
  'responsetext',
  'secret',
  'token',
]);

function getSimpleAuthGrantType({
  password,
  refreshToken,
}: Pick<SimpleAuthOptions, 'password' | 'refreshToken'>): GrantTypes {
  if (password) return 'password';
  if (refreshToken) return 'refresh_token';

  return 'client_credentials';
}

function hasOwnField(options: SimpleAuthOptions, field: keyof SimpleAuthOptions) {
  return Object.prototype.hasOwnProperty.call(options, field);
}

function validateNonEmptyAuthField(options: SimpleAuthOptions, field: keyof SimpleAuthOptions) {
  const value = options[field];
  if (hasOwnField(options, field) && typeof value === 'string' && value.trim() === '') {
    throw new Error(`simpleAuth() requires ${field} to be non-empty when provided`);
  }
}

function validateSimpleAuthOptions(options: SimpleAuthOptions) {
  const { username, password, refreshToken } = options;

  validateNonEmptyAuthField(options, 'username');
  validateNonEmptyAuthField(options, 'password');
  validateNonEmptyAuthField(options, 'refreshToken');
  validateNonEmptyAuthField(options, 'clientId');
  validateNonEmptyAuthField(options, 'clientSecret');

  if (password && refreshToken) {
    throw new Error('simpleAuth() accepts either password credentials or a refresh token, not both');
  }

  if (password && !username) {
    throw new Error('simpleAuth() requires username when password is provided');
  }

  if (username && !password) {
    throw new Error('simpleAuth() requires password when username is provided');
  }
}

function getSimpleAuthSecrets(options: SimpleAuthOptions) {
  return [options.password, options.refreshToken, options.clientSecret].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
}

function redactSimpleAuthSecrets(value: string, secrets: readonly string[]) {
  return secrets.reduce((redacted, secret) => redacted.split(secret).join('[redacted]'), value);
}

function boundedSimpleAuthString(value: unknown, secrets: readonly string[], limit = SIMPLE_AUTH_ERROR_FIELD_LIMIT) {
  if (typeof value === 'string') return redactSimpleAuthSecrets(value, secrets).slice(0, limit);
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return String(value).slice(0, limit);
  return undefined;
}

function getSimpleAuthResponseData(error: unknown) {
  if (typeof error === 'object' && error !== null && 'responseData' in error) {
    return (error as { responseData?: unknown }).responseData;
  }

  return undefined;
}

function parseSimpleAuthResponseData(responseData: unknown) {
  if (typeof responseData !== 'string') return responseData;

  try {
    return JSON.parse(responseData) as unknown;
  } catch {
    return undefined;
  }
}

function sanitizeSimpleAuthOAuthResponseData(responseData: unknown, secrets: readonly string[]) {
  const parsed = parseSimpleAuthResponseData(responseData);
  if (typeof parsed !== 'object' || parsed === null) return undefined;

  const source = parsed as Record<string, unknown>;
  const sanitized: Record<string, string> = {};
  for (const field of SIMPLE_AUTH_OAUTH_ERROR_FIELDS) {
    const value = boundedSimpleAuthString(source[field], secrets);
    if (value !== undefined && value.trim() !== '') {
      sanitized[field] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeSimpleAuthCauseValue(
  value: unknown,
  secrets: readonly string[],
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (typeof value === 'string') return boundedSimpleAuthString(value, secrets);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return String(value).slice(0, SIMPLE_AUTH_ERROR_FIELD_LIMIT);
  if (value === null) return null;
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (depth <= 0) return '[truncated]';
  if (typeof value !== 'object') return String(value).slice(0, SIMPLE_AUTH_ERROR_FIELD_LIMIT);
  if (seen.has(value)) return '[circular]';
  seen.add(value);

  const source = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const key of SIMPLE_AUTH_SAFE_CAUSE_KEYS) {
    if (key in source) {
      sanitized[key] = sanitizeSimpleAuthCauseValue(source[key], secrets, seen, depth - 1);
    }
  }

  for (const [key, entry] of Object.entries(source)) {
    const normalizedKey = key.toLowerCase();
    if (SIMPLE_AUTH_SENSITIVE_CAUSE_KEYS.has(normalizedKey)) {
      sanitized[key] = '[redacted]';
    }
  }

  if ('cause' in source) {
    sanitized.cause = sanitizeSimpleAuthCauseValue(source.cause, secrets, seen, depth - 1);
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeSimpleAuthCause(error: unknown, secrets: readonly string[]) {
  if (error === undefined || error === null) return undefined;
  if (typeof error !== 'object') {
    return boundedSimpleAuthString(error, secrets, SIMPLE_AUTH_ERROR_MESSAGE_LIMIT);
  }

  const seen = new WeakSet<object>();
  seen.add(error);
  const source = error as Error & Record<string, unknown> & { cause?: unknown };
  const diagnostic: Record<string, unknown> = {};

  if (error instanceof Error) {
    diagnostic.name = boundedSimpleAuthString(error.name || 'Error', secrets);
    diagnostic.message = boundedSimpleAuthString(error.message, secrets, SIMPLE_AUTH_ERROR_MESSAGE_LIMIT);
  }

  for (const key of SIMPLE_AUTH_SAFE_CAUSE_KEYS) {
    if (key in source && !(key in diagnostic)) {
      diagnostic[key] = sanitizeSimpleAuthCauseValue(source[key], secrets, seen, SIMPLE_AUTH_CAUSE_DEPTH - 1);
    }
  }

  const responseData = sanitizeSimpleAuthOAuthResponseData(source.responseData, secrets);
  if (responseData !== undefined) {
    diagnostic.responseData = responseData;
  }

  for (const [key] of Object.entries(source)) {
    const normalizedKey = key.toLowerCase();
    if (SIMPLE_AUTH_SENSITIVE_CAUSE_KEYS.has(normalizedKey) && !(key in diagnostic)) {
      diagnostic[key] = '[redacted]';
    }
  }

  if (source.cause !== undefined) {
    diagnostic.cause = sanitizeSimpleAuthCauseValue(source.cause, secrets, seen, SIMPLE_AUTH_CAUSE_DEPTH - 1);
  }

  return Object.keys(diagnostic).length > 0 ? diagnostic : undefined;
}

function getSimpleAuthErrorMessage(error: unknown, secrets: readonly string[]) {
  const responseData = sanitizeSimpleAuthOAuthResponseData(getSimpleAuthResponseData(error), secrets);
  if (responseData !== undefined) {
    const parts = SIMPLE_AUTH_OAUTH_ERROR_FIELDS.flatMap((field) => {
      const value = responseData[field];
      if (value === undefined) return [];
      return [value];
    });

    if (parts.length > 0) {
      return parts.join(': ').slice(0, SIMPLE_AUTH_ERROR_MESSAGE_LIMIT);
    }
  }

  if (error instanceof Error) {
    const message = boundedSimpleAuthString(error.message, secrets, SIMPLE_AUTH_ERROR_MESSAGE_LIMIT);
    if (message !== undefined && message.trim() !== '') {
      return message;
    }
  }

  if (typeof error === 'string') {
    const message = boundedSimpleAuthString(error, secrets, SIMPLE_AUTH_ERROR_MESSAGE_LIMIT);
    if (message !== undefined && message.trim() !== '') {
      return message;
    }
  }

  return 'unknown authentication error';
}

export default class KeycloakAdminClientFluent {
  public readonly core: KeycloakAdminClient;

  private readonly tokenAcquirer: SimpleAuthTokenAcquirer;

  constructor(connectionConfig?: ConnectionConfig, seams?: KeycloakAdminClientFluentSeams) {
    this.core = seams?.adminClient ?? new KeycloakAdminClient(connectionConfig);
    this.tokenAcquirer = seams?.tokenAcquirer ?? acquireToken;
  }

  public async auth(credentials: Credentials) {
    return this.core.auth(credentials);
  }

  public async simpleAuth({
    username,
    password,
    refreshToken,
    clientId = 'admin-cli',
    clientSecret,
  }: SimpleAuthOptions) {
    const options = { username, password, refreshToken, clientId, clientSecret };
    validateSimpleAuthOptions(options);
    const grantType = getSimpleAuthGrantType(options);
    const secrets = getSimpleAuthSecrets(options);

    try {
      const credentials: Credentials = {
        grantType,
        clientId,
      };

      if (clientSecret !== undefined) credentials.clientSecret = clientSecret;
      if (username !== undefined) credentials.username = username;
      if (password !== undefined) credentials.password = password;
      if (refreshToken !== undefined) credentials.refreshToken = refreshToken;

      if (grantType === 'client_credentials') {
        const { accessToken } = await this.tokenAcquirer({
          baseUrl: this.core.baseUrl,
          realmName: this.core.realmName,
          scope: this.core.scope,
          credentials,
          requestOptions: {
            ...this.core.getRequestOptions(),
            ...(this.core.timeout ? { signal: AbortSignal.timeout(this.core.timeout) } : {}),
          },
        });
        this.core.setAccessToken(accessToken);
        return;
      }

      await this.auth(credentials);
    } catch (error) {
      const cause = sanitizeSimpleAuthCause(error, secrets);
      throw new Error(`Keycloak authentication failed: ${getSimpleAuthErrorMessage(error, secrets)}`, {
        cause,
      });
    }
  }

  realm(name: string) {
    return new RealmHandle(this.core, name);
  }

  public serverInfo() {
    return new ServerInfoHandle(this.core);
  }

  public whoAmI(currentRealm: string, realmName?: string) {
    return new WhoAmIHandle(this.core, currentRealm, realmName);
  }

  public async searchRealms(keyword: string) {
    const result = await this.core.realms.find({
      briefRepresentation: false,
    });

    const lowerkeyword = keyword.toLocaleLowerCase();

    return result.filter((item) => {
      if (!item.realm) return false;

      return item.realm.toLocaleLowerCase().includes(lowerkeyword);
    });
  }
}

export function createManagedKeycloakClient(options: ManagedKeycloakClientOptions): KeycloakAdminClientFluent {
  return createManagedKeycloakClientWith(KeycloakAdminClientFluent, options);
}

export { AuthenticationFlowNotFoundError } from './authentication-flow';
export { default as AuthenticationFlowHandle } from './authentication-flow';
export { default as AttackDetectionHandle } from './attack-detection';
export { default as CacheHandle } from './cache';
export { default as ClientRoleHandle } from './client-role';
export { default as ClientScopeHandle } from './client-scope';
export { default as ClientPoliciesHandle } from './client-policies';
export { default as ComponentHandle } from './component';
export { AbstractGroupHandle } from './groups/abstract-group';
export { default as ChildGroupHandle } from './groups/child-group';
export { default as GroupHandle } from './groups/group';
export { default as NestedChildGroupHandle } from './groups/nested-child-group';
export { default as IdentityProviderHandle } from './identity-provider';
export { default as IdentityProviderMapperHandle } from './identity-provider-mapper';
export { default as OrganizationHandle } from './organization';
export { default as AudienceProtocolMapperHandle } from './protocol-mappers/audience-protocol-mapper';
export { default as ClientScopeAudienceProtocolMapperHandle } from './protocol-mappers/client-scope-audience-protocol-mapper';
export { default as ClientScopeHardcodedClaimProtocolMapperHandle } from './protocol-mappers/client-scope-hardcoded-claim-protocol-mapper';
export { default as ClientScopeProtocolMapperHandle } from './protocol-mappers/client-scope-protocol-mapper';
export { default as ClientScopeUserAttributeProtocolMapperHandle } from './protocol-mappers/client-scope-user-attribute-protocol-mapper';
export { default as HardcodedClaimProtocolMapperHandle } from './protocol-mappers/hardcoded-claim-protocol-mapper';
export { default as ProtocolMapperHandle } from './protocol-mappers/protocol-mapper';
export { default as UserAttributeProtocolMapperHandle } from './protocol-mappers/user-attribute-protocol-mapper';
export { default as RealmHandle } from './realm';
export { default as RoleHandle } from './role';
export { default as ServerInfoHandle } from './server-info';
export { UserPasswordProvisioningError } from './user';
export { default as UserHandle } from './user';
export { default as UserStorageProviderHandle } from './user-storage-provider';
export { default as WhoAmIHandle } from './who-am-i';
export { DuplicateWorkflowNameError, WorkflowNotFoundError } from './workflow';
export { default as WorkflowHandle } from './workflow';
export { default as ClientHandle } from './clients/client';
export { default as ConfidentialBrowserLoginClientHandle } from './clients/confidential-browser-login-client';
export { default as PublicBrowserLoginClientHandle } from './clients/public-browser-login-client';
export { default as RealmAdminServiceAccountHandle } from './clients/realm-admin-service-account';
export { default as ServiceAccountHandle } from './clients/service-account';

export type {
  AuthenticationExecutionsQuery,
  AuthenticationFlowInputData,
  AuthenticationSubFlowInputData,
} from './authentication-flow';
export type { ClientRoleInputData } from './client-role';
export type { ClientScopeInputData, ClientScopeProtocol, ClientScopeType } from './client-scope';
export type { ComponentInputData, ComponentLookupData } from './component';
export type { IdentityProviderInputData, IdentityProviderProviderId } from './identity-provider';
export type { IdentityProviderMapperInputData } from './identity-provider-mapper';
export type {
  ConnectionConfig,
  Credentials,
  GrantTypes,
  TokenProvider,
  AdminEventRepresentation,
  AuthenticationExecutionInfoRepresentation,
  AuthenticationFlowRepresentation,
  AuthenticationProviderRepresentation,
  AuthenticatorConfigInfoRepresentation,
  AuthenticatorConfigRepresentation,
  CertificateRepresentation,
  ClientInitialAccessPresentation,
  ClientPoliciesRepresentation,
  ClientProfilesRepresentation,
  ClientRepresentation,
  ClientScopeRepresentation,
  ClientSessionStat,
  ComponentRepresentation,
  ComponentTypeRepresentation,
  CredentialRepresentation,
  EffectiveMessageBundleRepresentation,
  EventRepresentation,
  EventType,
  FederatedIdentityRepresentation,
  GlobalRequestResult,
  GroupRepresentation,
  IdentityProviderMapperRepresentation,
  IdentityProviderRepresentation,
  KeyStoreConfig,
  KeysMetadataRepresentation,
  ManagementPermissionReference,
  MappingsRepresentation,
  OrganizationRepresentation,
  PartialImportRealmRepresentation,
  PartialImportResponse,
  PolicyEvaluationResponse,
  PolicyProviderRepresentation,
  PolicyRepresentation,
  ProtocolMapperRepresentation,
  RealmEventsConfigRepresentation,
  RealmRepresentation,
  RequiredActionAlias,
  RequiredActionConfigInfoRepresentation,
  RequiredActionConfigRepresentation,
  RequiredActionProviderRepresentation,
  ResourceEvaluation,
  ResourceRepresentation,
  ResourceServerRepresentation,
  RoleMappingPayload,
  RoleRepresentation,
  ScopeRepresentation,
  ServerInfoRepresentation,
  SynchronizationResultRepresentation,
  UserProfileConfig,
  UserProfileMetadata,
  UserRepresentation,
  UserSessionRepresentation,
  WhoAmIRepresentation,
  WorkflowRepresentation,
} from './keycloak-admin-client';
export type {
  ManagedKeycloakClientCredentialsOptions,
  ManagedKeycloakClientOptions,
  ManagedKeycloakCredential,
  ManagedKeycloakUserCredentialsOptions,
} from './managed-client';
export type { OrganizationInputData } from './organization';
export type { ChildGroupInputData } from './groups/child-group';
export type { GroupInputData } from './groups/group';
export type { NestedChildGroupInputData } from './groups/nested-child-group';
export type { AudienceProtocolMapperInputData } from './protocol-mappers/audience-protocol-mapper';
export type { ClientScopeAudienceProtocolMapperInputData } from './protocol-mappers/client-scope-audience-protocol-mapper';
export type { ClientScopeHardcodedClaimProtocolMapperInputData } from './protocol-mappers/client-scope-hardcoded-claim-protocol-mapper';
export type { ClientScopeUserAttributeProtocolMapperInputData } from './protocol-mappers/client-scope-user-attribute-protocol-mapper';
export type { HardcodedClaimProtocolMapperInputData } from './protocol-mappers/hardcoded-claim-protocol-mapper';
export type { ProtocolMapperInputData, ProtocolMapperProtocol } from './protocol-mappers/protocol-mapper';
export type { UserAttributeProtocolMapperInputData } from './protocol-mappers/user-attribute-protocol-mapper';
export type {
  AuthenticationExecutionInfoQuery,
  AuthenticationExecutionQuery,
  AuthenticationFlowQuery,
  AttackDetectionQuery,
  AuthenticatorConfigQuery,
  BriefRepresentationQuery,
  CacheQuery,
  ClientAttributeCertificateQuery,
  ClientCredentialQuery,
  ClientEvaluateScopeQuery,
  ClientInitialAccessQuery,
  ClientPolicyConditionQuery,
  ClientPolicyExecutorQuery,
  ClientPolicyProfileQuery,
  ClientPolicyQuery,
  ClientProfilesQuery,
  ClientProtocolMapperQuery,
  ClientQuery,
  ClientRegistrationPolicyQuery,
  ClientScopeAttributeQuery,
  ClientScopeMappingQuery,
  ClientScopeProtocolMapperQuery,
  ClientSessionQuery,
  ClientSessionsQuery,
  ClientSessionStatQuery,
  ClientScopeQuery,
  ComponentConfigQuery,
  ComponentQuery,
  CredentialQuery,
  EventConfigQuery,
  EventQuery,
  ExactMatchQuery,
  FederatedIdentityQuery,
  GroupCountQuery,
  GroupMembersQuery,
  GroupQuery,
  GroupRoleMappingQuery,
  IdentityProviderMapperQuery,
  IdentityProviderQuery,
  KeyQuery,
  KeysMetadataQuery,
  OrganizationCountQuery,
  OrganizationGroupQuery,
  OrganizationInvitationQuery,
  OrganizationMemberQuery,
  OrganizationQuery,
  PaginationQuery,
  PolicyQuery,
  ProtocolMapperQuery,
  RealmQuery,
  RequiredActionConfigQuery,
  RequiredActionQuery,
  ResourceQuery,
  RoleCompositesQuery,
  RoleMappingQuery,
  RoleQuery,
  ScopeQuery,
  SearchQuery,
  ServerInfoQuery,
  SubGroupQuery,
  UserConsentQuery,
  UserCountQuery,
  UserFederatedIdentityQuery,
  UserProfileMetadataQuery,
  UserProfileQuery,
  UserQuery,
  UserRoleMappingQuery,
  UserSessionQuery,
  WhoAmIQuery,
  WorkflowQuery,
} from './query-types';
export type {
  RealmAdminEventsQuery,
  RealmClientsInitialAccessInputData,
  RealmEnsureInputData,
  RealmEventsConfigInputData,
  RealmEventsQuery,
  RealmExportOptions,
  RealmInputData,
  RealmLocalizationQuery,
  RealmUserSearchAttribute,
} from './realm';
export type { RoleInputData } from './role';
export type { EffectiveMessageBundleQuery } from './server-info';
export type {
  FederatedIdentityInputData,
  ListAssignedGroupsOptions,
  ReconcileRealmRolesOptions,
  ReconcileUserAttributesOptions,
  UserInputData,
  UserRequiredAction,
} from './user';
export type {
  UserStorageMapperSyncDirection,
  UserStorageProviderNameResponse,
  UserStorageSyncAction,
} from './user-storage-provider';
export type { WorkflowInputData, WorkflowListAllOptions, WorkflowListOptions } from './workflow';
export type {
  AuthorizationPermissionQuery,
  AuthorizationPolicyQuery,
  AuthorizationResourceListAllOptions,
  AuthorizationResourceQuery,
  AuthorizationScopeListAllOptions,
  AuthorizationScopeQuery,
  ClientInputData,
} from './clients/client';
export type { ConfidentialBrowserLoginClientInputData } from './clients/confidential-browser-login-client';
export type { PublicBrowserLoginClientInputData } from './clients/public-browser-login-client';
export type { RealmAdminServiceAccountInputData } from './clients/realm-admin-service-account';
export type { ServiceAccountInputData } from './clients/service-account';
export type { FetchAllOptions, FetchPageResult } from './utils/fetch-all';
