import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import GroupHandle from '../src/groups/group';

describe('Implementation Consistency', () => {
  test('realm searches use offset-based pagination', async () => {
    const core = {
      clients: { find: vi.fn().mockResolvedValue([]) },
      roles: { find: vi.fn().mockResolvedValue([]) },
      groups: { find: vi.fn().mockResolvedValue([]) },
      users: { find: vi.fn().mockResolvedValue([]) },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await realmHandle.searchClients('client', { page: 3, pageSize: 25 });
    await realmHandle.searchRoles('role', { page: 2, pageSize: 50 });
    await realmHandle.searchGroups('group', { page: 4, pageSize: 10 });
    await realmHandle.searchUsers('alice', { page: 5, pageSize: 20, attribute: 'email' });

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
  });

  test('client getById forwards the provided internal id', async () => {
    const core = {
      clients: {
        findOne: vi.fn().mockResolvedValue({ id: 'internal-id', clientId: 'resolved-client' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('public-client-id');

    await clientHandle.getById('internal-id');

    expect(core.clients.findOne).toHaveBeenCalledWith({ realm: 'demo', id: 'internal-id' });
    expect(clientHandle.clientId).toBe('resolved-client');
  });

  test('client role handle resolves its client lazily', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        findRole: vi.fn().mockResolvedValue({ id: 'role-1', name: 'reader' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const roleHandle = realmHandle.client('app-client').role('reader');

    await expect(roleHandle.get()).resolves.toMatchObject({ id: 'role-1', name: 'reader' });
    expect(core.clients.findRole).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      roleName: 'reader',
    });
  });

  test('protocol mapper handle resolves its client lazily', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-1', name: 'email-mapper' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const mapperHandle = realmHandle.client('app-client').protocolMapper('email-mapper');

    await expect(mapperHandle.get()).resolves.toMatchObject({ id: 'mapper-1', name: 'email-mapper' });
    expect(core.clients.findProtocolMapperByName).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      name: 'email-mapper',
    });
  });

  test('user operations resolve the user before listing groups', async () => {
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        listGroups: vi
          .fn()
          .mockResolvedValueOnce([{ id: 'group-1', name: 'admins' }])
          .mockResolvedValueOnce([]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');

    await expect(userHandle.listAssignedGroups()).resolves.toEqual([{ id: 'group-1', name: 'admins' }]);
    expect(core.users.listGroups).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      first: 0,
      max: 100,
      briefRepresentation: false,
    });
  });

  test('identity provider update applies the same normalization as create', async () => {
    const core = {
      identityProviders: {
        findOne: vi.fn().mockResolvedValue({ alias: 'demo-idp' }),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const identityProviderHandle = realmHandle.identityProvider('demo-idp');

    await identityProviderHandle.update({
      providerId: 'oidc',
      config: {
        jwksUrl: 'https://issuer.example/jwks',
      },
    });

    expect(core.identityProviders.update).toHaveBeenCalledWith(
      { realm: 'demo', alias: 'demo-idp' },
      expect.objectContaining({
        alias: 'demo-idp',
        providerId: 'oidc',
        config: expect.objectContaining({
          jwksUrl: 'https://issuer.example/jwks',
          useJwksUrl: 'true',
        }),
      }),
    );
  });

  test('group path traversal retries transient subgroup lookup failures', async () => {
    const listSubGroups = vi
      .fn()
      .mockRejectedValueOnce(new Error('unknown_error'))
      .mockResolvedValueOnce([{ id: 'child-1', name: 'child' }]);

    const core = {
      groups: {
        find: vi.fn().mockResolvedValue([{ id: 'parent-1', name: 'parent' }]),
        listSubGroups,
      },
    } as any;

    await expect(GroupHandle.getByPath(core, 'demo', '/parent/child')).resolves.toMatchObject({
      id: 'child-1',
      name: 'child',
    });

    expect(listSubGroups).toHaveBeenCalledTimes(2);
    expect(listSubGroups).toHaveBeenLastCalledWith({
      realm: 'demo',
      parentId: 'parent-1',
      briefRepresentation: false,
      first: 0,
      max: 1000,
    });
  });
});
