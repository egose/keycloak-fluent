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

export interface ClientScopeQuery {}

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

export interface ClientInitialAccessQuery extends PaginationQuery {}

export interface ClientPolicyQuery extends PaginationQuery {}

export interface AttackDetectionQuery {}

export interface CacheQuery {}

export interface ServerInfoQuery {}

export interface WhoAmIQuery {}

export interface ClientRegistrationPolicyQuery {}

export interface ClientAttributeCertificateQuery {}

export interface RequiredActionQuery {}

export interface ClientProfilesQuery {}

export interface EventQuery extends PaginationQuery {
  type?: string[];
  dateFrom?: number;
  dateTo?: number;
  excludedEvents?: string[];
}

export interface EventConfigQuery {}

export interface KeyQuery {}

export interface KeysMetadataQuery {}

export interface ClientSessionStatQuery {}

export interface UserConsentQuery extends PaginationQuery {
  client?: string;
}

export interface UserProfileQuery {}

export interface UserProfileMetadataQuery {}

export interface ClientScopeProtocolMapperQuery {}

export interface ClientProtocolMapperQuery {}

export interface IdentityProviderMapperQuery {}

export interface AuthenticationFlowQuery extends PaginationQuery {}

export interface AuthenticationExecutionInfoQuery {
  flowAlias: string;
}

export interface AuthenticatorConfigQuery {}

export interface RequiredActionConfigQuery {}

export interface ProtocolMapperQuery {}

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

export interface ClientScopeMappingQuery {}

export interface RoleMappingQuery extends PaginationQuery {}

export interface GroupRoleMappingQuery {}

export interface UserRoleMappingQuery {}

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

export interface ClientCredentialQuery {}

export interface ClientScopeAttributeQuery {}

export interface ComponentConfigQuery {}

export interface ClientPolicyExecutorQuery {}

export interface ClientPolicyConditionQuery {}

export interface ClientPolicyProfileQuery {}

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
