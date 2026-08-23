import KeycloakAdminClient, {
  type AdminEventRepresentation,
  type ClientInitialAccessPresentation,
  type ClientSessionStat,
  type EventRepresentation,
  type EventType,
  type KeysMetadataRepresentation,
  type ManagementPermissionReference,
  type RealmEventsConfigRepresentation,
  type WorkflowRepresentation,
  type RealmRepresentation,
  type PartialImportRealmRepresentation,
  type PartialImportResponse,
  type UserProfileConfig,
  type UserProfileMetadata,
} from './keycloak-admin-client';
import ClientHandle from './clients/client';
import ClientScopeHandle from './client-scope';
import AuthenticationFlowHandle from './authentication-flow';
import ComponentHandle, { type ComponentLookupData } from './component';
import RoleHandle from './role';
import GroupHandle from './groups/group';
import UserHandle from './user';
import IdentityProviderHandle from './identity-provider';
import OrganizationHandle from './organization';
import UserStorageProviderHandle from './user-storage-provider';
import CacheHandle from './cache';
import AttackDetectionHandle from './attack-detection';
import ClientPoliciesHandle from './client-policies';
import WorkflowHandle from './workflow';
import ConfidentialBrowserLoginClientHandle from './clients/confidential-browser-login-client';
import PublicBrowserLoginClientHandle from './clients/public-browser-login-client';
import ServiceAccountHandle from './clients/service-account';
import RealmAdminServiceAccountHandle from './clients/realm-admin-service-account';
import { retryTransientAdminError, retryTransientAdminReadError } from './utils/retry';
import { fetchAll } from './utils/fetch-all';
import { mergeUpdateData } from './utils/merge-update-data';
import { assertOwnedHandle } from './utils/resource-ownership';
import { makeHandleIdentityVersion } from './utils/handle-identity';
import { toSinglePageQuery } from './utils/single-page-query';

export const defaultRealmData = Object.freeze({
  enabled: true,
});

export type RealmInputData = Omit<RealmRepresentation, 'realm'>;
export type RealmEnsureInputData = RealmInputData & {
  userProfile?: UserProfileConfig;
};
export type RealmEventsConfigInputData = RealmEventsConfigRepresentation;
export type RealmExportOptions = {
  exportClients?: boolean;
  exportGroupsAndRoles?: boolean;
};
export type RealmLocalizationQuery = {
  page?: number;
  pageSize?: number;
};
export type RealmClientsInitialAccessInputData = {
  count?: number;
  expiration?: number;
};
export type RealmEventsQuery = {
  client?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  page?: number;
  pageSize?: number;
  type?: EventType | EventType[];
  user?: string;
};
export type RealmAdminEventsQuery = {
  authClient?: string;
  authIpAddress?: string;
  authRealm?: string;
  authUser?: string;
  dateFrom?: Date;
  dateTo?: Date;
  operationTypes?: string;
  page?: number;
  pageSize?: number;
  resourcePath?: string;
  resourceTypes?: string;
};

export type RealmUserSearchAttribute = 'username' | 'firstName' | 'lastName' | 'email';

function getRealmUpdateData(realm: RealmRepresentation, data: RealmInputData) {
  return mergeUpdateData(realm, data);
}

export default class RealmHandle {
  public readonly core: KeycloakAdminClient;
  private _realmName: string;
  private _realm?: RealmRepresentation | null;
  private _identityGeneration = 0;

  constructor(core: KeycloakAdminClient, realmName: string) {
    this.core = core;
    this._realmName = realmName;
  }

  public get realmName(): string {
    return this._realmName;
  }

  public get realm(): RealmRepresentation | null | undefined {
    return this._realm;
  }

  public get identityVersion(): string {
    return makeHandleIdentityVersion(this._identityGeneration);
  }

  /**
   * Re-targets this handle to a different realm identity and clears the
   * cached representation. The next read (`get()`/`require*()`) resolves
   * against the new realm. Children created from this handle
   * (`client()`/`user()`/etc.) read `realmName` live, so they follow the
   * rebind automatically (per HANDLE-02's parent-as-source-of-truth
   * contract inherited from HANDLE-01).
   *
   * Returns `this` for chaining.
   */
  public rebind(newRealmName: string): this {
    if (newRealmName === this._realmName) return this;
    this._realmName = newRealmName;
    this._realm = undefined;
    this._identityGeneration++;
    return this;
  }

