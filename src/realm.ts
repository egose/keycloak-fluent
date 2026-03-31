import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type AdminEventRepresentation from '@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation';
import type EventRepresentation from '@keycloak/keycloak-admin-client/lib/defs/eventRepresentation';
import type EventType from '@keycloak/keycloak-admin-client/lib/defs/eventTypes';
import type { RealmEventsConfigRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import ClientHandle from './clients/client';
import ClientScopeHandle from './client-scope';
import AuthenticationFlowHandle from './authentication-flow';
import RoleHandle from './role';
import GroupHandle from './groups/group';
import UserHandle from './user';
import IdentityProviderHandle from './identity-provider';

function isTransientAdminError(error: unknown) {
  return error instanceof Error && error.message.includes('unknown_error');
}

async function retryTransientAdminError<T>(operation: () => Promise<T>, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientAdminError(error) || attempt === attempts - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }

  throw new Error('Unreachable');
}
import ConfidentialBrowserLoginClientHandle from './clients/confidential-browser-login-client';
import PublicBrowserLoginClientHandle from './clients/public-browser-login-client';
import ServiceAccountHandle from './clients/service-account';
import RealmAdminServiceAccountHandle from './clients/realm-admin-service-account';

export const defaultRealmData = Object.freeze({
  enabled: true,
});

export type RealmInputData = Omit<RealmRepresentation, 'realm'>;
export type RealmEventsConfigInputData = RealmEventsConfigRepresentation;
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
    if (!(await this.get())) {
      throw new Error(`Realm "${this.realmName}" not found`);
    }

    await this.core.realms.update({ realm: this.realmName }, { ...data });
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

    const one = await this.get();
    if (one) {
      await this.core.realms.update({ realm: this.realmName }, { ...data });
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

  public client(clientId: string) {
    return new ClientHandle(this.core, this, clientId);
  }

  public authenticationFlow(alias: string) {
    return new AuthenticationFlowHandle(this.core, this, alias);
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
