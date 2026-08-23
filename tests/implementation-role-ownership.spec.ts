import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import { createMockAdminClient } from './test-utils';

describe('Implementation Regressions: Role Mapping Ownership (OWN-01)', () => {
  test('client realm-scope mapping rejects a client role at runtime', async () => {
    const core = createMockAdminClient({
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
      },
    });

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const clientRoleHandle = clientHandle.role('client-only-role');

    await expect(clientHandle.addRealmScopeMappings([clientRoleHandle as never])).rejects.toThrow(
      /client role "client-only-role" is not a realm role/,
    );

    await expect(clientHandle.removeRealmScopeMappings([clientRoleHandle as never])).rejects.toThrow(
      /client role "client-only-role" is not a realm role/,
    );

    expect(core.clients.find).not.toHaveBeenCalled();
  });

  test('client realm-scope mapping rejects a realm role from a different realm', async () => {
    const core = createMockAdminClient({
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
      },
    });

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
    const ownerCore = createMockAdminClient({ clients: { find: vi.fn() } });
    const otherCore = createMockAdminClient({});

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
    const core = createMockAdminClient({
      clients: {
        find: vi.fn().mockResolvedValue([
          { id: 'client-1', clientId: 'app-client' },
          { id: 'client-2', clientId: 'target-client' },
          { id: 'client-3', clientId: 'other-client' },
        ]),
      },
    });

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

    expect(core.clients.find).not.toHaveBeenCalled();
  });

  test('client-scope assignment rejects cross-core, cross-realm, and wrong-kind handles before network access', async () => {
    const ownerCore = createMockAdminClient({
      clients: {
        find: vi.fn(),
        addDefaultClientScope: vi.fn(),
        delDefaultClientScope: vi.fn(),
        addOptionalClientScope: vi.fn(),
        delOptionalClientScope: vi.fn(),
      },
      clientScopes: { find: vi.fn() },
    });
    const foreignCore = createMockAdminClient({ clientScopes: { find: vi.fn() } });

    const ownerRealm = new RealmHandle(ownerCore, 'demo');
    const clientHandle = ownerRealm.client('app-client');
    const crossCoreScope = new RealmHandle(foreignCore, 'demo').clientScope('profile');
    const crossRealmScope = new RealmHandle(ownerCore, 'other-realm').clientScope('profile');
    const wrongKind = ownerRealm.client('not-a-scope');

    await expect(clientHandle.addDefaultClientScope(crossCoreScope)).rejects.toThrow(/different Keycloak admin client/);
    await expect(clientHandle.removeDefaultClientScope(crossRealmScope)).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(clientHandle.addOptionalClientScope(wrongKind as never)).rejects.toThrow(/is not a client scope/);
    await expect(clientHandle.removeOptionalClientScope(crossCoreScope)).rejects.toThrow(
      /different Keycloak admin client/,
    );

    expect(ownerCore.clients.find).not.toHaveBeenCalled();
    expect(ownerCore.clientScopes.find).not.toHaveBeenCalled();
    expect(ownerCore.clients.addDefaultClientScope).not.toHaveBeenCalled();
    expect(ownerCore.clients.delDefaultClientScope).not.toHaveBeenCalled();
    expect(ownerCore.clients.addOptionalClientScope).not.toHaveBeenCalled();
    expect(ownerCore.clients.delOptionalClientScope).not.toHaveBeenCalled();
  });

  test('client-scope assignment preserves same-owner payloads', async () => {
    const core = createMockAdminClient({
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        addDefaultClientScope: vi.fn().mockResolvedValue(undefined),
        addOptionalClientScope: vi.fn().mockResolvedValue(undefined),
      },
      clientScopes: {
        find: vi.fn().mockResolvedValue([{ id: 'scope-1', name: 'profile' }]),
      },
    });

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const scopeHandle = realmHandle.clientScope('profile');

    await clientHandle.addDefaultClientScope(scopeHandle);
    await clientHandle.addOptionalClientScope(scopeHandle);

    expect(core.clients.addDefaultClientScope).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      clientScopeId: 'scope-1',
    });
    expect(core.clients.addOptionalClientScope).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      clientScopeId: 'scope-1',
    });
  });

  test('client client-scope mapping rejects a client role from a different realm', async () => {
    const core = createMockAdminClient({ clients: { find: vi.fn() } });

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
    const ownerCore = createMockAdminClient({ clients: { find: vi.fn() } });
    const foreignCore = createMockAdminClient({});

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

  test('client-filtered scope mapping reads reject cross-owner target clients before network access', async () => {
    const ownerCore = createMockAdminClient({
      clients: {
        find: vi.fn(),
        listClientScopeMappings: vi.fn(),
        listAvailableClientScopeMappings: vi.fn(),
        listCompositeClientScopeMappings: vi.fn(),
      },
    });
    const foreignCore = createMockAdminClient({ clients: { find: vi.fn() } });

    const clientHandle = new RealmHandle(ownerCore, 'demo').client('app-client');
    const crossCoreTarget = new RealmHandle(foreignCore, 'demo').client('target-client');
    const crossRealmTarget = new RealmHandle(ownerCore, 'other-realm').client('target-client');

    await expect(clientHandle.listClientScopeMappings(crossCoreTarget)).rejects.toThrow(
      /different Keycloak admin client/,
    );
    await expect(clientHandle.listAvailableClientScopeMappings(crossRealmTarget)).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(clientHandle.listCompositeClientScopeMappings(crossCoreTarget)).rejects.toThrow(
      /different Keycloak admin client/,
    );

    expect(ownerCore.clients.find).not.toHaveBeenCalled();
    expect(ownerCore.clients.listClientScopeMappings).not.toHaveBeenCalled();
    expect(ownerCore.clients.listAvailableClientScopeMappings).not.toHaveBeenCalled();
    expect(ownerCore.clients.listCompositeClientScopeMappings).not.toHaveBeenCalled();
  });

  test('organization, user, and realm handle links reject foreign handles before network access', async () => {
    const ownerCore = createMockAdminClient({
      organizations: { find: vi.fn(), addMember: vi.fn(), linkIdp: vi.fn() },
      users: { find: vi.fn(), addToGroup: vi.fn(), addToFederatedIdentity: vi.fn(), listOfflineSessions: vi.fn() },
      identityProviders: { findOne: vi.fn() },
      groups: { find: vi.fn() },
      clients: { find: vi.fn() },
      realms: { addDefaultGroup: vi.fn() },
    });
    const foreignCore = createMockAdminClient({ users: { find: vi.fn() }, identityProviders: { findOne: vi.fn() } });
    const ownerRealm = new RealmHandle(ownerCore, 'demo');
    const otherRealm = new RealmHandle(ownerCore, 'other-realm');
    const foreignRealm = new RealmHandle(foreignCore, 'demo');

    await expect(ownerRealm.organization('acme').addMember(foreignRealm.user('alice'))).rejects.toThrow(
      /different Keycloak admin client/,
    );
    await expect(
      ownerRealm.organization('acme').linkIdentityProvider(otherRealm.identityProvider('google')),
    ).rejects.toThrow(/belongs to realm "other-realm"/);
    await expect(ownerRealm.user('alice').assignGroup(otherRealm.group('staff'))).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(ownerRealm.user('alice').unassignGroup(ownerRealm.user('bob') as never)).rejects.toThrow(
      /is not a group/,
    );
    await expect(
      ownerRealm.user('alice').linkFederatedIdentity(foreignRealm.identityProvider('google'), {}),
    ).rejects.toThrow(/different Keycloak admin client/);
    await expect(ownerRealm.user('alice').listOfflineSessions(otherRealm.client('app-client'))).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(ownerRealm.addDefaultGroup(otherRealm.group('staff'))).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );

    expect(ownerCore.organizations.find).not.toHaveBeenCalled();
    expect(ownerCore.users.find).not.toHaveBeenCalled();
    expect(ownerCore.identityProviders.findOne).not.toHaveBeenCalled();
    expect(ownerCore.groups.find).not.toHaveBeenCalled();
    expect(ownerCore.clients.find).not.toHaveBeenCalled();
    expect(ownerCore.realms.addDefaultGroup).not.toHaveBeenCalled();
  });

  test('composite-role operations and client-filtered composite reads reject foreign handles before network access', async () => {
    const ownerCore = createMockAdminClient({
      roles: { findOneByName: vi.fn(), createComposite: vi.fn(), getCompositeRolesForClient: vi.fn() },
      clients: { find: vi.fn() },
    });
    const foreignCore = createMockAdminClient({ roles: { findOneByName: vi.fn() } });
    const ownerRealm = new RealmHandle(ownerCore, 'demo');
    const otherRealm = new RealmHandle(ownerCore, 'other-realm');
    const foreignRealm = new RealmHandle(foreignCore, 'demo');
    const roleHandle = ownerRealm.role('parent-role');
    const clientRoleHandle = ownerRealm.client('app-client').role('parent-client-role');

    await expect(roleHandle.addComposite(foreignRealm.role('child-role'))).rejects.toThrow(
      /different Keycloak admin client/,
    );
    await expect(roleHandle.removeComposite(otherRealm.client('app-client').role('child-role'))).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(roleHandle.addComposite(ownerRealm.client('not-a-role') as never)).rejects.toThrow(/is not a role/);
    await expect(roleHandle.listClientComposites(otherRealm.client('app-client'))).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(clientRoleHandle.addComposite(otherRealm.role('child-role'))).rejects.toThrow(
      /belongs to realm "other-realm"/,
    );
    await expect(clientRoleHandle.listClientComposites(foreignRealm.client('app-client'))).rejects.toThrow(
      /different Keycloak admin client/,
    );

    expect(ownerCore.roles.findOneByName).not.toHaveBeenCalled();
    expect(ownerCore.roles.createComposite).not.toHaveBeenCalled();
    expect(ownerCore.roles.getCompositeRolesForClient).not.toHaveBeenCalled();
    expect(ownerCore.clients.find).not.toHaveBeenCalled();
  });

  test('user realm-role assignment rejects cross-realm and cross-core role handles', async () => {
    const ownerCore = createMockAdminClient({ users: { find: vi.fn() }, roles: { findOneByName: vi.fn() } });
    const foreignCore = createMockAdminClient({});

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
    expect(ownerCore.roles.findOneByName).not.toHaveBeenCalled();
  });

  test('user realm-role array assignments validate every handle before resolving any role', async () => {
    const ownerCore = createMockAdminClient({ users: { find: vi.fn() }, roles: { findOneByName: vi.fn() } });
    const ownerRealmHandle = new RealmHandle(ownerCore, 'demo');
    const otherRealmHandle = new RealmHandle(ownerCore, 'other-realm');
    const userHandle = ownerRealmHandle.user('alice');
    const validRoleHandle = ownerRealmHandle.role('valid-role');
    const foreignRoleHandle = otherRealmHandle.role('foreign-role');
    const wrongKindHandle = ownerRealmHandle.client('not-a-role').role('client-role');

    await expect(userHandle.assignRealmRoles([validRoleHandle, foreignRoleHandle])).rejects.toThrow(
      /belongs to realm "other-realm", which differs from user "alice" realm "demo"/,
    );
    await expect(userHandle.unassignRealmRoles([validRoleHandle, wrongKindHandle as never])).rejects.toThrow(
      /client role "client-role" is not a realm role/,
    );

    expect(ownerCore.roles.findOneByName).not.toHaveBeenCalled();
    expect(ownerCore.users.find).not.toHaveBeenCalled();
  });

  test('user client-role assignment rejects cross-realm and cross-core client role handles', async () => {
    const ownerCore = createMockAdminClient({
      users: { find: vi.fn() },
      clients: { find: vi.fn() },
    });
    const foreignCore = createMockAdminClient({});

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
    const core = createMockAdminClient({ groups: { find: vi.fn() } });

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
    const core = createMockAdminClient({ groups: { find: vi.fn() }, clients: { find: vi.fn() } });
    const foreignCore = createMockAdminClient({});

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
    const core = createMockAdminClient({
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
    });

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

  test('valid same-owner user role assignments preserve existing request payloads', async () => {
    const core = createMockAdminClient({
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        addRealmRoleMappings: vi.fn().mockResolvedValue(undefined),
        delRealmRoleMappings: vi.fn().mockResolvedValue(undefined),
      },
      roles: {
        findOneByName: vi.fn().mockResolvedValue({ id: 'role-1', name: 'realm-role' }),
      },
    });

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');
    const roleHandle = realmHandle.role('realm-role');

    await userHandle.assignRealmRoles([roleHandle]);
    await userHandle.unassignRealmRoles([roleHandle]);

    expect(core.users.addRealmRoleMappings).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      roles: [{ id: 'role-1', name: 'realm-role' }],
    });
    expect(core.users.delRealmRoleMappings).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      roles: [{ id: 'role-1', name: 'realm-role' }],
    });
  });
});