  public async get(): Promise<RealmRepresentation | null> {
    const one = await retryTransientAdminReadError(() => this.core.realms.findOne({ realm: this._realmName }));
    this._realm = one ?? null;

    if (this._realm?.realm) {
      if (this._realmName !== this._realm.realm) this._identityGeneration++;
      this._realmName = this._realm.realm;
    }

    return this._realm;
  }

  public async getUserProfile(): Promise<UserProfileConfig> {
    return retryTransientAdminReadError(() => this.core.users.getProfile({ realm: this.realmName }));
  }

  public async getUserProfileMetadata(): Promise<UserProfileMetadata> {
    return retryTransientAdminReadError(() => this.core.users.getProfileMetadata({ realm: this.realmName }));
  }

  public async updateUserProfile(data: UserProfileConfig): Promise<UserProfileConfig> {
    const profile = await this.getUserProfile();

    return retryTransientAdminError(() =>
      this.core.users.updateProfile({
        realm: this.realmName,
        ...profile,
        ...data,
      }),
    );
  }

  public async create(data: RealmInputData) {
    if (await this.get()) {
      throw new Error(`Realm "${this.realmName}" already exists`);
    }

    await this.core.realms.create({ ...defaultRealmData, ...data, realm: this.realmName });
    return this.get();
  }

  public async update(data: RealmInputData) {
    const realm = await this.get();
    if (!realm) {
      throw new Error(`Realm "${this.realmName}" not found`);
    }

    await this.core.realms.update({ realm: this.realmName }, getRealmUpdateData(realm, data));
    return this.get();
  }

  public async delete() {
    if (!(await this.get())) {
      throw new Error(`Realm "${this.realmName}" not found`);
    }

    await this.core.realms.del({ realm: this.realmName });
    this._realm = null;
    return this.realmName;
  }

  public async ensure(data: RealmEnsureInputData) {
    const { userProfile, ...realmData } = data;
    const realm = await this.get();

    if (realm) {
      await this.core.realms.update({ realm: this.realmName }, getRealmUpdateData(realm, realmData));
    } else {
      await this.core.realms.create({ ...defaultRealmData, ...realmData, realm: this.realmName });
    }

    if (userProfile) {
      await this.updateUserProfile(userProfile);
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one) {
      await this.core.realms.del({ realm: this.realmName });
      this._realm = null;
    }

    return this.realmName;
  }

  public async partialImport(rep: PartialImportRealmRepresentation): Promise<PartialImportResponse> {
    return retryTransientAdminError(() =>
      this.core.realms.partialImport({
        realm: this.realmName,
        rep,
      }),
    );
  }

  public async export(options?: RealmExportOptions): Promise<RealmRepresentation> {
    return retryTransientAdminReadError(() =>
      this.core.realms.export({
        realm: this.realmName,
        exportClients: options?.exportClients,
        exportGroupsAndRoles: options?.exportGroupsAndRoles,
      }),
    );
  }

  public async listDefaultGroups() {
    return retryTransientAdminReadError(() => this.core.realms.getDefaultGroups({ realm: this.realmName }));
  }

  public async addDefaultGroup(groupHandle: GroupHandle) {
    assertOwnedHandle(this, groupHandle, 'group', `realm "${this.realmName}"`, 'default-group update');
    const group = groupHandle.group ?? (await groupHandle.get());
    if (!group?.id) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    const groupId = group.id;

    await retryTransientAdminError(() => this.core.realms.addDefaultGroup({ realm: this.realmName, id: groupId }));
    return this.listDefaultGroups();
  }

  public async removeDefaultGroup(groupHandle: GroupHandle) {
    assertOwnedHandle(this, groupHandle, 'group', `realm "${this.realmName}"`, 'default-group update');
    const group = groupHandle.group ?? (await groupHandle.get());
    if (!group?.id) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    const groupId = group.id;

    await retryTransientAdminError(() => this.core.realms.removeDefaultGroup({ realm: this.realmName, id: groupId }));
    return this.listDefaultGroups();
  }

  public async getEventsConfig(): Promise<RealmEventsConfigRepresentation> {
    return retryTransientAdminReadError(() => this.core.realms.getConfigEvents({ realm: this.realmName }));
  }

  public async updateEventsConfig(data: RealmEventsConfigInputData) {
    await retryTransientAdminError(() => this.core.realms.updateConfigEvents({ realm: this.realmName }, data));
    return this.getEventsConfig();
  }

