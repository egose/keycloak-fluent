import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import ClientHandle from './client';

export default class ClientRoleHandle {
  public core: KeycloakAdminClient;
  public realm: RealmRepresentation;
  public clientHandle: ClientHandle;
  public client: ClientRepresentation;
  public roleName: string;
  public role?: RoleRepresentation | null;
  public roleData?: RoleRepresentation;

  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, roleName: string) {
    this.core = core;
    this.clientHandle = clientHandle;
    this.client = clientHandle.client!;
    this.realm = clientHandle.realm;
    this.roleName = roleName;
  }

  public async get(): Promise<RoleRepresentation | null> {
    this.role = await this.core.roles.findOneByName({ realm: this.realm.realm, name: this.roleName });

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role ?? null;
  }

  public async create(data: RoleRepresentation) {
    if (await this.get()) {
      throw new Error(`Role "${this.roleName}" already exists in client "${this.client.clientId}"`);
    }

    await this.core.roles.create({ ...data, realm: this.realm.realm });
    return this.get();
  }

  public async update(data: RoleRepresentation) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${this.client.clientId}"`);
    }

    await this.core.roles.update({ realm: this.realm.realm, id: one.id }, { ...data, clientId: this.clientId });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${this.client.clientId}"`);
    }

    await this.core.roles.del({ realm: this.realm.realm, id: one.id });
    this.client = null;
    return this.clientId;
  }

  public async ensure(data: RoleRepresentation) {
    this.clientData = data;
    const payload = { ...data, clientId: this.clientId };
    const one = await this.get();

    if (one?.id) {
      await this.core.roles.update({ realm: this.realm.realm, id: one.id }, payload);
    } else {
      await this.core.roles.create(payload);
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.roles.del({ realm: this.realm.realm, id: one.id });
      this.client = null;
    }

    return this.clientId;
  }
}
