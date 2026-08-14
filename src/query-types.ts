export interface PaginationQuery {
  first?: number;
  max?: number;
}

export interface SearchQuery {
  search?: string;
}

export interface ExactMatchQuery {
  exact?: boolean;
}

export interface BriefRepresentationQuery {
  briefRepresentation?: boolean;
}

export interface UserQuery extends PaginationQuery, SearchQuery, ExactMatchQuery, BriefRepresentationQuery {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  enabled?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  idpAlias?: string;
  idpUserId?: string;
  q?: string;
}

export interface UserCountQuery extends SearchQuery, ExactMatchQuery {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  enabled?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  idpAlias?: string;
  idpUserId?: string;
  q?: string;
}

export interface ClientQuery extends PaginationQuery {
  clientId?: string;
  search?: boolean;
  q?: string;
  viewableOnly?: boolean;
}

export type ClientScopeQuery = Record<string, never>;

export interface RoleQuery extends PaginationQuery, SearchQuery, BriefRepresentationQuery {}

export interface GroupQuery extends PaginationQuery, SearchQuery, ExactMatchQuery, BriefRepresentationQuery {
  q?: string;
  populateHierarchy?: boolean;
  subGroupsCount?: boolean;
}

export interface GroupCountQuery extends SearchQuery {
  top?: boolean;
}

export interface IdentityProviderQuery extends PaginationQuery, SearchQuery, BriefRepresentationQuery {
  capability?: string;
  realmOnly?: boolean;
  type?: string;
}

export interface OrganizationQuery extends PaginationQuery, SearchQuery, ExactMatchQuery, BriefRepresentationQuery {
  q?: string;
}

export interface OrganizationCountQuery extends SearchQuery, ExactMatchQuery {
  q?: string;
}

export interface ComponentQuery extends PaginationQuery {
  name?: string;
  parent?: string;
  providerId?: string;
  type?: string;
}

export interface AuthenticationExecutionQuery {
  flowAlias: string;
}

export interface WorkflowQuery extends PaginationQuery, SearchQuery, ExactMatchQuery {}

export interface RealmQuery extends PaginationQuery {
  briefRepresentation?: boolean;
}

export interface RealmEventsQuery extends PaginationQuery {
  type?: string[];
  dateFrom?: number;
  dateTo?: number;
  realmOnly?: boolean;
  clientOnly?: boolean;
  userOnly?: boolean;
  excludedEvents?: string[];
  briefRepresentation?: boolean;
}

export interface RealmAdminEventsQuery extends PaginationQuery {
  operationTypes?: string[];
  authDetails?: boolean;
  dateFrom?: number;
  dateTo?: number;
  realmOnly?: boolean;
  clientOnly?: boolean;
  userOnly?: boolean;
  briefRepresentation?: boolean;
}

export interface RealmLocalizationQuery {
  locale?: string;
}

export interface EffectiveMessageBundleQuery {
  locale?: string;
}

export interface UserSessionQuery extends PaginationQuery {
  user?: string;
  client?: string;
  ipAddress?: string;
}

export interface ClientSessionQuery extends PaginationQuery {
  user?: string;
  client?: string;
}

export type ClientInitialAccessQuery = PaginationQuery;

export type ClientPolicyQuery = PaginationQuery;

export type AttackDetectionQuery = Record<string, never>;

export type CacheQuery = Record<string, never>;

export type ServerInfoQuery = Record<string, never>;

export type WhoAmIQuery = Record<string, never>;

export type ClientRegistrationPolicyQuery = Record<string, never>;

export type ClientAttributeCertificateQuery = Record<string, never>;

export type RequiredActionQuery = Record<string, never>;

export type ClientProfilesQuery = Record<string, never>;

export interface EventQuery extends PaginationQuery {
  type?: string[];
  dateFrom?: number;
  dateTo?: number;
  excludedEvents?: string[];
}

export type EventConfigQuery = Record<string, never>;

export type KeyQuery = Record<string, never>;

export type KeysMetadataQuery = Record<string, never>;

export type ClientSessionStatQuery = Record<string, never>;

export interface UserConsentQuery extends PaginationQuery {
  client?: string;
}

export type UserProfileQuery = Record<string, never>;

export type UserProfileMetadataQuery = Record<string, never>;

export type ClientScopeProtocolMapperQuery = Record<string, never>;

export type ClientProtocolMapperQuery = Record<string, never>;

export type IdentityProviderMapperQuery = Record<string, never>;

export type AuthenticationFlowQuery = PaginationQuery;

export interface AuthenticationExecutionInfoQuery {
  flowAlias: string;
}

export type AuthenticatorConfigQuery = Record<string, never>;

export type RequiredActionConfigQuery = Record<string, never>;

export type ProtocolMapperQuery = Record<string, never>;

export interface ResourceQuery extends PaginationQuery {
  id?: string;
  name?: string;
  type?: string;
  owner?: string;
  uri?: string;
  deep?: boolean;
  exactName?: boolean;
  matchingUri?: boolean;
  scope?: string;
}

export interface PolicyQuery extends PaginationQuery {
  id?: string;
  name?: string;
  type?: string;
  resource?: string;
  scope?: string;
  permission?: string;
  owner?: string;
  fields?: string;
  policyId?: string;
  resourceType?: string;
}

export interface ScopeQuery extends PaginationQuery {
  name?: string;
  scopeId?: string;
}

export type ClientScopeMappingQuery = Record<string, never>;

export type RoleMappingQuery = PaginationQuery;

export type GroupRoleMappingQuery = Record<string, never>;

export type UserRoleMappingQuery = Record<string, never>;

export interface FederatedIdentityQuery {
  identityProvider: string;
}

export interface CredentialQuery {
  type?: string[];
  userLabel?: string;
}

export interface UserFederatedIdentityQuery {
  identityProvider: string;
}

export type ClientCredentialQuery = Record<string, never>;

export type ClientScopeAttributeQuery = Record<string, never>;

export type ComponentConfigQuery = Record<string, never>;

export type ClientPolicyExecutorQuery = Record<string, never>;

export type ClientPolicyConditionQuery = Record<string, never>;

export type ClientPolicyProfileQuery = Record<string, never>;

export interface SubGroupQuery extends PaginationQuery, SearchQuery, ExactMatchQuery, BriefRepresentationQuery {
  q?: string;
  subGroupsCount?: boolean;
}

export interface GroupMembersQuery extends PaginationQuery, BriefRepresentationQuery {}

export interface OrganizationMemberQuery extends PaginationQuery, SearchQuery, ExactMatchQuery {
  membershipType?: string;
}

export interface OrganizationInvitationQuery extends PaginationQuery, SearchQuery {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}

export interface OrganizationGroupQuery
  extends PaginationQuery, SearchQuery, ExactMatchQuery, BriefRepresentationQuery {
  q?: string;
  populateHierarchy?: boolean;
  subGroupsCount?: boolean;
}

export interface RoleCompositesQuery extends PaginationQuery, SearchQuery {}

export interface ClientEvaluateScopeQuery {
  audience?: string;
  scope?: string;
  userId?: string;
}

export type ClientSessionsQuery = PaginationQuery;
