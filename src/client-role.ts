import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, { type ClientRepresentation, type RoleRepresentation } from './keycloak-admin-client';
import type ClientHandle from './clients/client';
import { getClientByClientId } from './clients/client-lookup';
import type RoleHandle from './role';
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

export type ClientRoleInputData = Omit<RoleRepresentation, 'name' | 'id'>;

function getClientRoleUpdateData(role: RoleRepresentation, data: ClientRoleInputData, roleName: string) {
  return mergeUpdateData(role, data, { name: roleName });
}

export default class ClientRoleHandle {
  public readonly core: KeycloakAdminClient;
  public readonly clientHandle: ClientHandle;
  private _roleName: string;
  private _role?: RoleRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, roleName: string) {
    this.core = core;
    this.clientHandle = clientHandle;
    this._roleName = roleName;
    this.parentIdentity = new ParentIdentityTracker(clientHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._role = undefined))) {
      this._identityGeneration++;
    }
  }

  public get realmName(): string {
    return this.clientHandle.realmName;
  }

  public get identityVersion(): string {
    this.invalidateParentCache();
    return makeHandleIdentityVersion(this._identityGeneration, this.clientHandle);
  }

  public get roleName(): string {
    return this._roleName;
  }

  public get role(): RoleRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._role;
  }

  /**
   * Re-targets this client-role handle to a different role name and clears
   * the cached role representation. Returns `this` for chaining.
   */
  public rebind(newRoleName: string): this {
    if (newRoleName === this._roleName) return this;
    this._roleName = newRoleName;
    this._role = undefined;
    this._identityGeneration++;
    return this;
  }

  public get clientId(): string {
    return this.clientHandle.client?.clientId ?? this.clientHandle.clientId;
  }

  public get client(): ClientRepresentation | null {
    return this.clientHandle.client ?? null;
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

  private getCurrentClientId() {
    return this.clientHandle.client?.clientId ?? this.clientHandle.clientId;
  }

  private async resolveClient() {
    if (this.clientHandle.client?.id) {
      return this.clientHandle.client;
    }

    const clientId = this.getCurrentClientId();
    const client = await getClientByClientId(this.core, this.realmName, clientId);
    if (!client) {
      throw new Error(`Client "${clientId}" not found in realm "${this.realmName}"`);
    }

    this.clientHandle._setResolvedClient(client, client.clientId ?? clientId);
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

  private assertCompositeRoleOwnership(roleHandle: RoleHandle | ClientRoleHandle) {
    const kind = getResourceKind(roleHandle);
    if (kind !== 'realm role' && kind !== 'client role') {
      throw new Error(
        `${describeResourceHandle(roleHandle)} is not a role; client role "${this.roleName}" cannot update composites`,
      );
    }
    assertSameResourceOwner(
      this,
      roleHandle,
      describeResourceHandle(roleHandle),
      `client role "${this.roleName}"`,
      'composite role update',
    );
  }

  static async getByName(
    core: KeycloakAdminClient,
    realm: string,
    clientId: string,
    roleName: string,
    client?: ClientRepresentation | null,
  ) {
    client = client ?? (await getClientByClientId(core, realm, clientId));
    if (!client) {
      throw new Error(`Client "${clientId}" not found in realm "${realm}"`);
    }

    const one = await core.clients.findRole({ realm, id: client.id!, roleName });
    return one ?? null;
  }

  public async get(): Promise<RoleRepresentation | null> {
    this.invalidateParentCache();
    const client = await this.resolveClient();
    this._role = await ClientRoleHandle.getByName(this.core, this.realmName, this.clientId, this.roleName, client);

    if (this._role) {
      if (this._roleName !== this._role.name) this._identityGeneration++;
      this._roleName = this._role.name!;
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

    await this.core.clients.updateRole(this.getQuery(client), getClientRoleUpdateData(one, data, this.roleName));
    return this.get();
  }

  public async delete() {
    const client = await this.resolveClient();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in client "${client.clientId}"`);
    }

    await this.core.clients.delRole(this.getQuery(client));

    this._role = null;
    return this.roleName;
  }

  public async ensure(data: ClientRoleInputData) {
    const client = await this.resolveClient();

    const one = await this.get();

    if (one?.id) {
      await this.core.clients.updateRole(this.getQuery(client), getClientRoleUpdateData(one, data, this.roleName));
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
      this._role = null;
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
    const { first, max } = toSinglePageQuery(options, 'ClientRoleHandle.listComposites');
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
    assertOwnedHandle(this, clientHandle, 'client', `client role "${this.roleName}"`, 'client composite read');
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
