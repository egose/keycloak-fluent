import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, { type RoleRepresentation } from './keycloak-admin-client';
import RealmHandle from './realm';
import type ClientHandle from './clients/client';
import type ClientRoleHandle from './client-role';
import { getClientByClientId } from './clients/client-lookup';
import { retryTransientAdminError, retryTransientAdminReadError } from './utils/retry';
import { fetchAll } from './utils/fetch-all';
import {
  assertOwnedHandle,
  assertSameResourceOwner,
  describeResourceHandle,
  getResourceKind,
} from './utils/resource-ownership';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';
import { toSinglePageQuery } from './utils/single-page-query';

export type RoleInputData = Omit<RoleRepresentation, 'name' | 'id'>;

function getRoleUpdateData(role: RoleRepresentation, data: RoleInputData, roleName: string) {
  return mergeUpdateData(role, data, { name: roleName });
}

export default class RoleHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  private _roleName: string;
  private _role?: RoleRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, roleName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this._roleName = roleName;
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._role = undefined))) {
      this._identityGeneration++;
    }
  }

  public get realmName(): string {
    return this.realmHandle.realmName;
  }

  public get identityVersion(): string {
    this.invalidateParentCache();
    return makeHandleIdentityVersion(this._identityGeneration, this.realmHandle);
  }

  public get roleName(): string {
    return this._roleName;
  }

  public get role(): RoleRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._role;
  }

  /**
   * Re-targets this handle to a different role identity and clears the
   * cached representation. The next read (`get()`/`requireRole()` or any
   * dependent operation) resolves against the new role name. Returns `this`
   * for chaining.
   */
  public rebind(newRoleName: string): this {
    if (newRoleName === this._roleName) return this;
    this._roleName = newRoleName;
    this._role = undefined;
    this._identityGeneration++;
    return this;
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

  private assertCompositeRoleOwnership(roleHandle: RoleHandle | ClientRoleHandle) {
    const kind = getResourceKind(roleHandle);
    if (kind !== 'realm role' && kind !== 'client role') {
      throw new Error(
        `${describeResourceHandle(roleHandle)} is not a role; role "${this.roleName}" cannot update composites`,
      );
    }
    assertSameResourceOwner(
      this,
      roleHandle,
      describeResourceHandle(roleHandle),
      `role "${this.roleName}"`,
      'composite role update',
    );
  }

  public async getById(id: string) {
    this.invalidateParentCache();
    this._role = await RoleHandle.getById(this.core, this.realmName, id);

    if (this._role) {
      if (this._roleName !== this._role.name) this._identityGeneration++;
      this._roleName = this._role.name!;
    }

    return this.role ?? null;
  }

  public async get(): Promise<RoleRepresentation | null> {
    this.invalidateParentCache();
    this._role = await RoleHandle.getByName(this.core, this.realmName, this.roleName);

    if (this._role) {
      if (this._roleName !== this._role.name) this._identityGeneration++;
      this._roleName = this._role.name!;
    }

    return this.role ?? null;
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

    await this.core.roles.updateById(
      { realm: this.realmName, id: one.id },
      getRoleUpdateData(one, data, this.roleName),
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.roles.delById({ realm: this.realmName, id: one.id });

    this._role = null;
    return this.roleName;
  }

  public async ensure(data: RoleInputData) {
    const one = await this.get();

    if (one?.id) {
      await this.core.roles.updateById(
        { realm: this.realmName, id: one.id },
        getRoleUpdateData(one, data, this.roleName),
      );
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
      this._role = null;
    }

    return this.roleName;
  }

  public async addComposite(roleHandle: RoleHandle | ClientRoleHandle) {
    this.assertCompositeRoleOwnership(roleHandle);
    const role = await this.requireRole();
    const compositeRole = await this.resolveCompositeRole(roleHandle);
    const roleId = role.id;

    await retryTransientAdminError(() =>
      this.core.roles.createComposite({ realm: this.realmName, roleId }, [compositeRole]),
    );

    return this;
  }

  public async removeComposite(roleHandle: RoleHandle | ClientRoleHandle) {
    this.assertCompositeRoleOwnership(roleHandle);
    const role = await this.requireRole();
    const compositeRole = await this.resolveCompositeRole(roleHandle);
    const roleId = role.id;

    await retryTransientAdminError(() =>
      this.core.roles.delCompositeRoles({ realm: this.realmName, id: roleId }, [compositeRole]),
    );

    return this;
  }

  public async listComposites(options?: {
    keyword?: string;
    page?: number;
    pageSize?: number;
    first?: number;
    max?: number;
  }) {
    const { first, max } = toSinglePageQuery(options, 'RoleHandle.listComposites');
    const role = await this.requireRole();
    const roleId = role.id;

    return retryTransientAdminReadError(() =>
      this.core.roles.getCompositeRoles({
        realm: this.realmName,
        id: roleId,
        search: options?.keyword,
        first,
        max,
      }),
    );
  }

  public async listCompositesAll(options?: { keyword?: string }) {
    const role = await this.requireRole();
    const roleId = role.id;

    return fetchAll((first, max) =>
      retryTransientAdminReadError(() =>
        this.core.roles.getCompositeRoles({
          realm: this.realmName,
          id: roleId,
          search: options?.keyword,
          first,
          max,
        }),
      ),
    );
  }

  public async listRealmComposites() {
    const role = await this.requireRole();
    const roleId = role.id;

    return retryTransientAdminReadError(() =>
      this.core.roles.getCompositeRolesForRealm({
        realm: this.realmName,
        id: roleId,
      }),
    );
  }

  public async listClientComposites(clientHandle: ClientHandle) {
    assertOwnedHandle(this, clientHandle, 'client', `role "${this.roleName}"`, 'client composite read');
    const role = await this.requireRole();
    const roleId = role.id;
    const client = clientHandle.client ?? (await getClientByClientId(this.core, this.realmName, clientHandle.clientId));
    if (!client) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    const clientId = client.id!;

    return retryTransientAdminReadError(() =>
      this.core.roles.getCompositeRolesForClient({
        realm: this.realmName,
        id: roleId,
        clientId,
      }),
    );
  }
}
