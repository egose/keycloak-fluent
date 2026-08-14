import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';

describe('Implementation Regressions: Stale Child Parent Snapshots (HANDLE-01)', () => {
  describe('ClientRoleHandle', () => {
    test('child targets parent B after parent A is resolved and rebound to B', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const clientB = { id: 'client-B-id', clientId: 'client-b' };
      const core = {
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
      } as any;

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

      // Re-target the parent handle at B via the public rebind() contract
      // (HANDLE-02). The previous child cache holds A; clear it through the
      // child's own public rebind() (re-asserting the same role name) so the
      // next read re-resolves against B.
      clientHandle.rebind('client-b');
      roleHandle.rebind(roleHandle.roleName);

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

    test('child does not duplicate the client lookup when parent already resolved', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const core = {
        clients: {
          find: vi.fn().mockResolvedValue([clientA]),
          findRole: vi.fn().mockResolvedValue({ id: 'role-on-A', name: 'reader' }),
        },
      } as any;

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
    test('child targets parent B after parent A is resolved and rebound to B', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const clientB = { id: 'client-B-id', clientId: 'client-b' };
      const core = {
        clients: {
          find: vi.fn().mockResolvedValueOnce([clientA]).mockResolvedValueOnce([clientB]),
          findProtocolMapperByName: vi
            .fn()
            .mockResolvedValueOnce({ id: 'mapper-on-A', name: 'email' })
            .mockResolvedValueOnce({ id: 'mapper-on-B', name: 'email' }),
        },
      } as any;

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

      // Re-target the parent at B through the public rebind() contract
      // (HANDLE-02) and clear the child's cached representation the same
      // way (re-asserting the same mapper name).
      clientHandle.rebind('client-b');
      mapperHandle.rebind(mapperHandle.mapperName);

      await mapperHandle.get();
      expect(core.clients.findProtocolMapperByName).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'client-B-id',
        name: 'email',
      });
      expect(mapperHandle.clientId).toBe('client-b');
      expect(mapperHandle.client?.id).toBe('client-B-id');
    });

    test('child does not duplicate the client lookup when parent already resolved', async () => {
      const clientA = { id: 'client-A-id', clientId: 'client-a' };
      const core = {
        clients: {
          find: vi.fn().mockResolvedValue([clientA]),
          findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-on-A', name: 'email' }),
        },
      } as any;

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
    test('child targets parent B after parent A is resolved and rebound to B', async () => {
      const scopeA = { id: 'scope-A-id', name: 'scope-a' };
      const scopeB = { id: 'scope-B-id', name: 'scope-b' };
      const core = {
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
      } as any;

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

      // Re-target the parent at B through the public rebind() contract
      // (HANDLE-02) and clear the child's cached representation the same
      // way (re-asserting the same mapper name).
      clientScopeHandle.rebind('scope-b');
      mapperHandle.rebind(mapperHandle.mapperName);

      await mapperHandle.get();
      expect(core.clientScopes.findProtocolMapperByName).toHaveBeenLastCalledWith({
        realm: 'demo',
        id: 'scope-B-id',
        name: 'email',
      });
      expect(mapperHandle.scopeName).toBe('scope-b');
      expect(mapperHandle.clientScope?.id).toBe('scope-B-id');
    });

    test('child does not duplicate the scope lookup when parent already resolved', async () => {
      const scopeA = { id: 'scope-A-id', name: 'scope-a' };
      const core = {
        clientScopes: {
          find: vi.fn().mockResolvedValue([scopeA]),
          findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-on-A', name: 'email' }),
        },
      } as any;

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