  public async findEvents(query?: RealmEventsQuery): Promise<EventRepresentation[]> {
    const { first, max } = toSinglePageQuery(query, 'RealmHandle.findEvents');

    return retryTransientAdminReadError(() =>
      this.core.realms.findEvents({
        realm: this.realmName,
        client: query?.client,
        dateFrom: query?.dateFrom,
        dateTo: query?.dateTo,
        first,
        ipAddress: query?.ipAddress,
        max,
        type: query?.type,
        user: query?.user,
      }),
    );
  }

  public async clearEvents() {
    await retryTransientAdminError(() => this.core.realms.clearEvents({ realm: this.realmName }));
  }

  public async findAdminEvents(query?: RealmAdminEventsQuery): Promise<AdminEventRepresentation[]> {
    const { first, max } = toSinglePageQuery(query, 'RealmHandle.findAdminEvents');

    return retryTransientAdminReadError(() =>
      this.core.realms.findAdminEvents({
        realm: this.realmName,
        authClient: query?.authClient,
        authIpAddress: query?.authIpAddress,
        authRealm: query?.authRealm,
        authUser: query?.authUser,
        dateFrom: query?.dateFrom,
        dateTo: query?.dateTo,
        first,
        max,
        operationTypes: query?.operationTypes,
        resourcePath: query?.resourcePath,
        resourceTypes: query?.resourceTypes,
      }),
    );
  }

  public async clearAdminEvents() {
    await retryTransientAdminError(() => this.core.realms.clearAdminEvents({ realm: this.realmName }));
  }

  public async listClientsInitialAccess(): Promise<ClientInitialAccessPresentation[]> {
    return retryTransientAdminReadError(() => this.core.realms.getClientsInitialAccess({ realm: this.realmName }));
  }

  public async createClientsInitialAccess(data: RealmClientsInitialAccessInputData = {}) {
    return retryTransientAdminError(() => this.core.realms.createClientsInitialAccess({ realm: this.realmName }, data));
  }

  public async deleteClientsInitialAccess(id: string) {
    await retryTransientAdminError(() => this.core.realms.delClientsInitialAccess({ realm: this.realmName, id }));
  }

  public async getUsersManagementPermissions(): Promise<ManagementPermissionReference> {
    return retryTransientAdminReadError(() =>
      this.core.realms.getUsersManagementPermissions({ realm: this.realmName }),
    );
  }

  public async updateUsersManagementPermissions(enabled: boolean): Promise<ManagementPermissionReference> {
    return retryTransientAdminError(() =>
      this.core.realms.updateUsersManagementPermissions({
        realm: this.realmName,
        enabled,
      }),
    );
  }

  public async getClientSessionStats(): Promise<ClientSessionStat[]> {
    return retryTransientAdminReadError(() => this.core.realms.getClientSessionStats({ realm: this.realmName }));
  }

  public async logoutAllSessions() {
    await retryTransientAdminError(() => this.core.realms.logoutAll({ realm: this.realmName }));
  }

  public async removeSession(sessionId: string) {
    await retryTransientAdminError(() => this.core.realms.removeSession({ realm: this.realmName, sessionId }));
  }

  public async deleteSession(session: string, isOffline: boolean) {
    await retryTransientAdminError(() =>
      this.core.realms.deleteSession({
        realm: this.realmName,
        session,
        isOffline,
      }),
    );
  }

  public async pushRevocation() {
    return retryTransientAdminError(() => this.core.realms.pushRevocation({ realm: this.realmName }));
  }

  public async getKeys(): Promise<KeysMetadataRepresentation> {
    return retryTransientAdminReadError(() => this.core.realms.getKeys({ realm: this.realmName }));
  }

  public async listLocales() {
    return retryTransientAdminReadError(() => this.core.realms.getRealmSpecificLocales({ realm: this.realmName }));
  }

  public async getLocalizationTexts(selectedLocale: string, options?: RealmLocalizationQuery) {
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.getLocalizationTexts');

    return retryTransientAdminReadError(() =>
      this.core.realms.getRealmLocalizationTexts({
        realm: this.realmName,
        selectedLocale,
        first,
        max,
      }),
    );
  }

  public async setLocalizationText(selectedLocale: string, key: string, value: string) {
    await retryTransientAdminError(() =>
      this.core.realms.addLocalization(
        {
          realm: this.realmName,
          selectedLocale,
          key,
        },
        value,
      ),
    );

    return this.getLocalizationTexts(selectedLocale);
  }

  public async deleteLocalizationTexts(selectedLocale: string, key?: string) {
    await retryTransientAdminError(() =>
      this.core.realms.deleteRealmLocalizationTexts({
        realm: this.realmName,
        selectedLocale,
        key,
      }),
    );
  }

