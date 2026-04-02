import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import FederatedIdentityRepresentation from '@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RoleRepresentation, { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { type RequiredActionAlias } from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
import RealmHandle from './realm';
import RoleHandle from './role';
import type ClientHandle from './clients/client';
import ClientRoleHandle from './client-role';
import IdentityProviderHandle from './identity-provider';
import { AbstractGroupHandle } from './groups/abstract-group';
import { getClientByClientId } from './clients/client-lookup';

export const defaultUserData = Object.freeze({
  firstName: '',
  lastName: '',
  email: '',
  emailVerified: false,
  enabled: true,
  totp: false,
  disableableCredentialTypes: [],
  requiredActions: [],
  notBefore: 0,
  access: {
    manageGroupMembership: true,
    resetPassword: true,
    view: true,
    mapRoles: true,
    impersonate: true,
    manage: true,
  },
  attributes: {},
});

export type UserInputData = Omit<UserRepresentation, 'username' | 'id'> & {
  password?: string;
};

export type UserRequiredAction = RequiredActionAlias | string;
export type FederatedIdentityInputData = Omit<FederatedIdentityRepresentation, 'identityProvider'>;

function getUserUpdateData(user: UserRepresentation, data: Omit<UserInputData, 'password'>, username: string) {
  return _merge({}, user, data, { username });
}

