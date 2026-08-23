import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import { UserPasswordProvisioningError as RootUserPasswordProvisioningError } from '../src/index';
import { UserPasswordProvisioningError } from '../src/user';
import { createMockAdminClient } from './test-utils';

/**
 * USER-01: Safe password provisioning failure semantics.
 *
 * Strategy chosen (recommended, safer than best-effort rollback of an enabled
 * account): when a password is supplied, the user is created with
 * `enabled: false`; `resetPassword` runs against the disabled account; only on
 * success is the account enabled (unless the caller asked for a disabled
 * account). On password failure, the just-created disabled account is deleted
 * best-effort; if the delete also fails, the original password error is
 * preserved (annotated with the cleanup failure) and the disabled account
 * stays in Keycloak (unusable, safe). For updates of an existing user, the
 * profile update is committed and not rolled back; a
 * {@link UserPasswordProvisioningError} surfaces the password failure so the
 * caller can decide. Plaintext passwords never appear in errors, causes, or
 * logs.
 */
describe('Implementation Regressions: User Password Provisioning (USER-01)', () => {
  function inspectGraph(value: unknown) {
    const seen = new WeakSet<object>();

    function visit(entry: unknown): unknown {
      if (typeof entry !== 'object' || entry === null) return entry;
      if (seen.has(entry)) return '[circular]';
      seen.add(entry);

      const out: Record<string, unknown> = {};
      for (const key of Reflect.ownKeys(entry)) {
        out[String(key)] = visit((entry as Record<PropertyKey, unknown>)[key]);
      }
      return out;
    }

    return JSON.stringify(visit(value));
  }

  function userNotFoundCore() {
    return createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValue([]),
      },
    });
  }

  test('create with password creates disabled, sets password, then enables', async () => {
    const passwordError = new Error('boom');
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          // initial existence check: not found
          .mockResolvedValueOnce([])
          // final get() after success
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.create({ firstName: 'Alice', password: 's3cret-value' }); // pragma: allowlist secret

    // Created disabled (enabled: false) because a password was supplied.
    expect(core.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        realm: 'demo',
        username: 'alice',
        enabled: false,
        firstName: 'Alice',
      }),
    );

    // Password set against the disabled account.
    expect(core.users.resetPassword).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      credential: expect.objectContaining({ type: 'password', temporary: false }),
    });

    // Enabled after password success.
    expect(core.users.update).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' }, { enabled: true });
  });

  test('create with password does not enable when caller requests enabled=false', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: false }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.create({ enabled: false, password: 's3cret-value' }); // pragma: allowlist secret

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(core.users.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    // No enable step: caller asked for a disabled account.
    expect(core.users.update).not.toHaveBeenCalled();
  });

  test('create without password keeps caller enabled flag and skips password path', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.create({ firstName: 'Alice' });

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
    expect(core.users.resetPassword).not.toHaveBeenCalled();
    expect(core.users.update).not.toHaveBeenCalled();
  });

  test('create with password failure deletes the disabled user and rethrows provisioning error', async () => {
    const passwordError = new Error('reset failed');
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    await expect(userHandle.create({ password: 's3cret-value' })).rejects.toBeInstanceOf(UserPasswordProvisioningError); // pragma: allowlist secret

    // Disabled user was created.
    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    // Password attempt was made.
    expect(core.users.resetPassword).toHaveBeenCalledTimes(1);
    // Best-effort rollback deleted the just-created user.
    expect(core.users.del).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' });
    // Enable was never called because password failed.
    expect(core.users.update).not.toHaveBeenCalled();
  });

  test('create cleanup failure preserves upstream errors and reports disabled persisted state without leaking password', async () => {
    const passwordError = new Error('reset failed');
    const cleanupError = new Error('delete failed');
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockRejectedValue(cleanupError),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    const thrown = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    expect(thrown).toBeInstanceOf(UserPasswordProvisioningError);
    const provisioningError = thrown as UserPasswordProvisioningError;

    // Upstream errors are not exposed or mutated; public cause is a sanitized diagnostic graph.
    expect(provisioningError.cause).not.toBe(passwordError);
    expect((passwordError as Error & { cause?: unknown }).cause).toBeUndefined();
    expect(provisioningError.cause).toMatchObject({
      cleanupFailed: true,
      cleanupError: { message: 'delete failed' },
      passwordError: { message: 'reset failed' },
    });

    // The plaintext password never appears in the complete public graph or serialized form.
    const dumped = inspectGraph(provisioningError);
    expect(dumped).not.toContain('s3cret-value');
    expect(JSON.stringify(provisioningError)).not.toContain('s3cret-value');
    expect(provisioningError.message).not.toContain('s3cret-value');
    expect(provisioningError.profileApplied).toBe(true);
    expect(provisioningError.accountPersists).toBe(true);
    expect(provisioningError.accountEnabled).toBe(false);
    expect(provisioningError.passwordApplied).toBe(false);
    expect(provisioningError.initialProvisioning).toBe(true);

    // Enable never ran; the disabled account is left in Keycloak (still safe).
    expect(core.users.update).not.toHaveBeenCalled();
    expect(core.users.del).toHaveBeenCalledTimes(1);
  });

  test('ensure-create with password failure deletes the disabled user and surfaces a provisioning error', async () => {
    const passwordError = new Error('reset failed');
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    const thrown = await userHandle.ensure({ firstName: 'Alice', password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    expect(thrown).toBeInstanceOf(UserPasswordProvisioningError);
    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(core.users.resetPassword).toHaveBeenCalledTimes(1);
    expect(core.users.del).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' });
    expect(core.users.update).not.toHaveBeenCalled();
    expect((thrown as UserPasswordProvisioningError).initialProvisioning).toBe(true);
    expect((thrown as UserPasswordProvisioningError).profileApplied).toBe(false);
    expect((thrown as UserPasswordProvisioningError).accountPersists).toBe(false);
    expect((thrown as UserPasswordProvisioningError).accountEnabled).toBeNull();
    expect((thrown as UserPasswordProvisioningError).passwordApplied).toBe(false);
  });

  test('ensure-create with password success enables the created user', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.ensure({ firstName: 'Alice', password: 's3cret-value' }); // pragma: allowlist secret

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false, firstName: 'Alice' }));
    expect(core.users.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    expect(core.users.update).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' }, { enabled: true });
  });

  test('ensure-update with password failure surfaces partial-success without rollback of the profile update', async () => {
    const passwordError = new Error('reset failed');
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'user-1',
            username: 'alice',
            emailVerified: true,
            attributes: { team: ['platform'] },
            access: { manage: true, view: true },
            requiredActions: [],
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    const thrown = await userHandle
      .ensure({ firstName: 'Alice', password: 's3cret-value' }) // pragma: allowlist secret
      .catch((e: unknown) => e);

    expect(thrown).toBeInstanceOf(UserPasswordProvisioningError);
    const provisioningError = thrown as UserPasswordProvisioningError;

    // Profile update WAS committed (not rolled back).
    expect(core.users.update).toHaveBeenCalledTimes(1);
    expect(core.users.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'user-1' },
      expect.objectContaining({ id: 'user-1', username: 'alice', firstName: 'Alice' }),
    );
    // The user was NOT deleted on update path (we do not roll back existing users).
    expect(core.users.del).not.toHaveBeenCalled();
    expect(provisioningError.cause).toMatchObject({ message: 'reset failed' });
    expect(provisioningError.cause).not.toBe(passwordError);
    expect(provisioningError.profileApplied).toBe(true);
    expect(provisioningError.accountPersists).toBe(true);
    expect(provisioningError.accountEnabled).toBeNull();
    expect(provisioningError.passwordApplied).toBe(false);
    expect(provisioningError.initialProvisioning).toBe(false);
    expect(provisioningError.message).not.toContain('s3cret-value');
  });

  test('update with password failure surfaces partial-success and does not roll back the profile update', async () => {
    const passwordError = new Error('reset failed');
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'user-1',
            username: 'alice',
            emailVerified: true,
            attributes: { team: ['platform'] },
            access: { manage: true, view: true },
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    await expect(
      userHandle.update({
        firstName: 'Alice',
        password: 's3cret-value', // pragma: allowlist secret
      }),
    ).rejects.toBeInstanceOf(UserPasswordProvisioningError);

    expect(core.users.update).toHaveBeenCalledTimes(1);
    expect(core.users.resetPassword).toHaveBeenCalledTimes(1);
    expect(core.users.del).not.toHaveBeenCalled();
  });

  test('update with no password does not run the password path', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.update({ firstName: 'Alice' });

    expect(core.users.update).toHaveBeenCalledTimes(1);
    expect(core.users.resetPassword).not.toHaveBeenCalled();
  });

  test('ensure with no password for an existing user does not run the password path', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice' }])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice' }]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.ensure({ firstName: 'Alice' });

    expect(core.users.update).toHaveBeenCalledTimes(1);
    expect(core.users.resetPassword).not.toHaveBeenCalled();
  });

  test('retry after a create-path password failure starts clean (no enabled account left behind)', async () => {
    // First attempt: create succeeds, resetPassword fails, delete fails -> disabled account left.
    // Second attempt (ensure): user is found, update path runs and password is set.
    const passwordError = new Error('reset failed');
    const cleanupError = new Error('delete failed');
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          // First create(): existence check, user not found.
          .mockResolvedValueOnce([])
          // Retry ensure(): existence check, disabled user found from the first failed attempt.
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: false }])
          // Retry ensure() final get().
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockRejectedValueOnce(passwordError).mockResolvedValueOnce(undefined),
        del: vi.fn().mockRejectedValueOnce(cleanupError),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    // First attempt fails; disabled account is left behind because cleanup failed.
    const first = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret
    expect(first).toBeInstanceOf(UserPasswordProvisioningError);

    // Retry with the exact original enabled input through ensure(): existing disabled user is
    // updated and password set successfully without creating a duplicate.
    await userHandle.ensure({ enabled: true, password: 's3cret-value' }); // pragma: allowlist secret

    // On retry, the existing user was updated (profile + enabled flag), password set, and no
    // second create was issued.
    expect(core.users.create).toHaveBeenCalledTimes(1);
    expect(core.users.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'user-1' },
      expect.objectContaining({ id: 'user-1', username: 'alice', enabled: true }),
    );
    expect(core.users.resetPassword).toHaveBeenCalledTimes(2);
  });

  test('plaintext password is not present in any public error graph or serialized form', async () => {
    const nestedCause = new Error('nested cause echoed s3cret-value');
    const passwordError = Object.assign(new Error('reset failed with value=s3cret-value', { cause: nestedCause }), {
      code: 'KC_RESET_FAILED',
      responseData: { error: 'invalid', detail: 'body contains s3cret-value' },
      enumerableDetail: { echoed: 's3cret-value' },
    }); // pretend the server echoed it
    const cleanupError = Object.assign(new Error('delete failed for s3cret-value'), {
      status: 503,
      responseData: 'cleanup body s3cret-value',
    });
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockRejectedValue(cleanupError),
        update: vi.fn().mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    const thrown = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    const provisioningError = thrown as UserPasswordProvisioningError;
    const publicGraph = inspectGraph(provisioningError);
    expect(publicGraph).not.toContain('s3cret-value');
    expect(JSON.stringify(provisioningError)).not.toContain('s3cret-value');
    expect(publicGraph).toContain('KC_RESET_FAILED');
    expect(publicGraph).toContain('503');
    expect(publicGraph).not.toContain('body contains');
    expect(publicGraph).not.toContain('cleanup body');

    // The original upstream error graph is not mutated to achieve redaction.
    expect(passwordError.message).toContain('s3cret-value');
    expect((passwordError.cause as Error).message).toContain('s3cret-value');
    expect(cleanupError.message).toContain('s3cret-value');
  });

  test('create enable failure surfaces typed partial success with disabled persisted account', async () => {
    const enableError = new Error('enable failed with value=s3cret-value');
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockRejectedValue(enableError),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    const thrown = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    expect(thrown).toBeInstanceOf(UserPasswordProvisioningError);
    const provisioningError = thrown as UserPasswordProvisioningError;
    expect(provisioningError.passwordApplied).toBe(true);
    expect(provisioningError.profileApplied).toBe(true);
    expect(provisioningError.accountPersists).toBe(true);
    expect(provisioningError.accountEnabled).toBe(false);
    expect(provisioningError.initialProvisioning).toBe(true);
    expect(inspectGraph(provisioningError)).not.toContain('s3cret-value');
  });

  test('retrying ensure after enable failure enables the existing user without creating a duplicate', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: false }])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockRejectedValueOnce(new Error('enable failed')).mockResolvedValue(undefined),
      },
    });

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    const first = await userHandle.ensure({ enabled: true, password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    expect(first).toBeInstanceOf(UserPasswordProvisioningError);
    await userHandle.ensure({ enabled: true, password: 's3cret-value' }); // pragma: allowlist secret

    expect(core.users.create).toHaveBeenCalledTimes(1);
    expect(core.users.resetPassword).toHaveBeenCalledTimes(2);
    expect(core.users.update).toHaveBeenLastCalledWith(
      { realm: 'demo', id: 'user-1' },
      expect.objectContaining({ id: 'user-1', username: 'alice', enabled: true }),
    );
  });

  test('UserPasswordProvisioningError name and shape', () => {
    const err = new UserPasswordProvisioningError({
      message: 'm',
      username: 'alice',
      realmName: 'demo',
      profileApplied: true,
      initialProvisioning: false,
      cause: new Error('x'),
    });
    expect(err.name).toBe('UserPasswordProvisioningError');
    expect(err.username).toBe('alice');
    expect(err.realmName).toBe('demo');
    expect(err.profileApplied).toBe(true);
    expect(err.accountPersists).toBe(true);
    expect(err.accountEnabled).toBeNull();
    expect(err.passwordApplied).toBe(false);
    expect(err.initialProvisioning).toBe(false);
    expect(err).toBeInstanceOf(Error);
  });

  test('UserPasswordProvisioningError is available from the root entry point', () => {
    expect(RootUserPasswordProvisioningError).toBe(UserPasswordProvisioningError);
  });
});
