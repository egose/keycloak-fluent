import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';

describe('Implementation Regressions: Role Mapping Ownership (OWN-01)', () => {
  test('client realm-scope mapping rejects a client role at runtime', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const clientRoleHandle = clientHandle.role('client-only-role');

    await expect(clientHandle.addRealmScopeMappings([clientRoleHandle as never])).rejects.toThrow(
      /is a client role; .+ realm-scope mappings only accept realm roles/,
    );

    await expect(clientHandle.removeRealmScopeMappings([clientRoleHandle as never])).rejects.toThrow(
      /is a client role; .+ realm-scope mappings only accept realm roles/,
    );

    expect(core.clients.find).not.toHaveBeenCalled();
  });

  test('client realm-scope mapping rejects a realm role from a different realm', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
      },
    } as any;

    const ownerRealmHandle = new RealmHandle(core, 'owner-realm');
    const otherRealmHandle = new RealmHandle(core, 'other-realm');
    const clientHandle = ownerRealmHandle.client('app-client');
    const foreignRoleHandle = otherRealmHandle.role('foreign-role');

    await expect(clientHandle.addRealmScopeMappings([foreignRoleHandle])).rejects.toThrow(
      /belongs to realm "other-realm", which differs from client "app-client" realm "owner-realm"/,
    );

    expect(core.clients.find).not.toHaveBeenCalled();
  });

  test('client realm-scope mapping rejects a realm role from a different admin-client instance', async () => {
    const ownerCore = { clients: { find: vi.fn() } } as any;
    const otherCore = {} as any;

    const ownerRealmHandle = new RealmHandle(ownerCore, 'demo');
    const otherRealmHandle = new RealmHandle(otherCore, 'demo');
    const clientHandle = ownerRealmHandle.client('app-client');
    const foreignRoleHandle = otherRealmHandle.role('manage-users');

    await expect(clientHandle.addRealmScopeMappings([foreignRoleHandle])).rejects.toThrow(
      /belongs to a different Keycloak admin client than client "app-client"/,
    );

    expect(ownerCore.clients.find).not.toHaveBeenCalled();
  });

  test('client client-scope mapping rejects a client role owned by a different client', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([
          { id: 'client-1', clientId: 'app-client' },
          { id: 'client-2', clientId: 'target-client' },
          { id: 'client-3', clientId: 'other-client' },
        ]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const targetClientHandle = realmHandle.client('target-client');
    const otherClientHandle = realmHandle.client('other-client');
    const wrongRoleHandle = otherClientHandle.role('other-role');

    await expect(clientHandle.addClientScopeMappings(targetClientHandle, [wrongRoleHandle])).rejects.toThrow(
      /belongs to client "other-client", which differs from client "app-client" target client "target-client"/,
    );

    await expect(clientHandle.removeClientScopeMappings(targetClientHandle, [wrongRoleHandle])).rejects.toThrow(
      /belongs to client "other-client", which differs from client "app-client" target client "target-client"/,
    );
  });

  test('client client-scope mapping rejects a client role from a different realm', async () => {
    const core = { clients: { find: vi.fn() } } as any;

    const ownerRealmHandle = new RealmHandle(core, 'owner-realm');
    const foreignRealmHandle = new RealmHandle(core, 'other-realm');
    const clientHandle = ownerRealmHandle.client('app-client');
    const targetClientHandle = ownerRealmHandle.client('target-client');
    const foreignRoleHandle = foreignRealmHandle.client('target-client').role('target-role');

    await expect(clientHandle.addClientScopeMappings(targetClientHandle, [foreignRoleHandle])).rejects.toThrow(
      /belongs to realm "other-realm", which differs from client "app-client" realm "owner-realm"/,
    );

    expect(core.clients.find).not.toHaveBeenCalled();
  });

  test('client client-scope mapping rejects a client role from a different admin-client instance', async () => {
    const ownerCore = { clients: { find: vi.fn() } } as any;
    const foreignCore = {} as any;

    const ownerRealmHandle = new RealmHandle(ownerCore, 'demo');
    const foreignRealmHandle = new RealmHandle(foreignCore, 'demo');
    const clientHandle = ownerRealmHandle.client('app-client');
    const targetClientHandle = ownerRealmHandle.client('target-client');
    const foreignRoleHandle = foreignRealmHandle.client('target-client').role('target-role');

    await expect(clientHandle.addClientScopeMappings(targetClientHandle, [foreignRoleHandle])).rejects.toThrow(
      /belongs to a different Keycloak admin client than client "app-client"/,
    );

    expect(ownerCore.clients.find).not.toHaveBeenCalled();
  });

  test('user realm-role assignment rejects cross-realm and cross-core role handles', async () => {
    const ownerCore = { users: { find: vi.fn() } } as any;
    const foreignCore = {} as any;

    const ownerRealmHandle = new RealmHandle(ownerCore, 'demo');
    const foreignRealmHandle = new RealmHandle(foreignCore, 'demo');
    const otherRealmHandle = new RealmHandle(ownerCore, 'other-realm');
    const userHandle = ownerRealmHandle.user('alice');

    await expect(userHandle.assignRole(foreignRealmHandle.role('manage-users'))).rejects.toThrow(
      /belongs to a different Keycloak admin client than user "alice"/,
    );

    await expect(userHandle.unassignRole(otherRealmHandle.role('foreign-role'))).rejects.toThrow(
      /belongs to realm "other-realm", which differs from user "alice" realm "demo"/,
    );

    expect(ownerCore.users.find).not.toHaveBeenCalled();
  });

  test('user client-role assignment rejects cross-realm and cross-core client role handles', async () => {
    const ownerCore = {
      users: { find: vi.fn() },
      clients: { find: vi.fn() },
    } as any;
    const foreignCore = {} as any;

    const ownerRealmHandle = new RealmHandle(ownerCore, 'demo');
    const foreignRealmHandle = new RealmHandle(foreignCore, 'demo');
    const otherRealmHandle = new RealmHandle(ownerCore, 'other-realm');
    const userHandle = ownerRealmHandle.user('alice');

    await expect(
      userHandle.assignClientRole(foreignRealmHandle.client('app-client').role('target-role')),
    ).rejects.toThrow(/belongs to a different Keycloak admin client than user "alice"/);

    await expect(
      userHandle.unassignClientRole(otherRealmHandle.client('app-client').role('target-role')),
    ).rejects.toThrow(/belongs to realm "other-realm", which differs from user "alice" realm "demo"/);

    expect(ownerCore.users.find).not.toHaveBeenCalled();
  });

  test('group realm-role assignment rejects cross-realm role handles', async () => {
    const core = { groups: { find: vi.fn() } } as any;

    const ownerRealmHandle = new RealmHandle(core, 'demo');
    const foreignRealmHandle = new RealmHandle(core, 'other-realm');
    const groupHandle = ownerRealmHandle.group('staff');
    const foreignRoleHandle = foreignRealmHandle.role('foreign-role');

    await expect(groupHandle.assignRole(foreignRoleHandle)).rejects.toThrow(
      /belongs to realm "other-realm", which differs from group "staff" realm "demo"/,
    );

    await expect(groupHandle.unassignRole(foreignRoleHandle)).rejects.toThrow(
      /belongs to realm "other-realm", which differs from group "staff" realm "demo"/,
    );

    expect(core.groups.find).not.toHaveBeenCalled();
  });

  test('group client-role assignment rejects cross-core and cross-realm client role handles', async () => {
    const core = { groups: { find: vi.fn() }, clients: { find: vi.fn() } } as any;
    const foreignCore = {} as any;

    const ownerRealmHandle = new RealmHandle(core, 'demo');
    const foreignRealmHandle = new RealmHandle(foreignCore, 'demo');
    const otherRealmHandle = new RealmHandle(core, 'other-realm');
    const groupHandle = ownerRealmHandle.group('staff');

    await expect(
      groupHandle.assignClientRole(foreignRealmHandle.client('app-client').role('target-role')),
    ).rejects.toThrow(/belongs to a different Keycloak admin client than group "staff"/);

    await expect(
      groupHandle.unassignClientRole(otherRealmHandle.client('app-client').role('target-role')),
    ).rejects.toThrow(/belongs to realm "other-realm", which differs from group "staff" realm "demo"/);

    expect(core.groups.find).not.toHaveBeenCalled();
  });

  test('valid same-realm realm and client role mappings preserve existing request shapes', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([
          { id: 'client-1', clientId: 'app-client' },
          { id: 'client-2', clientId: 'target-client' },
        ]),
        findRole: vi.fn().mockResolvedValue({ id: 'role-2', name: 'target-role' }),
        addRealmScopeMappings: vi.fn().mockResolvedValue(undefined),
        addClientScopeMappings: vi.fn().mockResolvedValue(undefined),
      },
      roles: {
        findOneByName: vi.fn().mockResolvedValue({ id: 'role-1', name: 'realm-role' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const targetClientHandle = realmHandle.client('target-client');
    const realmRoleHandle = realmHandle.role('realm-role');
    const clientRoleHandle = targetClientHandle.role('target-role');

    await clientHandle.addRealmScopeMappings([realmRoleHandle]);
    await clientHandle.addClientScopeMappings(targetClientHandle, [clientRoleHandle]);

    expect(core.clients.addRealmScopeMappings).toHaveBeenCalledWith({ realm: 'demo', id: 'client-1' }, [
      { id: 'role-1', name: 'realm-role' },
    ]);
    expect(core.clients.addClientScopeMappings).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1', client: 'client-2' },
      [{ id: 'role-2', name: 'target-role' }],
    );
  });
});
