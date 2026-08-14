import KeycloakAdminClient, {
  type GroupRepresentation,
  type RoleMappingPayload,
  type RoleRepresentation,
  type UserRepresentation,
} from '../keycloak-admin-client';
import type RoleHandle from '../role';
import type ClientHandle from '../clients/client';
import type ClientRoleHandle from '../client-role';
import { getClientByClientId } from '../clients/client-lookup';
import { retryTransientAdminError } from '../utils/retry';
import { fetchAll } from '../utils/fetch-all';
import { assertClientRoleMappingOwnership, assertRealmRoleMappingOwnership } from '../utils/role-ownership';

const groupMembersPageSize = 1000;

export abstract class AbstractGroupHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmName: string;
  private _groupName: string;
  private _group?: GroupRepresentation | null;

  constructor(core: KeycloakAdminClient, realmName: string, groupName: string) {
    this.core = core;
    this.realmName = realmName;
    this._groupName = groupName;
    this._group = null;
  }

  public get groupName(): string {
    return this._groupName;
  }

  public get group(): GroupRepresentation | null | undefined {
    return this._group;
  }

  /**
   * @internal Write-back used by `getById()`/`get()`/`resolveParentGroup()` to
   * populate this handle's cached representation after a resolution and to
   * canonicalize the group name from the server (Keycloak may return a
   * different name casing). Not part of the public contract; do not call
   * from application code. Identity changes belong to {@link rebind}.
   */
  protected _setResolvedGroup(rep: GroupRepresentation | null, canonicalGroupName?: string): void {
    this._group = rep;
    if (canonicalGroupName !== undefined) {
      this._groupName = canonicalGroupName;
    }
  }

  /**
   * Re-targets this handle to a different group name and clears the cached
   * representation. Subclasses inherit this; child group handles that hold
   * a parent handle rebind their own name only (per HANDLE-01 the parent is
   * the source of truth for parent identity). Returns `this` for chaining.
   */
  public rebind(newGroupName: string): this {
    this._groupName = newGroupName;
    this._group = undefined;
    return this;
  }

  public abstract get(): Promise<GroupRepresentation | null>;

  protected async requireGroup(): Promise<GroupRepresentation & { id: string }> {
    const group = this.group ?? (await this.get());
    if (!group?.id) {
      throw new Error(`Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    return group as GroupRepresentation & { id: string };
  }

  protected async resolveRealmRole(roleHandle: RoleHandle) {
    const role = roleHandle.role ?? (await roleHandle.get());
    if (!role) {
      throw new Error(`Role "${roleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    return role;
  }

  protected async resolveClientRole(clientRoleHandle: ClientRoleHandle) {
    let client = clientRoleHandle.client ?? null;
    if (!client) {
      client = (await getClientByClientId(this.core, this.realmName, clientRoleHandle.clientHandle.clientId)) ?? null;
    }

    if (!client) {
      throw new Error(`Client "${clientRoleHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    const role = clientRoleHandle.role ?? (await clientRoleHandle.get());
    if (!role) {
      throw new Error(`Client Role "${clientRoleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    return { client, role };
  }

  protected async getWithRetry(attempts = 4, delayMs = 50): Promise<GroupRepresentation | null> {
    let group: GroupRepresentation | null = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      group = await this.get();
      if (group) {
        return group;
      }

      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }

    return group;
  }

  public async listAssignedUsers(options?: { briefRepresentation?: boolean }) {
    const one = await this.requireGroup();

    return fetchAll(
      (first, max) =>
        retryTransientAdminError(() =>
          this.core.groups.listMembers({
            realm: this.realmName,
            id: one.id,
            first,
            max,
            briefRepresentation: options?.briefRepresentation ?? false,
          }),
        ),
      { pageSize: groupMembersPageSize },
    );
  }

  public async assignRole(roleHandle: RoleHandle) {
    assertRealmRoleMappingOwnership(this.core, this.realmName, roleHandle, `group "${this.groupName}"`);
    const group = await this.requireGroup();
    const role = await this.resolveRealmRole(roleHandle);
    const groupId = group.id;

    await retryTransientAdminError(() =>
      this.core.groups.addRealmRoleMappings({
        realm: this.realmName,
        id: groupId,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async unassignRole(roleHandle: RoleHandle) {
    assertRealmRoleMappingOwnership(this.core, this.realmName, roleHandle, `group "${this.groupName}"`);
    const group = await this.requireGroup();
    const role = await this.resolveRealmRole(roleHandle);
    const groupId = group.id;

    await retryTransientAdminError(() =>
      this.core.groups.delRealmRoleMappings({
        realm: this.realmName,
        id: groupId,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async listAssignedRoles() {
    const group = await this.requireGroup();
    const groupId = group.id;

    return retryTransientAdminError(() =>
      this.core.groups.listRealmRoleMappings({
        realm: this.realmName,
        id: groupId,
      }),
    );
  }

  public async assignClientRole(clientRoleHandle: ClientRoleHandle) {
    assertClientRoleMappingOwnership(
      this.core,
      this.realmName,
      clientRoleHandle.clientHandle,
      clientRoleHandle,
      `group "${this.groupName}"`,
    );
    const group = await this.requireGroup();
    const { client, role } = await this.resolveClientRole(clientRoleHandle);
    const groupId = group.id;
    const clientUniqueId = client.id!;

    await retryTransientAdminError(() =>
      this.core.groups.addClientRoleMappings({
        realm: this.realmName,
        id: groupId,
        clientUniqueId,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async unassignClientRole(clientRoleHandle: ClientRoleHandle) {
    assertClientRoleMappingOwnership(
      this.core,
      this.realmName,
      clientRoleHandle.clientHandle,
      clientRoleHandle,
      `group "${this.groupName}"`,
    );
    const group = await this.requireGroup();
    const { client, role } = await this.resolveClientRole(clientRoleHandle);
    const groupId = group.id;
    const clientUniqueId = client.id!;

    await retryTransientAdminError(() =>
      this.core.groups.delClientRoleMappings({
        realm: this.realmName,
        id: groupId,
        clientUniqueId,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async listAssignedClientRoles(clientHandle: ClientHandle): Promise<RoleRepresentation[]> {
    const group = await this.requireGroup();
    const groupId = group.id;
    const client = clientHandle.client ?? (await getClientByClientId(this.core, this.realmName, clientHandle.clientId));
    if (!client) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    const clientUniqueId = client.id!;

    return retryTransientAdminError(() =>
      this.core.groups.listClientRoleMappings({
        realm: this.realmName,
        id: groupId,
        clientUniqueId,
      }),
    );
  }
}
