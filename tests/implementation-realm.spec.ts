import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';

describe('Implementation Consistency: Realm', () => {
  test('realm searches use offset-based pagination', async () => {
    const core = {
      clients: { find: vi.fn().mockResolvedValue([]) },
      roles: { find: vi.fn().mockResolvedValue([]) },
      groups: { find: vi.fn().mockResolvedValue([]) },
      users: { find: vi.fn().mockResolvedValue([]) },
      organizations: { find: vi.fn().mockResolvedValue([]) },
      workflows: {
        find: vi.fn().mockResolvedValue([
          { id: 'wf-1', name: 'approval' },
          { id: 'wf-2', name: 'auto-approval' },
        ]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await realmHandle.searchClients('client', { page: 3, pageSize: 25 });
    await realmHandle.searchRoles('role', { page: 2, pageSize: 50 });
    await realmHandle.searchGroups('group', { page: 4, pageSize: 10 });
    await realmHandle.searchUsers('alice', { page: 5, pageSize: 20, attribute: 'email' });
    await realmHandle.searchOrganizations('acme', { page: 6, pageSize: 15 });
    await expect(realmHandle.searchWorkflows('approval', { page: 1, pageSize: 1 })).resolves.toEqual([
      { id: 'wf-1', name: 'approval' },
    ]);

    expect(core.clients.find).toHaveBeenCalledWith({
      realm: 'demo',
      first: 50,
      max: 25,
      clientId: 'client',
      search: true,
    });

    expect(core.roles.find).toHaveBeenCalledWith({
      realm: 'demo',
      first: 50,
      max: 50,
      search: 'role',
      briefRepresentation: false,
    });

    expect(core.groups.find).toHaveBeenCalledWith({
      realm: 'demo',
      first: 30,
      max: 10,
      search: 'group',
      exact: false,
      briefRepresentation: false,
    });

    expect(core.users.find).toHaveBeenCalledWith({
      realm: 'demo',
      first: 80,
      max: 20,
      q: 'email:alice',
      exact: false,
      briefRepresentation: false,
    });

    expect(core.organizations.find).toHaveBeenCalledWith({
      realm: 'demo',
      search: 'acme',
      exact: false,
      first: 75,
      max: 15,
    });

    expect(core.workflows.find).toHaveBeenCalledWith({ realm: 'demo' });
  });

  test('realm event queries use offset-based pagination', async () => {
    const core = {
      realms: {
        findEvents: vi.fn().mockResolvedValue([]),
        findAdminEvents: vi.fn().mockResolvedValue([]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await realmHandle.findEvents({ type: 'LOGIN', page: 3, pageSize: 25, user: 'user-1' });
    await realmHandle.findAdminEvents({ resourceTypes: 'USER', operationTypes: 'CREATE', page: 2, pageSize: 50 });

    expect(core.realms.findEvents).toHaveBeenCalledWith({
      realm: 'demo',
      client: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      first: 50,
      ipAddress: undefined,
      max: 25,
      type: 'LOGIN',
      user: 'user-1',
    });

    expect(core.realms.findAdminEvents).toHaveBeenCalledWith({
      realm: 'demo',
      authClient: undefined,
      authIpAddress: undefined,
      authRealm: undefined,
      authUser: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      first: 50,
      max: 50,
      operationTypes: 'CREATE',
      resourcePath: undefined,
      resourceTypes: 'USER',
    });
  });

  test('realm import and export forward to the admin client', async () => {
    const partialImportResponse = { added: 1, skipped: 0, overwritten: 0, results: [] };
    const exportedRealm = { realm: 'demo', displayName: 'Demo Realm' };
    const core = {
      realms: {
        partialImport: vi.fn().mockResolvedValue(partialImportResponse),
        export: vi.fn().mockResolvedValue(exportedRealm),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await expect(
      realmHandle.partialImport({ ifResourceExists: 'OVERWRITE', users: [{ username: 'alice' }] } as any),
    ).resolves.toEqual(partialImportResponse);
    await expect(realmHandle.export({ exportClients: true, exportGroupsAndRoles: true })).resolves.toEqual(
      exportedRealm,
    );

    expect(core.realms.partialImport).toHaveBeenCalledWith({
      realm: 'demo',
      rep: { ifResourceExists: 'OVERWRITE', users: [{ username: 'alice' }] },
    });
    expect(core.realms.export).toHaveBeenCalledWith({
      realm: 'demo',
      exportClients: true,
      exportGroupsAndRoles: true,
    });
  });

  test('realm default group operations resolve the group lazily', async () => {
    const core = {
      groups: {
        find: vi.fn().mockResolvedValue([{ id: 'group-1', name: 'admins' }]),
      },
      realms: {
        addDefaultGroup: vi.fn().mockResolvedValue(undefined),
        removeDefaultGroup: vi.fn().mockResolvedValue(undefined),
        getDefaultGroups: vi.fn().mockResolvedValue([{ id: 'group-1', name: 'admins' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const groupHandle = realmHandle.group('admins');

    await expect(realmHandle.addDefaultGroup(groupHandle)).resolves.toEqual([{ id: 'group-1', name: 'admins' }]);
    await expect(realmHandle.removeDefaultGroup(groupHandle)).resolves.toEqual([{ id: 'group-1', name: 'admins' }]);

    expect(core.realms.addDefaultGroup).toHaveBeenCalledWith({ realm: 'demo', id: 'group-1' });
    expect(core.realms.removeDefaultGroup).toHaveBeenCalledWith({ realm: 'demo', id: 'group-1' });
  });

  test('realm localization methods use offset-based pagination and refresh after updates', async () => {
    const core = {
      realms: {
        getRealmLocalizationTexts: vi.fn().mockResolvedValue({ greeting: 'hello' }),
        addLocalization: vi.fn().mockResolvedValue(undefined),
        deleteRealmLocalizationTexts: vi.fn().mockResolvedValue(undefined),
        getRealmSpecificLocales: vi.fn().mockResolvedValue(['en', 'de']),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await expect(realmHandle.listLocales()).resolves.toEqual(['en', 'de']);
    await expect(realmHandle.getLocalizationTexts('en', { page: 3, pageSize: 25 })).resolves.toEqual({
      greeting: 'hello',
    });
    await expect(realmHandle.setLocalizationText('en', 'greeting', 'hello')).resolves.toEqual({ greeting: 'hello' });
    await realmHandle.deleteLocalizationTexts('en', 'greeting');

    expect(core.realms.getRealmLocalizationTexts).toHaveBeenNthCalledWith(1, {
      realm: 'demo',
      selectedLocale: 'en',
      first: 50,
      max: 25,
    });
    expect(core.realms.addLocalization).toHaveBeenCalledWith(
      {
        realm: 'demo',
        selectedLocale: 'en',
        key: 'greeting',
      },
      'hello',
    );
    expect(core.realms.deleteRealmLocalizationTexts).toHaveBeenCalledWith({
      realm: 'demo',
      selectedLocale: 'en',
      key: 'greeting',
    });
  });

  test('realm session, key, initial access, and users-permission helpers forward correctly', async () => {
    const core = {
      realms: {
        getClientsInitialAccess: vi.fn().mockResolvedValue([{ id: 'cia-1', count: 5 }]),
        createClientsInitialAccess: vi.fn().mockResolvedValue({ id: 'cia-2', count: 2, expiration: 3600 }),
        delClientsInitialAccess: vi.fn().mockResolvedValue(undefined),
        getUsersManagementPermissions: vi.fn().mockResolvedValue({ enabled: true, resource: 'users' }),
        updateUsersManagementPermissions: vi.fn().mockResolvedValue({ enabled: false, resource: 'users' }),
        getClientSessionStats: vi
          .fn()
          .mockResolvedValue([{ id: 'client-1', clientId: 'app', active: '1', offline: '0' }]),
        logoutAll: vi.fn().mockResolvedValue(undefined),
        removeSession: vi.fn().mockResolvedValue(undefined),
        deleteSession: vi.fn().mockResolvedValue(undefined),
        pushRevocation: vi.fn().mockResolvedValue({ successRequests: ['demo'] }),
        getKeys: vi.fn().mockResolvedValue({ active: { RS256: 'kid-1' }, keys: [] }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await expect(realmHandle.listClientsInitialAccess()).resolves.toEqual([{ id: 'cia-1', count: 5 }]);
    await expect(realmHandle.createClientsInitialAccess({ count: 2, expiration: 3600 })).resolves.toEqual({
      id: 'cia-2',
      count: 2,
      expiration: 3600,
    });
    await realmHandle.deleteClientsInitialAccess('cia-1');
    await expect(realmHandle.getUsersManagementPermissions()).resolves.toEqual({ enabled: true, resource: 'users' });
    await expect(realmHandle.updateUsersManagementPermissions(false)).resolves.toEqual({
      enabled: false,
      resource: 'users',
    });
    await expect(realmHandle.getClientSessionStats()).resolves.toEqual([
      { id: 'client-1', clientId: 'app', active: '1', offline: '0' },
    ]);
    await realmHandle.logoutAllSessions();
    await realmHandle.removeSession('session-1');
    await realmHandle.deleteSession('offline-session-1', true);
    await expect(realmHandle.pushRevocation()).resolves.toEqual({ successRequests: ['demo'] });
    await expect(realmHandle.getKeys()).resolves.toEqual({ active: { RS256: 'kid-1' }, keys: [] });

    expect(core.realms.createClientsInitialAccess).toHaveBeenCalledWith(
      { realm: 'demo' },
      { count: 2, expiration: 3600 },
    );
    expect(core.realms.delClientsInitialAccess).toHaveBeenCalledWith({ realm: 'demo', id: 'cia-1' });
    expect(core.realms.updateUsersManagementPermissions).toHaveBeenCalledWith({ realm: 'demo', enabled: false });
    expect(core.realms.logoutAll).toHaveBeenCalledWith({ realm: 'demo' });
    expect(core.realms.removeSession).toHaveBeenCalledWith({ realm: 'demo', sessionId: 'session-1' });
    expect(core.realms.deleteSession).toHaveBeenCalledWith({
      realm: 'demo',
      session: 'offline-session-1',
      isOffline: true,
    });
    expect(core.realms.pushRevocation).toHaveBeenCalledWith({ realm: 'demo' });
    expect(core.realms.getKeys).toHaveBeenCalledWith({ realm: 'demo' });
  });
});
