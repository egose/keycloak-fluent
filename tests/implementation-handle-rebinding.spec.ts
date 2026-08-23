import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import { createMockAdminClient } from './test-utils';

describe('Implementation Regressions: Stale Child Parent Snapshots (HANDLE-01)', () => {
  describe('Realm descendants', () => {
    test('resolved descendant reads and mutations target a rebound realm without manual child rebind', async () => {
      const roleA = { id: 'role-A-id', name: 'reader', description: 'A' };
      const roleB = { id: 'role-B-id', name: 'reader', description: 'B' };
      const roleBUpdated = { id: 'role-B-id', name: 'reader', description: 'updated' };
      const core = createMockAdminClient({
        roles: {
          findOneByName: vi
            .fn()
            .mockResolvedValueOnce(roleA)
            .mockResolvedValueOnce(roleB)
            .mockResolvedValueOnce(roleBUpdated),
          updateById: vi.fn().mockResolvedValue(undefined),
        },
      });

      const realmHandle = new RealmHandle(core, 'realm-a');
      const roleHandle = realmHandle.role('reader');

      await roleHandle.get();
      expect(core.roles.findOneByName).toHaveBeenLastCalledWith({ realm: 'realm-a', name: 'reader' });
      expect(roleHandle.role?.id).toBe('role-A-id');

      realmHandle.rebind('realm-b');

      await roleHandle.update({ description: 'updated' });
      expect(core.roles.findOneByName).toHaveBeenNthCalledWith(2, { realm: 'realm-b', name: 'reader' });
      expect(core.roles.updateById).toHaveBeenCalledWith(
        { realm: 'realm-b', id: 'role-B-id' },
        { id: 'role-B-id', name: 'reader', description: 'updated' },
      );
      expect(core.roles.findOneByName).toHaveBeenLastCalledWith({ realm: 'realm-b', name: 'reader' });
      expect(roleHandle.role?.id).toBe('role-B-id');
    });

    test('realm-only descendants derive the current realm after rebind', async () => {
      const core = createMockAdminClient({
        attackDetection: {
          findOne: vi.fn().mockResolvedValue({}),
          del: vi.fn().mockResolvedValue(undefined),
        },
        cache: {
          clearRealmCache: vi.fn().mockResolvedValue(undefined),
        },
        clientPolicies: {
          listPolicies: vi.fn().mockResolvedValue({ policies: [] }),
        },
        userStorageProvider: {
          sync: vi.fn().mockResolvedValue({ status: 'ok' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'realm-a');
      const attackDetectionHandle = realmHandle.attackDetection('user-1');
      const cacheHandle = realmHandle.cache();
      const clientPoliciesHandle = realmHandle.clientPolicies();
      const userStorageProviderHandle = realmHandle.userStorageProvider('ldap-id');

      realmHandle.rebind('realm-b');

      await attackDetectionHandle.get();
      await attackDetectionHandle.clear();
      await cacheHandle.clearRealmCache();
      await clientPoliciesHandle.getPolicies();
      await userStorageProviderHandle.sync('triggerFullSync');

      expect(attackDetectionHandle.realmName).toBe('realm-b');
      expect(cacheHandle.realmName).toBe('realm-b');
      expect(clientPoliciesHandle.realmName).toBe('realm-b');
      expect(userStorageProviderHandle.realmName).toBe('realm-b');
      expect(core.attackDetection.findOne).toHaveBeenCalledWith({ realm: 'realm-b', id: 'user-1' });
      expect(core.attackDetection.del).toHaveBeenCalledWith({ realm: 'realm-b', id: 'user-1' });
      expect(core.cache.clearRealmCache).toHaveBeenCalledWith({ realm: 'realm-b' });
      expect(core.clientPolicies.listPolicies).toHaveBeenCalledWith({
        realm: 'realm-b',
        includeGlobalPolicies: undefined,
      });
      expect(core.userStorageProvider.sync).toHaveBeenCalledWith({
        realm: 'realm-b',
        id: 'ldap-id',
        action: 'triggerFullSync',
      });
    });

    test('realm descendant caches are reused while unchanged and invalidated after realm rebind', async () => {
      const core = createMockAdminClient({
        userStorageProvider: {
          name: vi
            .fn()
            .mockResolvedValueOnce({ id: 'ldap-id', name: 'ldap-a' })
            .mockResolvedValueOnce({ id: 'ldap-id', name: 'ldap-b' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'realm-a');
      const userStorageProviderHandle = realmHandle.userStorageProvider('ldap-id');

      await userStorageProviderHandle.getName();
      expect(userStorageProviderHandle.providerName).toBe('ldap-a');
      expect(userStorageProviderHandle.providerName).toBe('ldap-a');
      expect(core.userStorageProvider.name).toHaveBeenCalledTimes(1);

      realmHandle.rebind('realm-b');
      expect(userStorageProviderHandle.providerName).toBeUndefined();

      await userStorageProviderHandle.getName();
      expect(userStorageProviderHandle.providerName).toBe('ldap-b');
      expect(core.userStorageProvider.name).toHaveBeenCalledTimes(2);
      expect(core.userStorageProvider.name).toHaveBeenNthCalledWith(1, { realm: 'realm-a', id: 'ldap-id' });
      expect(core.userStorageProvider.name).toHaveBeenNthCalledWith(2, { realm: 'realm-b', id: 'ldap-id' });
    });
  });

  describe('Group descendants', () => {
    test('multiple nested levels observe a parent group rebind and clear stale group caches', async () => {
      const rootA = { id: 'root-A-id', name: 'team-a', path: '/team-a' };
      const childA = { id: 'child-A-id', name: 'engineering', path: '/team-a/engineering' };
      const grandchildA = { id: 'grandchild-A-id', name: 'platform', path: '/team-a/engineering/platform' };
      const rootB = { id: 'root-B-id', name: 'team-b', path: '/team-b' };
      const childB = { id: 'child-B-id', name: 'engineering', path: '/team-b/engineering' };
      const grandchildB = { id: 'grandchild-B-id', name: 'platform', path: '/team-b/engineering/platform' };
      const core = createMockAdminClient({
        groups: {
          find: vi.fn().mockResolvedValueOnce([rootA]).mockResolvedValueOnce([rootB]),
          findOne: vi.fn().mockResolvedValueOnce(rootA).mockResolvedValueOnce(rootB),
          listSubGroups: vi
            .fn()
            .mockResolvedValueOnce([childA])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([grandchildA])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([childB])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([grandchildB])
            .mockResolvedValueOnce([]),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const rootHandle = realmHandle.group('team-a');
      const childHandle = rootHandle.childGroup('engineering');
      const grandchildHandle = childHandle.childGroup('platform');

      await grandchildHandle.get();
      expect(grandchildHandle.group?.id).toBe('grandchild-A-id');
      expect(core.groups.listSubGroups).toHaveBeenCalledWith({
        realm: 'demo',
        parentId: 'child-A-id',
        briefRepresentation: false,
        first: 0,
        max: 1000,
      });

      rootHandle.rebind('team-b');
      expect(grandchildHandle.group).toBeUndefined();
      expect(grandchildHandle.groupPath).toBe('/team-b/engineering/platform');

      await grandchildHandle.get();
      expect(grandchildHandle.group?.id).toBe('grandchild-B-id');
      expect(core.groups.listSubGroups).toHaveBeenLastCalledWith({
        realm: 'demo',
        parentId: 'child-B-id',
        briefRepresentation: false,
        first: 1,
        max: 1000,
      });
    });
  });

  describe('ClientRoleHandle', () => {
    test('child read targets parent B after parent A is resolved and rebound to B', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const clientB = { id: 'client-B-id', clientId: 'client-b' };
      const core = createMockAdminClient({
        clients: {
          find: vi
            .fn()
            // first call: resolve A from clientId 'client-a'
            .mockResolvedValueOnce([clientA])
            // second call: resolve B after rebind to 'client-b'
            .mockResolvedValueOnce([clientB]),
          findRole: vi
            .fn()
            // resolve role on A
            .mockResolvedValueOnce({ id: 'role-on-A', name: 'reader' })
            // resolve role on B
            .mockResolvedValueOnce({ id: 'role-on-B', name: 'reader' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientHandle = realmHandle.client('client-a');
      const roleHandle = clientHandle.role('reader');

      // Resolve parent A, then resolve the child against A.
      await clientHandle.get();
      await roleHandle.get();
      expect(core.clients.findRole).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'client-A-id',
        roleName: 'reader',
      });
      expect(roleHandle.clientId).toBe('client-a');

      clientHandle.rebind('client-b');

      // Re-resolve the SAME child. It must target B now (no stale A id).
      await roleHandle.get();
      expect(core.clients.findRole).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'client-B-id',
        roleName: 'reader',
      });
      expect(roleHandle.clientId).toBe('client-b');
      expect(roleHandle.client?.id).toBe('client-B-id');
    });

    test('child mutation targets parent B after parent A is resolved and rebound to B', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const clientB = { id: 'client-B-id', clientId: 'client-b' };
      const roleA = { id: 'role-on-A', name: 'reader', description: 'A' };
      const roleB = { id: 'role-on-B', name: 'reader', description: 'B' };
      const roleBUpdated = { id: 'role-on-B', name: 'reader', description: 'updated' };
      const core = createMockAdminClient({
        clients: {
          find: vi.fn().mockResolvedValueOnce([clientA]).mockResolvedValueOnce([clientB]),
          findRole: vi
            .fn()
            .mockResolvedValueOnce(roleA)
            .mockResolvedValueOnce(roleB)
            .mockResolvedValueOnce(roleBUpdated),
          updateRole: vi.fn().mockResolvedValue(undefined),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientHandle = realmHandle.client('client-a');
      const roleHandle = clientHandle.role('reader');

      await roleHandle.get();
      clientHandle.rebind('client-b');

      await roleHandle.update({ description: 'updated' });
      expect(core.clients.updateRole).toHaveBeenCalledWith(
        { realm: 'demo', id: 'client-B-id', roleName: 'reader' },
        { id: 'role-on-B', name: 'reader', description: 'updated' },
      );
      expect(core.clients.updateRole).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'client-A-id' }),
        expect.anything(),
      );
      expect(roleHandle.role?.id).toBe('role-on-B');
    });

    test('child does not duplicate the client lookup when parent already resolved', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const core = createMockAdminClient({
        clients: {
          find: vi.fn().mockResolvedValue([clientA]),
          findRole: vi.fn().mockResolvedValue({ id: 'role-on-A', name: 'reader' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientHandle = realmHandle.client('client-a');
      const roleHandle = clientHandle.role('reader');

      await clientHandle.get(); // parent resolves -> client[a]
      expect(core.clients.find).toHaveBeenCalledTimes(1);

      await roleHandle.get(); // child reuses the parent snapshot
      expect(core.clients.find).toHaveBeenCalledTimes(1);
      expect(core.clients.findRole).toHaveBeenCalledWith({
        realm: 'demo',
        id: 'client-A-id',
        roleName: 'reader',
      });
    });
  });

  describe('ProtocolMapperHandle (client protocol mappers)', () => {
    test('child read targets parent B after parent A is resolved and rebound to B', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const clientB = { id: 'client-B-id', clientId: 'client-b' };
      const core = createMockAdminClient({
        clients: {
          find: vi.fn().mockResolvedValueOnce([clientA]).mockResolvedValueOnce([clientB]),
          findProtocolMapperByName: vi
            .fn()
            .mockResolvedValueOnce({ id: 'mapper-on-A', name: 'email' })
            .mockResolvedValueOnce({ id: 'mapper-on-B', name: 'email' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientHandle = realmHandle.client('client-a');
      const mapperHandle = clientHandle.protocolMapper('email');

      await clientHandle.get();
      await mapperHandle.get();
      expect(core.clients.findProtocolMapperByName).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'client-A-id',
        name: 'email',
      });
      expect(mapperHandle.clientId).toBe('client-a');

      clientHandle.rebind('client-b');

      await mapperHandle.get();
      expect(core.clients.findProtocolMapperByName).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'client-B-id',
        name: 'email',
      });
      expect(mapperHandle.clientId).toBe('client-b');
      expect(mapperHandle.client?.id).toBe('client-B-id');
    });

    test('child mutation targets parent B after parent A is resolved and rebound to B', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const clientB = { id: 'client-B-id', clientId: 'client-b' };
      const mapperA = { id: 'mapper-on-A', name: 'email', config: { a: '1' } };
      const mapperB = { id: 'mapper-on-B', name: 'email', config: { b: '1' } };
      const mapperBUpdated = { id: 'mapper-on-B', name: 'email', config: { b: '2' } };
      const core = createMockAdminClient({
        clients: {
          find: vi.fn().mockResolvedValueOnce([clientA]).mockResolvedValueOnce([clientB]),
          findProtocolMapperByName: vi
            .fn()
            .mockResolvedValueOnce(mapperA)
            .mockResolvedValueOnce(mapperB)
            .mockResolvedValueOnce(mapperBUpdated),
          updateProtocolMapper: vi.fn().mockResolvedValue(undefined),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientHandle = realmHandle.client('client-a');
      const mapperHandle = clientHandle.protocolMapper('email');

      await mapperHandle.get();
      clientHandle.rebind('client-b');

      await mapperHandle.update({ config: { b: '2' } });
      expect(core.clients.updateProtocolMapper).toHaveBeenCalledWith(
        { realm: 'demo', id: 'client-B-id', mapperId: 'mapper-on-B' },
        { id: 'mapper-on-B', name: 'email', config: { b: '2' } },
      );
      expect(core.clients.updateProtocolMapper).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'client-A-id' }),
        expect.anything(),
      );
      expect(mapperHandle.clientProtocolMapper?.id).toBe('mapper-on-B');
    });

    test('child does not duplicate the client lookup when parent already resolved', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const core = createMockAdminClient({
        clients: {
          find: vi.fn().mockResolvedValue([clientA]),
          findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-on-A', name: 'email' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientHandle = realmHandle.client('client-a');
      const mapperHandle = clientHandle.protocolMapper('email');

      await clientHandle.get();
      expect(core.clients.find).toHaveBeenCalledTimes(1);

      await mapperHandle.get();
      expect(core.clients.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('ClientScopeProtocolMapperHandle', () => {
    test('child read targets parent B after parent A is resolved and rebound to B', async () => {
      const scopeA = { id: 'scope-A-id', name: 'scope-a' };
      const scopeB = { id: 'scope-B-id', name: 'scope-b' };
      const core = createMockAdminClient({
        clientScopes: {
          find: vi
            // ClientScopeHandle.get() lists all scopes; return different sets on each call.
            .fn()
            .mockResolvedValueOnce([scopeA])
            .mockResolvedValueOnce([scopeB]),
          findProtocolMapperByName: vi
            .fn()
            .mockResolvedValueOnce({ id: 'mapper-on-A', name: 'email' })
            .mockResolvedValueOnce({ id: 'mapper-on-B', name: 'email' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientScopeHandle = realmHandle.clientScope('scope-a');
      const mapperHandle = clientScopeHandle.protocolMapper('email');

      await clientScopeHandle.get();
      await mapperHandle.get();
      expect(core.clientScopes.findProtocolMapperByName).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'scope-A-id',
        name: 'email',
      });
      expect(mapperHandle.scopeName).toBe('scope-a');

      clientScopeHandle.rebind('scope-b');

      await mapperHandle.get();
      expect(core.clientScopes.findProtocolMapperByName).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'scope-B-id',
        name: 'email',
      });
      expect(mapperHandle.scopeName).toBe('scope-b');
      expect(mapperHandle.clientScope?.id).toBe('scope-B-id');
    });

    test('child mutation targets parent B after parent A is resolved and rebound to B', async () => {
      const scopeA = { id: 'scope-A-id', name: 'scope-a' };
      const scopeB = { id: 'scope-B-id', name: 'scope-b' };
      const mapperA = { id: 'mapper-on-A', name: 'email', config: { a: '1' } };
      const mapperB = { id: 'mapper-on-B', name: 'email', config: { b: '1' } };
      const mapperBUpdated = { id: 'mapper-on-B', name: 'email', config: { b: '2' } };
      const core = createMockAdminClient({
        clientScopes: {
          find: vi.fn().mockResolvedValueOnce([scopeA]).mockResolvedValueOnce([scopeB]),
          findProtocolMapperByName: vi
            .fn()
            .mockResolvedValueOnce(mapperA)
            .mockResolvedValueOnce(mapperB)
            .mockResolvedValueOnce(mapperBUpdated),
          updateProtocolMapper: vi.fn().mockResolvedValue(undefined),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientScopeHandle = realmHandle.clientScope('scope-a');
      const mapperHandle = clientScopeHandle.protocolMapper('email');

      await mapperHandle.get();
      clientScopeHandle.rebind('scope-b');

      await mapperHandle.update({ config: { b: '2' } });
      expect(core.clientScopes.updateProtocolMapper).toHaveBeenCalledWith(
        { realm: 'demo', id: 'scope-B-id', mapperId: 'mapper-on-B' },
        { id: 'mapper-on-B', name: 'email', config: { b: '2' } },
      );
      expect(core.clientScopes.updateProtocolMapper).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'scope-A-id' }),
        expect.anything(),
      );
      expect(mapperHandle.clientScopeProtocolMapper?.id).toBe('mapper-on-B');
    });

    test('child does not duplicate the scope lookup when parent already resolved', async () => {
      const scopeA = { id: 'scope-A-id', name: 'scope-a' };
      const core = createMockAdminClient({
        clientScopes: {
          find: vi.fn().mockResolvedValue([scopeA]),
          findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-on-A', name: 'email' }),
        },
      });

      const realmHandle = new RealmHandle(core, 'demo');
      const clientScopeHandle = realmHandle.clientScope('scope-a');
      const mapperHandle = clientScopeHandle.protocolMapper('email');

      await clientScopeHandle.get();
      expect(core.clientScopes.find).toHaveBeenCalledTimes(1);

      await mapperHandle.get();
      expect(core.clientScopes.find).toHaveBeenCalledTimes(1);
    });
  });
});
