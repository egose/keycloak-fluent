import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type AdminEventRepresentation from '@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation';
import type { ClientSessionStat } from '@keycloak/keycloak-admin-client/lib/defs/clientSessionStat';
import type ClientInitialAccessPresentation from '@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation';
import type EventRepresentation from '@keycloak/keycloak-admin-client/lib/defs/eventRepresentation';
import type EventType from '@keycloak/keycloak-admin-client/lib/defs/eventTypes';
import type KeysMetadataRepresentation from '@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation';
import type { ManagementPermissionReference } from '@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference';
import type { RealmEventsConfigRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation';
import type WorkflowRepresentation from '@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation';
import RealmRepresentation, {
  type PartialImportRealmRepresentation,
  type PartialImportResponse,
} from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
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
import { retryTransientAdminError } from './utils/retry';

export const defaultRealmData = Object.freeze({
  enabled: true,
});

export type RealmInputData = Omit<RealmRepresentation, 'realm'>;
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

function getPaginationParams(options?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 100);

  return {
    first: (page - 1) * pageSize,
    max: pageSize,
  };
}

function getRealmUpdateData(realm: RealmRepresentation, data: RealmInputData) {
  return _merge({}, realm, data);
}

export default class RealmHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public realm?: RealmRepresentation | null;
  public realmData?: RealmInputData;

  constructor(core: KeycloakAdminClient, realmName: string) {
    this.core = core;
    this.realmName = realmName;
  }

  public async get(): Promise<RealmRepresentation | null> {
    const one = await retryTransientAdminError(() => this.core.realms.findOne({ realm: this.realmName }));
    this.realm = one ?? null;

    if (this.realm?.realm) {
      this.realmName = this.realm.realm;
    }

    return this.realm;
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
    this.realm = null;
    return this.realmName;
  }

  public async ensure(data: RealmInputData) {
    this.realmData = data;

    const realm = await this.get();
    if (realm) {
      await this.core.realms.update({ realm: this.realmName }, getRealmUpdateData(realm, data));
    } else {
      await this.core.realms.create({ ...defaultRealmData, ...data, realm: this.realmName });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one) {
      await this.core.realms.del({ realm: this.realmName });
      this.realm = null;
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
    return retryTransientAdminError(() =>
      this.core.realms.export({
        realm: this.realmName,
        exportClients: options?.exportClients,
        exportGroupsAndRoles: options?.exportGroupsAndRoles,
      }),
    );
  }

  public async listDefaultGroups() {
    return retryTransientAdminError(() => this.core.realms.getDefaultGroups({ realm: this.realmName }));
  }

  public async addDefaultGroup(groupHandle: GroupHandle) {
    const group = groupHandle.group ?? (await groupHandle.get());
    if (!group?.id) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    const groupId = group.id;

    await retryTransientAdminError(() => this.core.realms.addDefaultGroup({ realm: this.realmName, id: groupId }));
    return this.listDefaultGroups();
  }

  public async removeDefaultGroup(groupHandle: GroupHandle) {
    const group = groupHandle.group ?? (await groupHandle.get());
    if (!group?.id) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    const groupId = group.id;

    await retryTransientAdminError(() => this.core.realms.removeDefaultGroup({ realm: this.realmName, id: groupId }));
    return this.listDefaultGroups();
  }

  public async getEventsConfig(): Promise<RealmEventsConfigRepresentation> {
    return retryTransientAdminError(() => this.core.realms.getConfigEvents({ realm: this.realmName }));
  }

  public async updateEventsConfig(data: RealmEventsConfigInputData) {
    await retryTransientAdminError(() => this.core.realms.updateConfigEvents({ realm: this.realmName }, data));
    return this.getEventsConfig();
  }

  public async findEvents(query?: RealmEventsQuery): Promise<EventRepresentation[]> {
    const { first, max } = getPaginationParams(query);

    return retryTransientAdminError(() =>
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
    const { first, max } = getPaginationParams(query);

    return retryTransientAdminError(() =>
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
    return retryTransientAdminError(() => this.core.realms.getClientsInitialAccess({ realm: this.realmName }));
  }

  public async createClientsInitialAccess(data: RealmClientsInitialAccessInputData = {}) {
    return retryTransientAdminError(() => this.core.realms.createClientsInitialAccess({ realm: this.realmName }, data));
  }

  public async deleteClientsInitialAccess(id: string) {
    await retryTransientAdminError(() => this.core.realms.delClientsInitialAccess({ realm: this.realmName, id }));
  }

  public async getUsersManagementPermissions(): Promise<ManagementPermissionReference> {
    return retryTransientAdminError(() => this.core.realms.getUsersManagementPermissions({ realm: this.realmName }));
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
    return retryTransientAdminError(() => this.core.realms.getClientSessionStats({ realm: this.realmName }));
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
    return retryTransientAdminError(() => this.core.realms.getKeys({ realm: this.realmName }));
  }

  public async listLocales() {
    return retryTransientAdminError(() => this.core.realms.getRealmSpecificLocales({ realm: this.realmName }));
  }

  public async getLocalizationTexts(selectedLocale: string, options?: RealmLocalizationQuery) {
    const { first, max } = getPaginationParams(options);

    return retryTransientAdminError(() =>
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

  public async searchClients(keyword: string, options?: { page?: number; pageSize?: number }) {
    const { first, max } = getPaginationParams(options);
    const result = await this.core.clients.find({
      realm: this.realmName,
      first,
      max,
      clientId: keyword,
      search: true,
    });

    return result;
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

  public async searchRoles(keyword: string, options?: { page?: number; pageSize?: number }) {
    const { first, max } = getPaginationParams(options);

    const result = await this.core.roles.find({
      realm: this.realmName,
      first,
      max,
      search: keyword,
      briefRepresentation: false,
    });

    return result;
  }

  public async searchGroups(keyword: string, options?: { page?: number; pageSize?: number }) {
    const { first, max } = getPaginationParams(options);

    const result = await this.core.groups.find({
      realm: this.realmName,
      first,
      max,
      search: keyword,
      exact: false,
      briefRepresentation: false,
    });

    return result;
  }

  public async searchUsers(
    keyword: string,
    options?: { page?: number; pageSize?: number; attribute?: 'username' | 'firstName' | 'lastName' | 'email' },
  ) {
    const { attribute = 'username' } = options ?? {};
    const { first, max } = getPaginationParams(options);

    const result = await this.core.users.find({
      realm: this.realmName,
      first,
      max,
      q: `${attribute}:${keyword}`,
      exact: false,
      briefRepresentation: false,
    });

    return result;
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

  public async searchOrganizations(keyword: string, options?: { page?: number; pageSize?: number }) {
    const { first, max } = getPaginationParams(options);

    return retryTransientAdminError(() =>
      this.core.organizations.find({
        realm: this.realmName,
        search: keyword,
        exact: false,
        first,
        max,
      }),
    );
  }

  public async searchAuthenticationFlows(keyword: string) {
    const flows = await retryTransientAdminError(() =>
      this.core.authenticationManagement.getFlows({ realm: this.realmName }),
    );
    const lowerkeyword = keyword.toLocaleLowerCase();

    return flows.filter((item) => {
      if (!item.alias) return false;

      return item.alias.toLocaleLowerCase().includes(lowerkeyword);
    });
  }

  public async searchWorkflows(keyword: string, options?: { page?: number; pageSize?: number }) {
    const workflows = await retryTransientAdminError(
      () => this.core.workflows.find({ realm: this.realmName }) as Promise<WorkflowRepresentation[]>,
    );
    const lowerkeyword = keyword.toLocaleLowerCase();
    const filtered = workflows.filter((item) => {
      if (!item.name) return false;

      return item.name.toLocaleLowerCase().includes(lowerkeyword);
    });

    const { first, max } = getPaginationParams(options);
    return filtered.slice(first, first + max);
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