  public async searchClients(
    keyword: string,
    options?: {
      page?: number;
      pageSize?: number;
      first?: number;
      max?: number;
      search?: boolean;
      viewableOnly?: boolean;
    },
  ) {
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.searchClients');
    const result = await this.core.clients.find({
      realm: this.realmName,
      first,
      max,
      clientId: keyword,
      search: options?.search ?? true,
      viewableOnly: options?.viewableOnly,
    });

    return result;
  }

  public async searchClientsAll(keyword: string, options?: { search?: boolean; viewableOnly?: boolean }) {
    return fetchAll((first, max) =>
      this.core.clients.find({
        realm: this.realmName,
        first,
        max,
        clientId: keyword,
        search: options?.search ?? true,
        viewableOnly: options?.viewableOnly,
      }),
    );
  }

  public async searchClientScopes(keyword: string) {
    const result = await this.core.clientScopes.find({
      realm: this.realmName,
    });

    const lowerkeyword = keyword.toLocaleLowerCase();

    return result.filter((item) => {
      if (!item.name) return false;

      return item.name.toLocaleLowerCase().includes(lowerkeyword);
    });
  }

  public async searchRoles(
    keyword: string,
    options?: { page?: number; pageSize?: number; first?: number; max?: number; briefRepresentation?: boolean },
  ) {
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.searchRoles');

    const result = await this.core.roles.find({
      realm: this.realmName,
      first,
      max,
      search: keyword,
      briefRepresentation: options?.briefRepresentation ?? false,
    });

    return result;
  }

  public async searchRolesAll(keyword: string, options?: { briefRepresentation?: boolean }) {
    return fetchAll((first, max) =>
      this.core.roles.find({
        realm: this.realmName,
        first,
        max,
        search: keyword,
        briefRepresentation: options?.briefRepresentation ?? false,
      }),
    );
  }

  public async searchGroups(
    keyword: string,
    options?: {
      page?: number;
      pageSize?: number;
      first?: number;
      max?: number;
      exact?: boolean;
      briefRepresentation?: boolean;
    },
  ) {
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.searchGroups');

    const result = await this.core.groups.find({
      realm: this.realmName,
      first,
      max,
      search: keyword,
      exact: options?.exact ?? false,
      briefRepresentation: options?.briefRepresentation ?? false,
    });

    return result;
  }

  public async searchGroupsAll(keyword: string, options?: { exact?: boolean; briefRepresentation?: boolean }) {
    return fetchAll((first, max) =>
      this.core.groups.find({
        realm: this.realmName,
        first,
        max,
        search: keyword,
        exact: options?.exact ?? false,
        briefRepresentation: options?.briefRepresentation ?? false,
      }),
    );
  }

  public async searchUsers(
    keyword: string,
    options?: {
      page?: number;
      pageSize?: number;
      first?: number;
      max?: number;
      attribute?: RealmUserSearchAttribute;
      exact?: boolean;
      briefRepresentation?: boolean;
      enabled?: boolean;
    },
  ) {
    const { attribute = 'username' } = options ?? {};
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.searchUsers');
    const searchQuery: {
      realm: string;
      first: number;
      max: number;
      exact: boolean;
      briefRepresentation: boolean;
      enabled?: boolean;
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    } = {
      realm: this.realmName,
      first,
      max,
      exact: options?.exact ?? false,
      briefRepresentation: options?.briefRepresentation ?? false,
      enabled: options?.enabled,
    };

    searchQuery[attribute] = keyword;

    const result = await this.core.users.find({
      ...searchQuery,
    });

    return result;
  }

  public async searchUsersAll(
    keyword: string,
    options?: {
      attribute?: RealmUserSearchAttribute;
      exact?: boolean;
      briefRepresentation?: boolean;
      enabled?: boolean;
    },
  ) {
    const { attribute = 'username' } = options ?? {};

    return fetchAll((first, max) => {
      const searchQuery: {
        realm: string;
        first: number;
        max: number;
        exact: boolean;
        briefRepresentation: boolean;
        enabled?: boolean;
        username?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      } = {
        realm: this.realmName,
        first,
        max,
        exact: options?.exact ?? false,
        briefRepresentation: options?.briefRepresentation ?? false,
        enabled: options?.enabled,
      };

      searchQuery[attribute] = keyword;

      return this.core.users.find(searchQuery);
    });
  }

