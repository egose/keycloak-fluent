import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RoleRepresentation, { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import type RoleHandle from '../role';
import type ClientHandle from '../clients/client';
import type ClientRoleHandle from '../client-role';
import { getClientByClientId } from '../clients/client-lookup';
import { retryTransientAdminError } from '../utils/retry';

const groupMembersPageSize = 1000;

export abstract class AbstractGroupHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public groupName: string;
  public group?: GroupRepresentation | null;

  constructor(core: KeycloakAdminClient, realmName: string, groupName: string) {
    this.core = core;
    this.realmName = realmName;
    this.groupName = groupName;
    this.group = null;
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

  public async listAssignedUsers() {
    const one = await this.requireGroup();
    const result: UserRepresentation[] = [];

    for (let first = 0; ; first += groupMembersPageSize) {
      const page = await retryTransientAdminError(() =>
        this.core.groups.listMembers({
          realm: this.realmName,
          id: one.id,
          first,
          max: groupMembersPageSize,
          briefRepresentation: false,
        }),
      );

      result.push(...page);

      if (page.length < groupMembersPageSize) {
        return result;
      }
    }
  }

  public async assignRole(roleHandle: RoleHandle) {
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
