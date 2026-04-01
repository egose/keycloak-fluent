import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import ClientHandle from './clients/client';
import type RoleHandle from './role';

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

  private async requireRole(): Promise<RoleRepresentation & { id: string }> {
    const role = this.role ?? (await this.get());
    if (!role?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${this.clientId}"`);
    }

    return role as RoleRepresentation & { id: string };
  }

  private async resolveCompositeRole(roleHandle: RoleHandle | ClientRoleHandle) {
    const role = roleHandle.role ?? (await roleHandle.get());
    if (!role) {
      throw new Error(`Role "${roleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    return role;
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

  public async addComposite(roleHandle: RoleHandle | ClientRoleHandle) {
    const role = await this.requireRole();
    const compositeRole = await this.resolveCompositeRole(roleHandle);
    const roleId = role.id;

    await retryTransientAdminError(() =>
      this.core.roles.createComposite({ realm: this.realmName, roleId }, [compositeRole]),
    );

    return this;
  }

  public async removeComposite(roleHandle: RoleHandle | ClientRoleHandle) {
    const role = await this.requireRole();
    const compositeRole = await this.resolveCompositeRole(roleHandle);
    const roleId = role.id;

    await retryTransientAdminError(() =>
      this.core.roles.delCompositeRoles({ realm: this.realmName, id: roleId }, [compositeRole]),
    );

    return this;
  }

  public async listComposites(options?: { keyword?: string; page?: number; pageSize?: number }) {
    const role = await this.requireRole();
    const roleId = role.id;
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.max(1, options?.pageSize ?? 100);

    return retryTransientAdminError(() =>
      this.core.roles.getCompositeRoles({
        realm: this.realmName,
        id: roleId,
        search: options?.keyword,
        first: (page - 1) * pageSize,
        max: pageSize,
      }),
    );
  }

  public async listRealmComposites() {
    const role = await this.requireRole();
    const roleId = role.id;

    return retryTransientAdminError(() =>
      this.core.roles.getCompositeRolesForRealm({
        realm: this.realmName,
        id: roleId,
      }),
    );
  }

  public async listClientComposites(clientHandle: ClientHandle) {
    const role = await this.requireRole();
    const roleId = role.id;
    const client =
      clientHandle.client ?? (await ClientHandle.getByClientId(this.core, this.realmName, clientHandle.clientId));
    if (!client) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    const clientId = client.id!;

    return retryTransientAdminError(() =>
      this.core.roles.getCompositeRolesForClient({
        realm: this.realmName,
        id: roleId,
        clientId,
      }),
    );
  }
}
