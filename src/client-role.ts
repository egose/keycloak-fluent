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
  public roleData?: Omit<RoleRepresentation, 'name | id'>;

  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, roleName: string) {
    this.core = core;
    this.clientHandle = clientHandle;
    this.client = clientHandle.client!;
    this.realm = clientHandle.realm;
    this.roleName = roleName;
  }

  private get query() {
    return {
      realm: this.realm.realm,
      id: this.client.id!,
      roleName: this.roleName,
    };
  }

  private get data() {
    return {
      realm: this.realm.realm,
      id: this.client.id!,
      name: this.roleName,
    };
  }

  public async get(): Promise<RoleRepresentation | null> {
    this.role = await this.core.clients.findRole(this.query);

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role ?? null;
  }

  public async create(data: Omit<RoleRepresentation, 'name | id'>) {
    if (await this.get()) {
      throw new Error(`Role "${this.roleName}" already exists in client "${this.client.clientId}"`);
    }

    await this.core.clients.createRole({ ...data, ...this.data });
    return this.get();
  }

  public async update(data: Omit<RoleRepresentation, 'name | id'>) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${this.client.clientId}"`);
    }

    await this.core.clients.updateRole(this.query, { ...data, name: this.roleName });
    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${this.client.clientId}"`);
    }

    await this.core.clients.delRole(this.query);

    this.role = null;
    return this.roleName;
  }

  public async ensure(data: Omit<RoleRepresentation, 'name | id'>) {
    this.roleData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.clients.updateRole(this.query, { ...data, name: this.roleName });
    } else {
      await this.core.clients.createRole({ ...data, ...this.data });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.clients.delRole(this.query);
      this.role = null;
    }

    return this.roleName;
  }
}
