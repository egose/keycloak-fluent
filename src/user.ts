import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import RealmHandle from './realm';
import ClientHandle from './clients/client';
import ClientRoleHandle from './client-role';
import GroupHandle from './groups/group';
import { AbstractGroupHandle } from './groups/abstract-group';

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

export type UserInputData = Omit<UserRepresentation, 'username | id'>;

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

    await this.core.users.create({ ...defaultUserData, ...data, realm: this.realmName, username: this.username });
    return this.get();
  }

  public async update(data: UserInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.update({ realm: this.realmName, id: one.id }, { ...data, username: this.username });

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

    if (one?.id) {
      await this.core.users.update({ realm: this.realmName, id: one.id }, { ...data, username: this.username });
    } else {
      await this.core.users.create({ ...defaultUserData, ...data, realm: this.realmName, username: this.username });
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

  public async assignClientRole(clientRoleHandle: ClientRoleHandle) {
    let client: ClientRepresentation | null = clientRoleHandle.client ?? null;
    if (!client) {
      client = (await ClientHandle.getByClientId(this.core, this.realmName, clientRoleHandle.clientId)) ?? null;
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
      id: this.user?.id!,
      clientUniqueId: client.id!,
      roles: [clientRole] as never as RoleMappingPayload[],
    });
  }

  public async unassignClientRole(clientRoleHandle: ClientRoleHandle) {
    let client: ClientRepresentation | null = clientRoleHandle.client ?? null;
    if (!client) {
      client = (await ClientHandle.getByClientId(this.core, this.realmName, clientRoleHandle.clientId)) ?? null;
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
      id: this.user?.id!,
      clientUniqueId: client.id!,
      roles: [clientRole] as never as RoleMappingPayload[],
    });
  }

  public async assignGroup(groupHandle: AbstractGroupHandle) {
    let group: GroupRepresentation | null = groupHandle.group ?? null;
    if (!group) {
      group = (await groupHandle.get()) ?? null;
    }

    if (!group) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.addToGroup({
      realm: this.realmName,
      id: this.user?.id!,
      groupId: group.id!,
    });
  }

  public async unassignGroup(groupHandle: AbstractGroupHandle) {
    let group: GroupRepresentation | null = groupHandle.group ?? null;
    if (!group) {
      group = (await groupHandle.get()) ?? null;
    }

    if (!group) {
      throw new Error(`Group "${groupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.delFromGroup({
      realm: this.realmName,
      id: this.user?.id!,
      groupId: group.id!,
    });
  }
}