export default class UserHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public username: string;
  public user?: UserRepresentation | null;
  public userData?: UserInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, username: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.username = username;
  }

  public async getById(id: string) {
    const one = await this.core.users.findOne({ realm: this.realmName, id, userProfileMetadata: true });
    this.user = one ?? null;

    if (this.user) {
      this.username = this.user.username!;
    }

    return this.user;
  }

  public async get(): Promise<UserRepresentation | null> {
    const ones = await this.core.users.find({ realm: this.realmName, username: this.username, exact: true });
    this.user = ones.find((v) => v.username === this.username) ?? null;

    if (this.user) {
      this.username = this.user.username!;
    }

    return this.user;
  }

  public async create(data: UserInputData) {
    if (await this.get()) {
      throw new Error(`User "${this.username}" already exists in realm "${this.realmName}"`);
    }

    const { password, ...rest } = data;

    const { id } = await this.core.users.create({
      ...defaultUserData,
      ...rest,
      realm: this.realmName,
      username: this.username,
    });

    if (password) await this.resetPassword(id, password);
    return this.get();
  }

  public async update(data: UserInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    const { password, ...rest } = data;
    await this.core.users.update({ realm: this.realmName, id: one.id }, getUserUpdateData(one, rest, this.username));

    if (password) await this.resetPassword(one.id, password);
    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.del({ realm: this.realmName, id: one.id });

    this.user = null;
    return this.username;
  }

  public async ensure(data: UserInputData) {
    this.userData = data;

    const one = await this.get();
    const { password, ...rest } = data;

    if (one?.id) {
      await this.core.users.update({ realm: this.realmName, id: one.id }, getUserUpdateData(one, rest, this.username));
      if (password) await this.resetPassword(one.id, password);
    } else {
      const { id } = await this.core.users.create({
        ...defaultUserData,
        ...rest,
        realm: this.realmName,
        username: this.username,
      });
      if (password) await this.resetPassword(id, password);
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.users.del({ realm: this.realmName, id: one.id });
      this.user = null;
    }

    return this.username;
  }

  private async resetPassword(userId: string, password: string) {
    await this.core.users.resetPassword({
      realm: this.realmName,
      id: userId,
      credential: {
        temporary: false,
        type: 'password',
        value: password,
      },
    });
  }

  private async requireUser(): Promise<UserRepresentation & { id: string }> {
    const user = this.user ?? (await this.get());
    if (!user?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    return user as UserRepresentation & { id: string };
  }

  private async updateRequiredActions(requiredActions: UserRequiredAction[]) {
    const user = await this.requireUser();

    await this.core.users.update(
      { realm: this.realmName, id: user.id },
      {
        ...user,
        username: this.username,
        requiredActions,
      },
    );

    await this.get();
    return this;
  }

  private async resolveIdentityProvider(identityProviderHandle: IdentityProviderHandle) {
    const identityProvider = identityProviderHandle.identityProvider ?? (await identityProviderHandle.get());
    if (!identityProvider?.alias) {
      throw new Error(`Identity Provider "${identityProviderHandle.alias}" not found in realm "${this.realmName}"`);
    }

    return identityProvider;
  }

  private async resolveClient(clientHandle: ClientHandle) {
    const client = clientHandle.client ?? (await getClientByClientId(this.core, this.realmName, clientHandle.clientId));
    if (!client?.clientId) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    return client;
  }

  public async assignRole(roleHandle: RoleHandle) {
    const user = await this.requireUser();
    let role: RoleRepresentation | null = roleHandle.role ?? null;
    if (!role) {
      role = (await RoleHandle.getByName(this.core, this.realmName, roleHandle.roleName)) ?? null;
    }

    if (!role) {
      throw new Error(`Role "${roleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.addRealmRoleMappings({
      realm: this.realmName,
      id: user.id,
      roles: [role] as never as RoleMappingPayload[],
    });
  }

  public async unassignRole(roleHandle: RoleHandle) {
    const user = await this.requireUser();
    let role: RoleRepresentation | null = roleHandle.role ?? null;
    if (!role) {
      role = (await RoleHandle.getByName(this.core, this.realmName, roleHandle.roleName)) ?? null;
    }

    if (!role) {
      throw new Error(`Role "${roleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.delRealmRoleMappings({
      realm: this.realmName,
      id: user.id,
      roles: [role] as never as RoleMappingPayload[],
    });
  }

  public async assignClientRole(clientRoleHandle: ClientRoleHandle) {
    const user = await this.requireUser();
    let client: ClientRepresentation | null = clientRoleHandle.client ?? null;
    if (!client) {
      client = (await getClientByClientId(this.core, this.realmName, clientRoleHandle.clientHandle.clientId)) ?? null;
    }

    if (!client) {
      throw new Error(`Client "${clientRoleHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    let clientRole = clientRoleHandle.role;
    if (!clientRole) {
      clientRole = await ClientRoleHandle.getByName(
        this.core,
        this.realmName,
        client.clientId!,
        clientRoleHandle.roleName,
        client,
      );
    }

    if (!clientRole) {
      throw new Error(`Client Role "${clientRoleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.addClientRoleMappings({
      realm: this.realmName,
      id: user.id,
      clientUniqueId: client.id!,
      roles: [clientRole] as never as RoleMappingPayload[],
    });
  }

  public async unassignClientRole(clientRoleHandle: ClientRoleHandle) {
    const user = await this.requireUser();
    let client: ClientRepresentation | null = clientRoleHandle.client ?? null;
    if (!client) {
      client = (await getClientByClientId(this.core, this.realmName, clientRoleHandle.clientHandle.clientId)) ?? null;
    }

    if (!client) {
      throw new Error(`Client "${clientRoleHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    let clientRole = clientRoleHandle.role;
    if (!clientRole) {
      clientRole = await ClientRoleHandle.getByName(
        this.core,
        this.realmName,
        client.clientId!,
        clientRoleHandle.roleName,
        client,
      );
    }

    if (!clientRole) {
      throw new Error(`Client Role "${clientRoleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.delClientRoleMappings({
      realm: this.realmName,
      id: user.id,
      clientUniqueId: client.id!,
      roles: [clientRole] as never as RoleMappingPayload[],
    });
  }

  public async listAssignedClientRoles(clientHandle: ClientHandle) {
    const user = await this.requireUser();
    let client: ClientRepresentation | null = clientHandle.client ?? null;
    if (!client) {
      client = (await getClientByClientId(this.core, this.realmName, clientHandle.clientId)) ?? null;
    }

    if (!client) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    const result = await this.core.users.listClientRoleMappings({
      realm: this.realmName,
      id: user.id,
      clientUniqueId: client.id!,
    });

    return result;
  }

  public async assignGroup(groupHandle: AbstractGroupHandle) {
    const user = await this.requireUser();
    let group: GroupRepresentation | null = groupHandle.group ?? null;
    if (!group) {
      group = (await groupHandle.get()) ?? null;
    }

    if (!group) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.addToGroup({
      realm: this.realmName,
      id: user.id,
      groupId: group.id!,
    });
  }

  public async unassignGroup(groupHandle: AbstractGroupHandle) {
    const user = await this.requireUser();
    let group: GroupRepresentation | null = groupHandle.group ?? null;
    if (!group) {
      group = (await groupHandle.get()) ?? null;
    }

    if (!group) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.delFromGroup({
      realm: this.realmName,
      id: user.id,
      groupId: group.id!,
    });
  }

  public async listAssignedGroups() {
    const user = await this.requireUser();
    const allGroups: GroupRepresentation[] = [];
    let first = 0;
    const max = 100;

    while (true) {
      const groups = await this.core.users.listGroups({
        realm: this.realmName,
        id: user.id,
        first,
        max,
        briefRepresentation: false,
      });

      if (!groups || groups.length === 0) {
        break;
      }

      allGroups.push(...groups);
      first += max;
    }

    return allGroups;
  }

  public async listRequiredActions() {
    const user = await this.requireUser();

    return [...(user.requiredActions ?? [])];
  }

  public async setRequiredActions(requiredActions: UserRequiredAction[]) {
    return this.updateRequiredActions([...new Set(requiredActions)]);
  }

  public async addRequiredAction(requiredAction: UserRequiredAction) {
    const currentRequiredActions = await this.listRequiredActions();
    return this.updateRequiredActions([...new Set([...currentRequiredActions, requiredAction])]);
  }

  public async removeRequiredAction(requiredAction: UserRequiredAction) {
    const currentRequiredActions = await this.listRequiredActions();
    return this.updateRequiredActions(currentRequiredActions.filter((action) => action !== requiredAction));
  }

  public async executeActionsEmail(
    actions: UserRequiredAction[],
    options?: { clientId?: string; lifespan?: number; redirectUri?: string },
  ) {
    const user = await this.requireUser();

    await this.core.users.executeActionsEmail({
      realm: this.realmName,
      id: user.id,
      actions,
      clientId: options?.clientId,
      lifespan: options?.lifespan,
      redirectUri: options?.redirectUri,
    });
  }

  public async listFederatedIdentities() {
    const user = await this.requireUser();

    return this.core.users.listFederatedIdentities({
      realm: this.realmName,
      id: user.id,
    });
  }

  public async linkFederatedIdentity(identityProviderHandle: IdentityProviderHandle, data: FederatedIdentityInputData) {
    const user = await this.requireUser();
    const identityProvider = await this.resolveIdentityProvider(identityProviderHandle);

    await this.core.users.addToFederatedIdentity({
      realm: this.realmName,
      id: user.id,
      federatedIdentityId: identityProvider.alias!,
      federatedIdentity: {
        ...data,
        identityProvider: identityProvider.alias,
      },
    });
  }

  public async unlinkFederatedIdentity(identityProviderHandle: IdentityProviderHandle) {
    const user = await this.requireUser();
    const identityProvider = await this.resolveIdentityProvider(identityProviderHandle);

    await this.core.users.delFromFederatedIdentity({
      realm: this.realmName,
      id: user.id,
      federatedIdentityId: identityProvider.alias!,
    });
  }

  public async listSessions() {
    const user = await this.requireUser();

    return this.core.users.listSessions({
      realm: this.realmName,
      id: user.id,
    });
  }

  public async listOfflineSessions(clientHandle: ClientHandle) {
    const user = await this.requireUser();
    const client = await this.resolveClient(clientHandle);

    return this.core.users.listOfflineSessions({
      realm: this.realmName,
      id: user.id,
      clientId: client.clientId!,
    });
  }

  public async logoutSessions() {
    const user = await this.requireUser();

    await this.core.users.logout({
      realm: this.realmName,
      id: user.id,
    });
  }
}