  public async searchIdentityProviders(keyword: string) {
    const result = await this.core.identityProviders.find({
      realm: this.realmName,
    });

    const lowerkeyword = keyword.toLocaleLowerCase();

    return result.filter((item) => {
      if (!item.alias) return false;

      return item.alias.toLocaleLowerCase().includes(lowerkeyword);
    });
  }

  public async searchOrganizations(
    keyword: string,
    options?: {
      page?: number;
      pageSize?: number;
      first?: number;
      max?: number;
      exact?: boolean;
      briefRepresentation?: boolean;
    },
  ) {
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.searchOrganizations');

    return retryTransientAdminReadError(() =>
      this.core.organizations.find({
        realm: this.realmName,
        search: keyword,
        exact: options?.exact ?? false,
        first,
        max,
        ...(options?.briefRepresentation !== undefined && { briefRepresentation: options.briefRepresentation }),
      } as { realm?: string; search?: string; exact?: boolean; first?: number; max?: number }),
    );
  }

  public async searchOrganizationsAll(keyword: string, options?: { exact?: boolean; briefRepresentation?: boolean }) {
    return fetchAll((first, max) =>
      retryTransientAdminReadError(() =>
        this.core.organizations.find({
          realm: this.realmName,
          search: keyword,
          exact: options?.exact ?? false,
          first,
          max,
          ...(options?.briefRepresentation !== undefined && { briefRepresentation: options.briefRepresentation }),
        } as { realm?: string; search?: string; exact?: boolean; first?: number; max?: number }),
      ),
    );
  }

  public async searchAuthenticationFlows(keyword: string) {
    const flows = await retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getFlows({ realm: this.realmName }),
    );
    const lowerkeyword = keyword.toLocaleLowerCase();

    return flows.filter((item) => {
      if (!item.alias) return false;

      return item.alias.toLocaleLowerCase().includes(lowerkeyword);
    });
  }

  public async searchWorkflows(
    keyword: string,
    options?: { page?: number; pageSize?: number; first?: number; max?: number },
  ): Promise<WorkflowRepresentation[]> {
    const { first, max } = toSinglePageQuery(options, 'RealmHandle.searchWorkflows');

    return retryTransientAdminReadError(
      () =>
        this.core.workflows.find({
          realm: this.realmName,
          search: keyword,
          exact: false,
          first,
          max,
        }) as Promise<WorkflowRepresentation[]>,
    );
  }

  public client(clientId: string) {
    return new ClientHandle(this.core, this, clientId);
  }

  public authenticationFlow(alias: string) {
    return new AuthenticationFlowHandle(this.core, this, alias);
  }

  public component(componentName: string, componentLookup?: ComponentLookupData) {
    return new ComponentHandle(this.core, this, componentName, componentLookup);
  }

  public clientScope(scopeName: string) {
    return new ClientScopeHandle(this.core, this, scopeName);
  }

  public role(roleName: string) {
    return new RoleHandle(this.core, this, roleName);
  }

  public group(groupName: string) {
    return new GroupHandle(this.core, this, groupName);
  }

  public user(username: string) {
    return new UserHandle(this.core, this, username);
  }

  /** Creates a user handle targeted by immutable Keycloak user ID. */
  public userById(id: string) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('Keycloak user ID must be a non-empty string');
    return new UserHandle(this.core, this, id, id);
  }

  public identityProvider(alias: string) {
    return new IdentityProviderHandle(this.core, this, alias);
  }

  public organization(organizationAlias: string) {
    return new OrganizationHandle(this.core, this, organizationAlias);
  }

  public userStorageProvider(providerId: string) {
    return new UserStorageProviderHandle(this.core, this, providerId);
  }

  public cache() {
    return new CacheHandle(this.core, this);
  }

  public attackDetection(userId?: string) {
    return new AttackDetectionHandle(this.core, this, userId);
  }

  public clientPolicies() {
    return new ClientPoliciesHandle(this.core, this);
  }

  public workflow(workflowName: string) {
    return new WorkflowHandle(this.core, this, workflowName);
  }

  public confidentialBrowserLoginClient(clientId: string) {
    return new ConfidentialBrowserLoginClientHandle(this.core, this, clientId);
  }

  public publicBrowserLoginClient(clientId: string) {
    return new PublicBrowserLoginClientHandle(this.core, this, clientId);
  }

  public serviceAccount(clientId: string) {
    return new ServiceAccountHandle(this.core, this, clientId);
  }

  public realmAdminServiceAccount(clientId: string) {
    return new RealmAdminServiceAccountHandle(this.core, this, clientId);
  }
}
