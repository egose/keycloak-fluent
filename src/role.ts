import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import RealmHandle from './realm';
import ClientHandle from './clients/client';
import type ClientRoleHandle from './client-role';
import { retryTransientAdminError } from './utils/retry';

export type RoleInputData = Omit<RoleRepresentation, 'name | id'>;

export default class RoleHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public roleName: string;
  public role?: RoleRepresentation | null;
  public roleData?: RoleInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, roleName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.roleName = roleName;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await core.roles.findOneById({ realm, id });
    return one ?? null;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, roleName: string) {
    const one = await core.roles.findOneByName({ realm, name: roleName });
    return one ?? null;
  }

  private async requireRole(): Promise<RoleRepresentation & { id: string }> {
    const role = this.role ?? (await this.get());
    if (!role?.id) {
      throw new Error(`Role "${this.roleName}" not found in realm "${this.realmName}"`);
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

  public async getById(id: string) {
    this.role = await RoleHandle.getById(this.core, this.realmName, id);

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role;
  }

  public async get(): Promise<RoleRepresentation | null> {
    this.role = await RoleHandle.getByName(this.core, this.realmName, this.roleName);

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role;
  }

  public async create(data: RoleInputData) {
    if (await this.get()) {
      throw new Error(`Role "${this.roleName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.roles.create({ ...data, realm: this.realmName, name: this.roleName });
    return this.get();
  }

  public async update(data: RoleInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.roles.updateById({ realm: this.realmName, id: one.id }, { ...data, name: this.roleName });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.roles.delById({ realm: this.realmName, id: one.id });

    this.role = null;
    return this.roleName;
  }

  public async ensure(data: RoleInputData) {
    this.roleData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.roles.updateById({ realm: this.realmName, id: one.id }, { ...data, name: this.roleName });
    } else {
      await this.core.roles.create({ ...data, realm: this.realmName, name: this.roleName });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.roles.delById({ realm: this.realmName, id: one.id });
      this.role = null;
    }

    return this.roleName;
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
