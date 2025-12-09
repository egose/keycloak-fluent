import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
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
