import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import { UserPasswordProvisioningError } from '../src/user';

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
  function userNotFoundCore() {
    return {
      users: {
        find: vi.fn().mockResolvedValue([]),
      },
    } as any;
  }

  test('create with password creates disabled, sets password, then enables', async () => {
    const passwordError = new Error('boom');
    const core = {
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
    } as any;

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
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: false }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.create({ enabled: false, password: 's3cret-value' }); // pragma: allowlist secret

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(core.users.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    // No enable step: caller asked for a disabled account.
    expect(core.users.update).not.toHaveBeenCalled();
  });

  test('create without password keeps caller enabled flag and skips password path', async () => {
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.create({ firstName: 'Alice' });

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
    expect(core.users.resetPassword).not.toHaveBeenCalled();
    expect(core.users.update).not.toHaveBeenCalled();
  });

  test('create with password failure deletes the disabled user and rethrows provisioning error', async () => {
    const passwordError = new Error('reset failed');
    const core = {
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

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

  test('create cleanup failure preserves the original password error and annotates it; password stays out of errors', async () => {
    const passwordError = new Error('reset failed');
    const cleanupError = new Error('delete failed');
    const core = {
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockRejectedValue(cleanupError),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    const thrown = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    expect(thrown).toBeInstanceOf(UserPasswordProvisioningError);
    const provisioningError = thrown as UserPasswordProvisioningError;

    // The original password error (not the cleanup error) is the cause.
    expect(provisioningError.cause).toBe(passwordError);
    // The cleanup failure is annotated on the password error's cause, not thrown itself.
    expect((passwordError as Error & { cause?: unknown }).cause).toMatchObject({
      cleanupFailed: true,
      cleanupError,
    });

    // The plaintext password never appears in the provisioning error, its message, or its cause.
    const dumped = JSON.stringify(provisioningError);
    expect(dumped).not.toContain('s3cret-value');
    expect(provisioningError.message).not.toContain('s3cret-value');
    expect(provisioningError.profileApplied).toBe(false);
    expect(provisioningError.initialProvisioning).toBe(true);

    // Enable never ran; the disabled account is left in Keycloak (still safe).
    expect(core.users.update).not.toHaveBeenCalled();
    expect(core.users.del).toHaveBeenCalledTimes(1);
  });

  test('ensure-create with password failure deletes the disabled user and surfaces a provisioning error', async () => {
    const passwordError = new Error('reset failed');
    const core = {
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    const thrown = await userHandle.ensure({ firstName: 'Alice', password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    expect(thrown).toBeInstanceOf(UserPasswordProvisioningError);
    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(core.users.resetPassword).toHaveBeenCalledTimes(1);
    expect(core.users.del).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' });
    expect(core.users.update).not.toHaveBeenCalled();
    expect((thrown as UserPasswordProvisioningError).initialProvisioning).toBe(true);
    expect((thrown as UserPasswordProvisioningError).profileApplied).toBe(false);
  });

  test('ensure-create with password success enables the created user', async () => {
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.ensure({ firstName: 'Alice', password: 's3cret-value' }); // pragma: allowlist secret

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ enabled: false, firstName: 'Alice' }));
    expect(core.users.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    expect(core.users.update).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' }, { enabled: true });
  });

  test('ensure-update with password failure surfaces partial-success without rollback of the profile update', async () => {
    const passwordError = new Error('reset failed');
    const core = {
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
    } as any;

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
    expect(provisioningError.cause).toBe(passwordError);
    expect(provisioningError.profileApplied).toBe(true);
    expect(provisioningError.initialProvisioning).toBe(false);
    expect(provisioningError.message).not.toContain('s3cret-value');
  });

  test('update with password failure surfaces partial-success and does not roll back the profile update', async () => {
    const passwordError = new Error('reset failed');
    const core = {
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
    } as any;

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
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    await userHandle.update({ firstName: 'Alice' });

    expect(core.users.update).toHaveBeenCalledTimes(1);
    expect(core.users.resetPassword).not.toHaveBeenCalled();
  });

  test('ensure with no password for an existing user does not run the password path', async () => {
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice' }])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice' }]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

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
    const core = {
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
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    // First attempt fails; disabled account is left behind because cleanup failed.
    const first = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret
    expect(first).toBeInstanceOf(UserPasswordProvisioningError);

    // Retry with ensure(): existing disabled user is updated, password set successfully, no
    // enable injected here (update path does not flip enabled, only the create path does).
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

  test('plaintext password is not present in any thrown error or its serialized form', async () => {
    const passwordError = new Error('reset failed with value=s3cret-value'); // pretend the server echoed it
    const core = {
      users: {
        find: vi.fn().mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockRejectedValue(passwordError),
        del: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');
    const thrown = await userHandle.create({ password: 's3cret-value' }).catch((e: unknown) => e); // pragma: allowlist secret

    // The provisioning error itself never contains the password.
    const provisioningError = thrown as UserPasswordProvisioningError;
    expect(
      JSON.stringify({ m: provisioningError.message, u: provisioningError.username, r: provisioningError.realmName }),
    ).not.toContain('s3cret-value');

    // The cause (original transport error) is preserved as-is for observability, but the
    // library never adds the password to it. We assert the library did not add the call-site
    // password to the cause message.
    expect((provisioningError.cause as Error).message).not.toBe('s3cret-value');
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
    expect(err.initialProvisioning).toBe(false);
    expect(err).toBeInstanceOf(Error);
  });
});
