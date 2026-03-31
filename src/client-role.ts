import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import ClientHandle from './clients/client';

export type ClientRoleInputData = Omit<RoleRepresentation, 'name | id'>;

export default class ClientRoleHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public clientHandle: ClientHandle;
  public clientId: string;
  public client?: ClientRepresentation | null;
  public roleName: string;
  public role?: RoleRepresentation | null;
  public roleData?: ClientRoleInputData;

  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, roleName: string) {
    this.core = core;
    this.clientHandle = clientHandle;
    this.clientId = clientHandle.clientId;
    this.client = clientHandle.client ?? null;
    this.realmName = clientHandle.realmName;
    this.roleName = roleName;
  }

  private getQuery(client: ClientRepresentation) {
    return {
      realm: this.realmName,
      id: client.id!,
      roleName: this.roleName,
    };
  }

  private getData(client: ClientRepresentation) {
    return {
      realm: this.realmName,
      id: client.id!,
      name: this.roleName,
    };
  }

  private async resolveClient() {
    if (this.client?.id) {
      return this.client;
    }

    const client = await ClientHandle.getByClientId(this.core, this.realmName, this.clientId);
    if (!client) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    this.client = client;
    return client;
  }

  static async getByName(
    core: KeycloakAdminClient,
    realm: string,
    clientId: string,
    roleName: string,
    client?: ClientRepresentation | null,
  ) {
    client = client ?? (await ClientHandle.getByClientId(core, realm, clientId));
    if (!client) {
      throw new Error(`Client "${clientId}" not found in realm "${realm}"`);
    }

    const one = await core.clients.findRole({ realm, id: client.id!, roleName });
    return one ?? null;
  }

  public async get(): Promise<RoleRepresentation | null> {
    const client = await this.resolveClient();
    this.role = await ClientRoleHandle.getByName(this.core, this.realmName, this.clientId, this.roleName, client);

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role ?? null;
  }

  public async create(data: ClientRoleInputData) {
    const client = await this.resolveClient();

    if (await this.get()) {
      throw new Error(`Role "${this.roleName}" already exists in client "${client.clientId}"`);
    }

    await this.core.clients.createRole({ ...data, ...this.getData(client) });
    return this.get();
  }

  public async update(data: ClientRoleInputData) {
    const client = await this.resolveClient();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${client.clientId}"`);
    }

    await this.core.clients.updateRole(this.getQuery(client), { ...data, name: this.roleName });
    return this.get();
  }

  public async delete() {
    const client = await this.resolveClient();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${client.clientId}"`);
    }

    await this.core.clients.delRole(this.getQuery(client));

    this.role = null;
    return this.roleName;
  }

  public async ensure(data: ClientRoleInputData) {
    this.roleData = data;
    const client = await this.resolveClient();

    const one = await this.get();

    if (one?.id) {
      await this.core.clients.updateRole(this.getQuery(client), { ...data, name: this.roleName });
    } else {
      await this.core.clients.createRole({ ...data, ...this.getData(client) });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const client = await this.resolveClient();
    const one = await this.get();
    if (one?.id) {
      await this.core.clients.delRole(this.getQuery(client));
      this.role = null;
    }

    return this.roleName;
  }

  public async listAssignedUsers() {
    const client = await this.resolveClient();

    const result = await this.core.clients.findUsersWithRole({
      realm: this.realmName,
      id: client.id!,
      roleName: this.roleName,
    });

    return result;
  }
}
