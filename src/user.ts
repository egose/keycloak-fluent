import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, {
  type ClientRepresentation,
  type FederatedIdentityRepresentation,
  type GroupRepresentation,
  type RequiredActionAlias,
  type RoleMappingPayload,
  type RoleRepresentation,
  type UserRepresentation,
} from './keycloak-admin-client';
import RealmHandle from './realm';
import RoleHandle from './role';
import type ClientHandle from './clients/client';
import ClientRoleHandle from './client-role';
import IdentityProviderHandle from './identity-provider';
import { AbstractGroupHandle } from './groups/abstract-group';
import { getClientByClientId } from './clients/client-lookup';
import { assertClientRoleMappingOwnership, assertRealmRoleMappingOwnership } from './utils/role-ownership';

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
  return mergeUpdateData(user, data, { username });
}

/**
 * Error thrown when user profile data was applied successfully but the
 * password reset step failed. The plaintext password is NEVER included in the
 * message, `cause`, or any serialized form of this error. Callers should
 * treat the preceding profile update as committed; this library does not
 * roll it back.
 */
export class UserPasswordProvisioningError extends Error {
  /**
   * `true` when the profile/best-effort rollback for a newly-created user
   * was applied (i.e. a disabled user account persists in Keycloak after a
   * create-path password failure). `false` when the failed operation left no
   * committed account state (e.g. best-effort rollback deleted the
   * just-created user).
   */
  public readonly profileApplied: boolean;

  public readonly username: string;
  public readonly realmName: string;

  /**
   * `true` when this was an initial provisioning failure for a newly-created
   * user (create or ensure-create path). `false` when this was an update of
   * an existing user.
   */
  public readonly initialProvisioning: boolean;

  public constructor(params: {
    message: string;
    username: string;
    realmName: string;
    profileApplied: boolean;
    initialProvisioning: boolean;
    cause?: unknown;
  }) {
    super(params.message, params.cause !== undefined ? { cause: params.cause } : undefined);
    this.name = 'UserPasswordProvisioningError';
    this.username = params.username;
    this.realmName = params.realmName;
    this.profileApplied = params.profileApplied;
    this.initialProvisioning = params.initialProvisioning;
  }
}

