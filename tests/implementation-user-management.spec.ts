import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';

describe('Generic user management', () => {
  test('provisions temporary passwords through the safe disabled-create sequence', async () => {
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice' }]),
        create: vi.fn().mockResolvedValue({ id: 'user-1' }),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;
    const handle = new RealmHandle(core, 'demo').user('alice');

    await handle.create({ enabled: true, password: 'secret', passwordTemporary: true }); // pragma: allowlist secret

    expect(core.users.create).toHaveBeenCalledWith(expect.objectContaining({ username: 'alice', enabled: false }));
    expect(core.users.resetPassword).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      credential: { temporary: true, type: 'password', value: 'secret' }, // pragma: allowlist secret
    });
    expect(core.users.update).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' }, { enabled: true });
  });

  test('ID handles resolve actions without a username lookup', async () => {
    const user = { id: 'user-1', username: 'alice' };
    const core = {
      users: {
        findOne: vi.fn().mockResolvedValue(user),
        resetPassword: vi.fn().mockResolvedValue(undefined),
        sendVerifyEmail: vi.fn().mockResolvedValue(undefined),
      },
    } as any;
    const handle = new RealmHandle(core, 'demo').userById('user-1');

    await handle.resetPassword('secret', { temporary: true }); // pragma: allowlist secret
    await handle.sendVerifyEmail();

    expect(core.users.findOne).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1', userProfileMetadata: true });
    expect(core.users.resetPassword).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      credential: { temporary: true, type: 'password', value: 'secret' }, // pragma: allowlist secret
    });
    expect(core.users.sendVerifyEmail).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' });
    expect(core.users.find).toBeUndefined();
  });

  test('reconciles only owned realm roles', async () => {
    const user = { id: 'user-1', username: 'alice' };
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([user]),
        listRealmRoleMappings: vi.fn().mockResolvedValue([
          { id: 'role-old', name: 'app-old' },
          { id: 'role-external', name: 'external' },
        ]),
        addRealmRoleMappings: vi.fn().mockResolvedValue(undefined),
        delRealmRoleMappings: vi.fn().mockResolvedValue(undefined),
      },
      roles: {
        findOneByName: vi.fn().mockResolvedValue({ id: 'role-new', name: 'app-new' }),
      },
    } as any;
    const handle = new RealmHandle(core, 'demo').user('alice');

    await expect(
      handle.reconcileRealmRoles(['app-new'], {
        ensureMissing: false,
        managedRoleNames: ['app-new', 'app-old'],
      }),
    ).resolves.toEqual({
      added: [{ id: 'role-new', name: 'app-new' }],
      removed: [{ id: 'role-old', name: 'app-old' }],
    });

    expect(core.users.addRealmRoleMappings).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      roles: [{ id: 'role-new', name: 'app-new' }],
    });
    expect(core.users.delRealmRoleMappings).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      roles: [{ id: 'role-old', name: 'app-old' }],
    });
  });

  test('reconciles managed attributes while preserving external keys', async () => {
    const updated = { id: 'user-1', username: 'alice', attributes: { app: ['new'], external: ['keep'] } };
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 'user-1', username: 'alice', attributes: { app: ['old'], obsolete: ['remove'], external: ['keep'] } },
          ])
          .mockResolvedValueOnce([updated]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;
    const handle = new RealmHandle(core, 'demo').user('alice');

    await handle.reconcileAttributes({ app: ['new'] }, { managedKeys: ['app', 'obsolete'] });

    expect(core.users.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'user-1' },
      expect.objectContaining({ attributes: { app: ['new'], external: ['keep'] } }),
    );
    expect(handle.user).toEqual(updated);
  });
});
