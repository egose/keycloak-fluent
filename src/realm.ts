import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import { ClientQuery } from '@keycloak/keycloak-admin-client/lib/resources/clients';
import ClientHandle from './clients/client';
import ClientScopeHandle from './client-scope';
import RoleHandle from './role';
import GroupHandle from './groups/group';
import UserHandle from './user';
import IdentityProviderHandle from './identity-provider';
import ConfidentialBrowserLoginClientHandle from './clients/confidential-browser-login-client';
import PublicBrowserLoginClientHandle from './clients/public-browser-login-client';
import ServiceAccountHandle from './clients/service-account';
import RealmAdminServiceAccountHandle from './clients/realm-admin-service-account';

export const defaultRealmData = Object.freeze({
  enabled: true,
});

export type RealmInputData = Omit<RealmRepresentation, 'realm'>;

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
    const one = await this.core.realms.findOne({ realm: this.realmName });
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

  public async searchClients(keyword: string, options?: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 100 } = options ?? {};
    const result = await this.core.clients.find({
      realm: this.realmName,
      first: page - 1,
      max: pageSize,
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
    const { page = 1, pageSize = 100 } = options ?? {};

    const result = await this.core.roles.find({
      realm: this.realmName,
      first: page - 1,
      max: pageSize,
      search: keyword,
      briefRepresentation: false,
    });

    return result;
  }

  public async searchGroups(keyword: string, options?: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 100 } = options ?? {};

    const result = await this.core.groups.find({
      realm: this.realmName,
      first: page - 1,
      max: pageSize,
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
    const { page = 1, pageSize = 100, attribute = 'username' } = options ?? {};

    const result = await this.core.users.find({
      realm: this.realmName,
      first: page - 1,
      max: pageSize,
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

  public client(clientId: string) {
    return new ClientHandle(this.core, this, clientId);
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