export default class UserHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  public readonly realmName: string;
  private _username: string;
  private _user?: UserRepresentation | null;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, username: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this._username = username;
  }

  public get username(): string {
    return this._username;
  }

  public get user(): UserRepresentation | null | undefined {
    return this._user;
  }

  /**
   * Re-targets this handle to a different user identity and clears the
   * cached representation. The next read (`get()`/`require*()` or any
   * dependent operation) resolves against the new username. Returns `this`
   * for chaining.
   */
  public rebind(newUsername: string): this {
    this._username = newUsername;
    this._user = undefined;
    return this;
  }

  public async getById(id: string) {
    const one = await this.core.users.findOne({ realm: this.realmName, id, userProfileMetadata: true });
    this._user = one ?? null;

    if (this._user) {
      this._username = this._user.username!;
    }

    return this.user ?? null;
  }

  public async get(): Promise<UserRepresentation | null> {
    const ones = await this.core.users.find({ realm: this.realmName, username: this.username, exact: true });
    this._user = ones.find((v) => v.username === this.username) ?? null;

    if (this._user) {
      this._username = this._user.username!;
    }

    return this.user ?? null;
  }

  public async create(data: UserInputData) {
    if (await this.get()) {
      throw new Error(`User "${this.username}" already exists in realm "${this.realmName}"`);
    }

    const { password, ...rest } = data;
    const desiredEnabled = rest.enabled ?? true;

    // When a password is being provisioned, create the user disabled so a
    // password-reset failure can never leave an enabled, usable account.
    const creationPayload: UserRepresentation & { realm?: string } = {
      ...defaultUserData,
      ...rest,
      enabled: password ? false : desiredEnabled,
      realm: this.realmName,
      username: this.username,
    };

    const { id } = await this.core.users.create(creationPayload);

    if (!password) {
      return this.get();
    }

    try {
      await this.resetPassword(id, password);
    } catch (passwordError) {
      // Best-effort rollback: delete the just-created disabled user so that a
      // retry starts clean. If deletion also fails, keep the disabled account
      // (unusable) and rethrow the original password error annotated with the
      // cleanup failure on `cause`. The plaintext password is never put on
      // either error.
      await this.attemptCleanup(id, passwordError);
      throw new UserPasswordProvisioningError({
        message: `Failed to set initial password for user "${this.username}" in realm "${this.realmName}"; the created user was removed.`,
        username: this.username,
        realmName: this.realmName,
        profileApplied: false,
        initialProvisioning: true,
        cause: passwordError,
      });
    }

    // Password is set; enable the user unless the caller asked for a disabled
    // account explicitly.
    if (desiredEnabled) {
      await this.setEnabled(id, true);
    }

    return this.get();
  }

  public async update(data: UserInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    const { password, ...rest } = data;
    await this.core.users.update({ realm: this.realmName, id: one.id }, getUserUpdateData(one, rest, this.username));

    if (!password) {
      return this.get();
    }

    try {
      await this.resetPassword(one.id, password);
    } catch (passwordError) {
      // The profile update above already committed. We do not pretend it was
      // rolled back; surface a partial-success error to the caller so they
      // can decide whether to retry the password step or to roll back the
      // user explicitly. The plaintext password is never attached.
      throw new UserPasswordProvisioningError({
        message: `Profile for user "${this.username}" in realm "${this.realmName}" was updated but the password reset failed. The profile update is committed and is not rolled back.`,
        username: this.username,
        realmName: this.realmName,
        profileApplied: true,
        initialProvisioning: false,
        cause: passwordError,
      });
    }

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.del({ realm: this.realmName, id: one.id });

    this._user = null;
    return this.username;
  }

  public async ensure(data: UserInputData) {
    const one = await this.get();
    const { password, ...rest } = data;

    if (one?.id) {
      await this.core.users.update({ realm: this.realmName, id: one.id }, getUserUpdateData(one, rest, this.username));
      if (password) {
        try {
          await this.resetPassword(one.id, password);
        } catch (passwordError) {
          throw new UserPasswordProvisioningError({
            message: `Profile for user "${this.username}" in realm "${this.realmName}" was updated but the password reset failed. The profile update is committed and is not rolled back.`,
            username: this.username,
            realmName: this.realmName,
            profileApplied: true,
            initialProvisioning: false,
            cause: passwordError,
          });
        }
      }
    } else {
      const desiredEnabled = rest.enabled ?? true;
      const { id } = await this.core.users.create({
        ...defaultUserData,
        ...rest,
        enabled: password ? false : desiredEnabled,
        realm: this.realmName,
        username: this.username,
      });

      if (password) {
        try {
          await this.resetPassword(id, password);
        } catch (passwordError) {
          await this.attemptCleanup(id, passwordError);
          throw new UserPasswordProvisioningError({
            message: `Failed to set initial password for user "${this.username}" in realm "${this.realmName}"; the created user was removed.`,
            username: this.username,
            realmName: this.realmName,
            profileApplied: false,
            initialProvisioning: true,
            cause: passwordError,
          });
        }

        if (desiredEnabled) {
          await this.setEnabled(id, true);
        }
      }
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.users.del({ realm: this.realmName, id: one.id });
      this._user = null;
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

  /**
   * Best-effort rollback for a freshly created user when password setup
   * failed. The created user was disabled at creation time, so leaving it
   * behind is safe (it cannot be used to authenticate). We still attempt to
   * delete it on a best-effort basis so retries start clean. If deletion
   * fails, the deletion error is recorded on `cause.cleanupError` of the
   * password error to be rethrown later; we never let the deletion error
   * shadow the original password failure.
   */
  private async attemptCleanup(userId: string, passwordError: unknown): Promise<void> {
    try {
      await this.core.users.del({ realm: this.realmName, id: userId });
    } catch (cleanupError) {
      if (passwordError instanceof Error) {
        const existingCause = (passwordError as Error & { cause?: unknown }).cause;
        const cleanupCause =
          existingCause === undefined
            ? { cleanupFailed: true, cleanupError }
            : { cleanupFailed: true, cleanupError, originalCause: existingCause };
        (passwordError as Error & { cause?: unknown }).cause = cleanupCause;
      }
    }
  }

  private async setEnabled(userId: string, enabled: boolean) {
    await this.core.users.update({ realm: this.realmName, id: userId }, { enabled });
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
    if (!client?.id) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    return client as ClientRepresentation & { id: string };
  }

  public async assignRole(roleHandle: RoleHandle) {
    assertRealmRoleMappingOwnership(this.core, this.realmName, roleHandle, `user "${this.username}"`);
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
    assertRealmRoleMappingOwnership(this.core, this.realmName, roleHandle, `user "${this.username}"`);
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
    assertClientRoleMappingOwnership(
      this.core,
      this.realmName,
      clientRoleHandle.clientHandle,
      clientRoleHandle,
      `user "${this.username}"`,
    );
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
    assertClientRoleMappingOwnership(
      this.core,
      this.realmName,
      clientRoleHandle.clientHandle,
      clientRoleHandle,
      `user "${this.username}"`,
    );
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

  public async listAssignedGroups(options?: { briefRepresentation?: boolean; search?: string }) {
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
        briefRepresentation: options?.briefRepresentation ?? false,
        search: options?.search,
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
      clientId: client.id,
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
