import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RoleRepresentation, { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import type RoleHandle from '../role';
import ClientHandle from '../clients/client';
import type ClientRoleHandle from '../client-role';

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
      client = (await ClientHandle.getByClientId(this.core, this.realmName, clientRoleHandle.clientId)) ?? null;
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

    const result = await this.core.groups.listMembers({
      realm: this.realmName,
      id: one.id,
      first: 0,
      max: 1000,
      briefRepresentation: false,
    });

    return result;
  }

  public async assignRole(roleHandle: RoleHandle) {
    const group = await this.requireGroup();
    const role = await this.resolveRealmRole(roleHandle);

    await retryTransientAdminError(() =>
      this.core.groups.addRealmRoleMappings({
        realm: this.realmName,
        id: group.id,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async unassignRole(roleHandle: RoleHandle) {
    const group = await this.requireGroup();
    const role = await this.resolveRealmRole(roleHandle);

    await retryTransientAdminError(() =>
      this.core.groups.delRealmRoleMappings({
        realm: this.realmName,
        id: group.id,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async listAssignedRoles() {
    const group = await this.requireGroup();

    return retryTransientAdminError(() =>
      this.core.groups.listRealmRoleMappings({
        realm: this.realmName,
        id: group.id,
      }),
    );
  }

  public async assignClientRole(clientRoleHandle: ClientRoleHandle) {
    const group = await this.requireGroup();
    const { client, role } = await this.resolveClientRole(clientRoleHandle);

    await retryTransientAdminError(() =>
      this.core.groups.addClientRoleMappings({
        realm: this.realmName,
        id: group.id,
        clientUniqueId: client.id!,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async unassignClientRole(clientRoleHandle: ClientRoleHandle) {
    const group = await this.requireGroup();
    const { client, role } = await this.resolveClientRole(clientRoleHandle);

    await retryTransientAdminError(() =>
      this.core.groups.delClientRoleMappings({
        realm: this.realmName,
        id: group.id,
        clientUniqueId: client.id!,
        roles: [role] as never as RoleMappingPayload[],
      }),
    );
  }

  public async listAssignedClientRoles(clientHandle: ClientHandle): Promise<RoleRepresentation[]> {
    const group = await this.requireGroup();
    const client =
      clientHandle.client ?? (await ClientHandle.getByClientId(this.core, this.realmName, clientHandle.clientId));
    if (!client) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    return retryTransientAdminError(() =>
      this.core.groups.listClientRoleMappings({
        realm: this.realmName,
        id: group.id,
        clientUniqueId: client.id!,
      }),
    );
  }
}
