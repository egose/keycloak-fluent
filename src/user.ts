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
import { assertOwnedHandle } from './utils/resource-ownership';
import { fetchAll, type FetchAllOptions } from './utils/fetch-all';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';

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
  /** Whether a supplied password must be changed on first login. Defaults to false. */
  passwordTemporary?: boolean;
};

export type UserRequiredAction = RequiredActionAlias | string;
export type FederatedIdentityInputData = Omit<FederatedIdentityRepresentation, 'identityProvider'>;
export type ReconcileRealmRolesOptions = {
  /** Create desired roles that do not exist. Defaults to true. */
  ensureMissing?: boolean;
  /** Only roles in this set can be removed. Without it reconciliation is additive-only. */
  managedRoleNames?: readonly string[];
  /** Maximum number of desired roles accepted. Defaults to 100. */
  maxRoles?: number;
};
export type ReconcileUserAttributesOptions = {
  /** Only keys in this set can be removed. Without it reconciliation is additive-only. */
  managedKeys?: readonly string[];
};
export type ListAssignedGroupsOptions = FetchAllOptions & { briefRepresentation?: boolean; search?: string };

function normalizeNames(values: readonly string[], name: string) {
  const normalized = values.map((value, index) => {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${name}[${index}] must be a non-empty string`);
    }
    return value.trim();
  });

  return [...new Set(normalized)];
}

function assertSafeAttributeKey(key: string) {
  if (!key.trim()) throw new Error('User attribute keys must be non-empty strings');
  if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
    throw new Error(`User attribute key "${key}" is not supported`);
  }
}

function getUserUpdateData(
  user: UserRepresentation,
  data: Omit<UserInputData, 'password' | 'passwordTemporary'>,
  username: string,
) {
  return mergeUpdateData(user, data, { username });
}

const SENSITIVE_DIAGNOSTIC_KEYS = new Set([
  'body',
  'clientsecret',
  'config',
  'credential',
  'data',
  'headers',
  'password',
  'request',
  'response',
  'responsedata',
  'responsetext',
  'secret',
  'value',
]);

const SAFE_DIAGNOSTIC_KEYS = new Set(['code', 'error', 'errorCode', 'name', 'status', 'statusCode']);

type SanitizedDiagnostic = Record<string, unknown>;

function redactSecrets(value: string, secrets: readonly string[]) {
  return secrets.reduce((redacted, secret) => {
    if (!secret) return redacted;
    return redacted.split(secret).join('[redacted]');
  }, value);
}

function sanitizeDiagnosticValue(
  value: unknown,
  secrets: readonly string[],
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (typeof value === 'string') return redactSecrets(value, secrets).slice(0, 500);
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
  if (typeof value === 'bigint') return value.toString();
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (depth <= 0) return '[truncated]';

  if (typeof value !== 'object') return String(value);
  if (value instanceof Error) {
    return sanitizeErrorDiagnostic(value, secrets, seen, depth - 1);
  }
  if (seen.has(value)) return '[circular]';
  seen.add(value);

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((entry) => sanitizeDiagnosticValue(entry, secrets, seen, depth - 1));
  }

  const sanitized: SanitizedDiagnostic = {};
  for (const [key, entry] of Object.entries(value)) {
    sanitized[key] = SENSITIVE_DIAGNOSTIC_KEYS.has(key.toLowerCase())
      ? '[redacted]'
      : sanitizeDiagnosticValue(entry, secrets, seen, depth - 1);
  }

  return sanitized;
}

function sanitizeErrorDiagnostic(
  error: Error,
  secrets: readonly string[],
  seen = new WeakSet<object>(),
  depth = 5,
): SanitizedDiagnostic {
  if (seen.has(error)) return { name: error.name, message: '[circular]' };
  seen.add(error);

  const diagnostic: SanitizedDiagnostic = {
    name: redactSecrets(error.name || 'Error', secrets),
    message: redactSecrets(error.message, secrets).slice(0, 500),
  };
  const source = error as Error & Record<string, unknown> & { cause?: unknown };

  for (const key of SAFE_DIAGNOSTIC_KEYS) {
    if (key in source) {
      diagnostic[key] = sanitizeDiagnosticValue(source[key], secrets, seen, depth - 1);
    }
  }

  for (const [key, entry] of Object.entries(source)) {
    if (key in diagnostic || key === 'cause') continue;
    diagnostic[key] = SENSITIVE_DIAGNOSTIC_KEYS.has(key.toLowerCase())
      ? '[redacted]'
      : sanitizeDiagnosticValue(entry, secrets, seen, depth - 1);
  }

  if (source.cause !== undefined) {
    diagnostic.cause = sanitizeDiagnosticValue(source.cause, secrets, seen, depth - 1);
  }

  return diagnostic;
}

function sanitizeProvisioningCause(params: { cause?: unknown; cleanupError?: unknown; password?: string }) {
  const secrets = params.password ? [params.password] : [];
  const seen = new WeakSet<object>();
  const diagnostic = sanitizeDiagnosticValue(params.cause, secrets, seen, 5);

  if (params.cleanupError === undefined) return diagnostic;

  return {
    passwordError: diagnostic,
    cleanupFailed: true,
    cleanupError: sanitizeDiagnosticValue(params.cleanupError, secrets, seen, 5),
  };
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

  /** `true` when a user account is known to persist in Keycloak after the failure. */
  public readonly accountPersists: boolean;

  /** The known enabled state of the persisted account, or `null` when unknown/not persisted. */
  public readonly accountEnabled: boolean | null;

  /** `true` when the supplied password was committed before a later provisioning step failed. */
  public readonly passwordApplied: boolean;

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
    accountPersists?: boolean;
    accountEnabled?: boolean | null;
    passwordApplied?: boolean;
    initialProvisioning: boolean;
    cause?: unknown;
    cleanupError?: unknown;
    password?: string;
  }) {
    const sanitizedCause =
      params.cause !== undefined || params.cleanupError !== undefined
        ? sanitizeProvisioningCause({
            cause: params.cause,
            cleanupError: params.cleanupError,
            password: params.password,
          })
        : undefined;
    super(params.message, sanitizedCause !== undefined ? { cause: sanitizedCause } : undefined);
    this.name = 'UserPasswordProvisioningError';
    this.username = params.username;
    this.realmName = params.realmName;
    this.profileApplied = params.profileApplied;
    this.accountPersists = params.accountPersists ?? params.profileApplied;
    this.accountEnabled = params.accountEnabled ?? null;
    this.passwordApplied = params.passwordApplied ?? false;
    this.initialProvisioning = params.initialProvisioning;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      username: this.username,
      realmName: this.realmName,
      profileApplied: this.profileApplied,
      accountPersists: this.accountPersists,
      accountEnabled: this.accountEnabled,
      passwordApplied: this.passwordApplied,
      initialProvisioning: this.initialProvisioning,
      cause: this.cause,
    };
  }
}

export default class UserHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  private _username: string;
  private _userId?: string;
  private _user?: UserRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, username: string, userId?: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this._username = username;
    this._userId = userId;
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (
      this.parentIdentity.invalidateIfChanged(() => {
        this._user = undefined;
        this._userId = undefined;
      })
    ) {
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

  public get username(): string {
    return this._username;
  }

  public get user(): UserRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._user;
  }

  /**
   * Re-targets this handle to a different user identity and clears the
   * cached representation. The next read (`get()`/`require*()` or any
   * dependent operation) resolves against the new username. Returns `this`
   * for chaining.
   */
  public rebind(newUsername: string): this {
    if (newUsername === this._username) return this;
    this._username = newUsername;
    this._userId = undefined;
    this._user = undefined;
    this._identityGeneration++;
    return this;
  }

  public async getById(id: string) {
    this.invalidateParentCache();
    if (!id.trim()) throw new Error('Keycloak user ID must be a non-empty string');
    const one = await this.core.users.findOne({ realm: this.realmName, id, userProfileMetadata: true });
    this._user = one ?? null;
    this._userId = id;

    if (this._user) {
      if (this._username !== this._user.username) this._identityGeneration++;
      this._username = this._user.username!;
    }

    return this.user ?? null;
  }

  public async get(): Promise<UserRepresentation | null> {
    this.invalidateParentCache();
    if (this._userId) return this.getById(this._userId);

    const ones = await this.core.users.find({ realm: this.realmName, username: this.username, exact: true });
    this._user = ones.find((v) => v.username === this.username) ?? null;

    if (this._user) {
      if (this._username !== this._user.username) this._identityGeneration++;
      this._username = this._user.username!;
    }

    return this.user ?? null;
  }

  public async create(data: UserInputData) {
    if (this._userId) {
      throw new Error(`Cannot create user from ID handle "${this._userId}" in realm "${this.realmName}"`);
    }
    if (await this.get()) {
      throw new Error(`User "${this.username}" already exists in realm "${this.realmName}"`);
    }

    const { password, passwordTemporary = false, ...rest } = data;
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
      await this.resetPasswordById(id, password, { temporary: passwordTemporary });
    } catch (passwordError) {
      // Best-effort rollback: delete the just-created disabled user so that a
      // retry starts clean. If deletion also fails, keep the disabled account
      // (unusable) and report both failures through sanitized diagnostics.
      // The upstream errors are never mutated or exposed directly.
      const cleanupError = await this.attemptCleanup(id);
      throw new UserPasswordProvisioningError({
        message: cleanupError
          ? `Failed to set initial password for user "${this.username}" in realm "${this.realmName}"; the disabled created user still exists because cleanup failed.`
          : `Failed to set initial password for user "${this.username}" in realm "${this.realmName}"; the created user was removed.`,
        username: this.username,
        realmName: this.realmName,
        profileApplied: cleanupError !== undefined,
        accountPersists: cleanupError !== undefined,
        accountEnabled: cleanupError ? false : null,
        passwordApplied: false,
        initialProvisioning: true,
        cause: passwordError,
        cleanupError,
        password,
      });
    }

    // Password is set; enable the user unless the caller asked for a disabled
    // account explicitly.
    if (desiredEnabled) {
      try {
        await this.setEnabled(id, true);
      } catch (enableError) {
        throw new UserPasswordProvisioningError({
          message: `Password was set for user "${this.username}" in realm "${this.realmName}" but the final enable step failed. The disabled user persists and retrying with ensure() and the same enabled input will update it without creating a duplicate.`,
          username: this.username,
          realmName: this.realmName,
          profileApplied: true,
          accountPersists: true,
          accountEnabled: false,
          passwordApplied: true,
          initialProvisioning: true,
          cause: enableError,
          password,
        });
      }
    }

    return this.get();
  }

  public async update(data: UserInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`User "${this.username}" not found in realm "${this.realmName}"`);
    }

    const { password, passwordTemporary = false, ...rest } = data;
    await this.core.users.update({ realm: this.realmName, id: one.id }, getUserUpdateData(one, rest, this.username));

    if (!password) {
      return this.get();
    }

    try {
      await this.resetPasswordById(one.id, password, { temporary: passwordTemporary });
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
        accountPersists: true,
        accountEnabled: rest.enabled ?? one.enabled ?? null,
        passwordApplied: false,
        initialProvisioning: false,
        cause: passwordError,
        password,
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
    const { password, passwordTemporary = false, ...rest } = data;

    if (one?.id) {
      await this.core.users.update({ realm: this.realmName, id: one.id }, getUserUpdateData(one, rest, this.username));
      if (password) {
        try {
          await this.resetPasswordById(one.id, password, { temporary: passwordTemporary });
        } catch (passwordError) {
          throw new UserPasswordProvisioningError({
            message: `Profile for user "${this.username}" in realm "${this.realmName}" was updated but the password reset failed. The profile update is committed and is not rolled back.`,
            username: this.username,
            realmName: this.realmName,
            profileApplied: true,
            accountPersists: true,
            accountEnabled: rest.enabled ?? one.enabled ?? null,
            passwordApplied: false,
            initialProvisioning: false,
            cause: passwordError,
            password,
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
          await this.resetPasswordById(id, password, { temporary: passwordTemporary });
        } catch (passwordError) {
          const cleanupError = await this.attemptCleanup(id);
          throw new UserPasswordProvisioningError({
            message: cleanupError
              ? `Failed to set initial password for user "${this.username}" in realm "${this.realmName}"; the disabled created user still exists because cleanup failed.`
              : `Failed to set initial password for user "${this.username}" in realm "${this.realmName}"; the created user was removed.`,
            username: this.username,
            realmName: this.realmName,
            profileApplied: cleanupError !== undefined,
            accountPersists: cleanupError !== undefined,
            accountEnabled: cleanupError ? false : null,
            passwordApplied: false,
            initialProvisioning: true,
            cause: passwordError,
            cleanupError,
            password,
          });
        }

        if (desiredEnabled) {
          try {
            await this.setEnabled(id, true);
          } catch (enableError) {
            throw new UserPasswordProvisioningError({
              message: `Password was set for user "${this.username}" in realm "${this.realmName}" but the final enable step failed. The disabled user persists and retrying with ensure() and the same enabled input will update it without creating a duplicate.`,
              username: this.username,
              realmName: this.realmName,
              profileApplied: true,
              accountPersists: true,
              accountEnabled: false,
              passwordApplied: true,
              initialProvisioning: true,
              cause: enableError,
              password,
            });
          }
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

  private async resetPasswordById(userId: string, password: string, options?: { temporary?: boolean }) {
    await this.core.users.resetPassword({
      realm: this.realmName,
      id: userId,
      credential: {
        temporary: options?.temporary ?? false,
        type: 'password',
        value: password,
      },
    });
  }

  public async resetPassword(password: string, options?: { temporary?: boolean }) {
    const user = await this.requireUser();
    await this.resetPasswordById(user.id, password, options);
    await this.get();
    return this;
  }

  /**
   * Best-effort rollback for a freshly created user when password setup
   * failed. The created user was disabled at creation time, so leaving it
   * behind is safe (it cannot be used to authenticate). We still attempt to
   * delete it on a best-effort basis so retries start clean. If deletion
   * fails, the deletion error is returned to be reported alongside the
   * original password failure without mutating either upstream error.
   */
  private async attemptCleanup(userId: string): Promise<unknown> {
    try {
      await this.core.users.del({ realm: this.realmName, id: userId });
      return undefined;
    } catch (cleanupError) {
      return cleanupError;
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

  private assertRealmRoleOwnership(roleHandle: RoleHandle) {
    assertRealmRoleMappingOwnership(this.core, this.realmName, roleHandle, `user "${this.username}"`);
  }

  private async resolveRealmRole(roleHandle: RoleHandle) {
    const role = roleHandle.role ?? (await RoleHandle.getByName(this.core, this.realmName, roleHandle.roleName));
    if (!role?.id) {
      throw new Error(`Role "${roleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    return role;
  }

  public async listAssignedRealmRoles() {
    const user = await this.requireUser();
    return this.core.users.listRealmRoleMappings({ realm: this.realmName, id: user.id });
  }

  public async assignRealmRoles(roleHandles: readonly RoleHandle[]) {
    for (const roleHandle of roleHandles) {
      this.assertRealmRoleOwnership(roleHandle);
    }
    const roles = await Promise.all(roleHandles.map((roleHandle) => this.resolveRealmRole(roleHandle)));
    const user = await this.requireUser();
    if (roles.length) {
      await this.core.users.addRealmRoleMappings({
        realm: this.realmName,
        id: user.id,
        roles: roles as never as RoleMappingPayload[],
      });
    }
    return this;
  }

  public async unassignRealmRoles(roleHandles: readonly RoleHandle[]) {
    for (const roleHandle of roleHandles) {
      this.assertRealmRoleOwnership(roleHandle);
    }
    const roles = await Promise.all(roleHandles.map((roleHandle) => this.resolveRealmRole(roleHandle)));
    const user = await this.requireUser();
    if (roles.length) {
      await this.core.users.delRealmRoleMappings({
        realm: this.realmName,
        id: user.id,
        roles: roles as never as RoleMappingPayload[],
      });
    }
    return this;
  }

  public async reconcileRealmRoles(desiredRoleNames: readonly string[], options: ReconcileRealmRolesOptions = {}) {
    const maxRoles = options.maxRoles ?? 100;
    if (!Number.isSafeInteger(maxRoles) || maxRoles <= 0) {
      throw new Error('reconcileRealmRoles maxRoles must be a positive safe integer');
    }

    const desiredNames = normalizeNames(desiredRoleNames, 'desiredRoleNames');
    if (desiredNames.length > maxRoles) {
      throw new Error(`reconcileRealmRoles supports at most ${maxRoles} desired roles`);
    }

    const managedNames = options.managedRoleNames
      ? new Set(normalizeNames(options.managedRoleNames, 'managedRoleNames'))
      : null;
    const effectiveDesiredNames = managedNames ? desiredNames.filter((name) => managedNames.has(name)) : desiredNames;
    const desiredRoles: RoleRepresentation[] = [];

    for (const roleName of effectiveDesiredNames) {
      const roleHandle = this.realmHandle.role(roleName);
      if (options.ensureMissing !== false) await roleHandle.ensure({});
      const role = roleHandle.role ?? (await roleHandle.get());
      if (!role?.id) throw new Error(`Role "${roleName}" not found in realm "${this.realmName}"`);
      desiredRoles.push(role);
    }

    const user = await this.requireUser();
    const assignedRoles = await this.listAssignedRealmRoles();
    const assignedNames = new Set(
      assignedRoles.map((role) => role.name).filter((name): name is string => typeof name === 'string'),
    );
    const desiredNameSet = new Set(effectiveDesiredNames);
    const toAdd = desiredRoles.filter((role) => role.name && !assignedNames.has(role.name));
    const toRemove = managedNames
      ? assignedRoles.filter((role) => role.name && managedNames.has(role.name) && !desiredNameSet.has(role.name))
      : [];

    if (toAdd.length) {
      await this.core.users.addRealmRoleMappings({
        realm: this.realmName,
        id: user.id,
        roles: toAdd as never as RoleMappingPayload[],
      });
    }
    if (toRemove.length) {
      await this.core.users.delRealmRoleMappings({
        realm: this.realmName,
        id: user.id,
        roles: toRemove as never as RoleMappingPayload[],
      });
    }

    return { added: toAdd, removed: toRemove };
  }

  public async reconcileAttributes(
    desiredAttributes: Readonly<Record<string, readonly string[]>>,
    options: ReconcileUserAttributesOptions = {},
  ) {
    const user = await this.requireUser();
    const attributes: Record<string, string[]> = Object.assign(Object.create(null), user.attributes ?? {});
    const managedKeys = options.managedKeys ? normalizeNames(options.managedKeys, 'managedKeys') : [];

    for (const key of managedKeys) {
      assertSafeAttributeKey(key);
      delete attributes[key];
    }
    for (const [key, values] of Object.entries(desiredAttributes)) {
      assertSafeAttributeKey(key);
      if (!Array.isArray(values) || values.some((value) => typeof value !== 'string')) {
        throw new Error(`User attribute "${key}" must be an array of strings`);
      }
      attributes[key] = [...values];
    }

    await this.core.users.update(
      { realm: this.realmName, id: user.id },
      { ...getUserUpdateData(user, {}, this.username), attributes },
    );
    await this.get();
    return this;
  }

  public async assignRole(roleHandle: RoleHandle) {
    await this.assignRealmRoles([roleHandle]);
  }

  public async unassignRole(roleHandle: RoleHandle) {
    await this.unassignRealmRoles([roleHandle]);
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
    assertOwnedHandle(this, clientHandle, 'client', `user "${this.username}"`, 'client-role mapping read');
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
    assertOwnedHandle(this, groupHandle, 'group', `user "${this.username}"`, 'group assignment');
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
    assertOwnedHandle(this, groupHandle, 'group', `user "${this.username}"`, 'group assignment');
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

  public async listAssignedGroups(options: ListAssignedGroupsOptions = {}) {
    const user = await this.requireUser();

    return fetchAll(
      (first, max) =>
        this.core.users.listGroups({
          realm: this.realmName,
          id: user.id,
          first,
          max,
          briefRepresentation: options.briefRepresentation ?? false,
          search: options.search,
        }),
      { pageSize: 100, ...options },
    );
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

  public async sendVerifyEmail() {
    const user = await this.requireUser();
    await this.core.users.sendVerifyEmail({ realm: this.realmName, id: user.id });
    return this;
  }

  public async listFederatedIdentities() {
    const user = await this.requireUser();

    return this.core.users.listFederatedIdentities({
      realm: this.realmName,
      id: user.id,
    });
  }

  public async linkFederatedIdentity(identityProviderHandle: IdentityProviderHandle, data: FederatedIdentityInputData) {
    assertOwnedHandle(
      this,
      identityProviderHandle,
      'identity provider',
      `user "${this.username}"`,
      'federated identity link',
    );
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
    assertOwnedHandle(
      this,
      identityProviderHandle,
      'identity provider',
      `user "${this.username}"`,
      'federated identity link',
    );
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
    assertOwnedHandle(this, clientHandle, 'client', `user "${this.username}"`, 'offline session read');
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
