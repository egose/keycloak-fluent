import { describe, expect, test, vi } from 'vitest';
import { RequiredActionAlias } from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
import RealmHandle from '../src/realm';
import GroupHandle from '../src/groups/group';

describe('Implementation Consistency: Regressions', () => {
  test('service account user lookup resolves the client lazily', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'svc-client' }]),
        getServiceAccountUser: vi.fn().mockResolvedValue({ id: 'user-1', username: 'service-account-svc-client' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const serviceAccountHandle = realmHandle.serviceAccount('svc-client');

    await expect(serviceAccountHandle.getUser()).resolves.toMatchObject({
      id: 'user-1',
      username: 'service-account-svc-client',
    });
    expect(core.clients.getServiceAccountUser).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
    });
  });

  test('client scope protocol mapper handle resolves its scope lazily', async () => {
    const core = {
      clientScopes: {
        find: vi.fn().mockResolvedValue([{ id: 'scope-1', name: 'profile' }]),
        findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-1', name: 'email-mapper' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const mapperHandle = realmHandle.clientScope('profile').protocolMapper('email-mapper');

    await expect(mapperHandle.get()).resolves.toMatchObject({ id: 'mapper-1', name: 'email-mapper' });
    expect(core.clientScopes.findProtocolMapperByName).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'scope-1',
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

  test('user required action addition resolves the user lazily and avoids duplicates', async () => {
    const updatedUser = { id: 'user-1', username: 'alice', requiredActions: [RequiredActionAlias.UPDATE_PASSWORD] };
    const core = {
      users: {
        find: vi
          .fn()
          .mockResolvedValueOnce([{ id: 'user-1', username: 'alice', requiredActions: [] }])
          .mockResolvedValueOnce([updatedUser]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');

    await userHandle.addRequiredAction(RequiredActionAlias.UPDATE_PASSWORD);

    expect(core.users.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'user-1' },
      expect.objectContaining({
        username: 'alice',
        requiredActions: [RequiredActionAlias.UPDATE_PASSWORD],
      }),
    );
  });

  test('execute actions email resolves the user lazily and forwards options', async () => {
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        executeActionsEmail: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');

    await userHandle.executeActionsEmail([RequiredActionAlias.UPDATE_PASSWORD], {
      clientId: 'account-console',
      lifespan: 900,
      redirectUri: 'https://example.com/account',
    });

    expect(core.users.executeActionsEmail).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      actions: [RequiredActionAlias.UPDATE_PASSWORD],
      clientId: 'account-console',
      lifespan: 900,
      redirectUri: 'https://example.com/account',
    });
  });

  test('user federated identity link resolves user and provider lazily', async () => {
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        addToFederatedIdentity: vi.fn().mockResolvedValue(undefined),
      },
      identityProviders: {
        findOne: vi.fn().mockResolvedValue({ alias: 'google' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');
    const identityProviderHandle = realmHandle.identityProvider('google');

    await userHandle.linkFederatedIdentity(identityProviderHandle, {
      userId: 'external-1',
      userName: 'alice@example.com',
    });

    expect(core.users.addToFederatedIdentity).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      federatedIdentityId: 'google',
      federatedIdentity: {
        identityProvider: 'google',
        userId: 'external-1',
        userName: 'alice@example.com',
      },
    });
  });

  test('user offline session listing resolves user and client lazily', async () => {
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        listOfflineSessions: vi.fn().mockResolvedValue([]),
      },
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'account-console' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');

    await userHandle.listOfflineSessions(realmHandle.client('account-console'));

    expect(core.users.listOfflineSessions).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      clientId: 'account-console',
    });
  });

  test('user session logout resolves the user lazily', async () => {
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        logout: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const userHandle = realmHandle.user('alice');

    await userHandle.logoutSessions();

    expect(core.users.logout).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
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

  test('identity provider mapper handle resolves its provider lazily', async () => {
    const core = {
      identityProviders: {
        findOne: vi.fn().mockResolvedValue({ alias: 'demo-idp' }),
        findMappers: vi.fn().mockResolvedValue([{ id: 'mapper-1', name: 'email-mapper' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const mapperHandle = realmHandle.identityProvider('demo-idp').mapper('email-mapper');

    await expect(mapperHandle.get()).resolves.toMatchObject({ id: 'mapper-1', name: 'email-mapper' });
    expect(core.identityProviders.findMappers).toHaveBeenCalledWith({
      realm: 'demo',
      alias: 'demo-idp',
    });
  });

  test('group role assignment resolves group and role lazily', async () => {
    const core = {
      groups: {
        find: vi.fn().mockResolvedValue([{ id: 'group-1', name: 'staff' }]),
        addRealmRoleMappings: vi.fn().mockResolvedValue(undefined),
      },
      roles: {
        findOneByName: vi.fn().mockResolvedValue({ id: 'role-1', name: 'staff-role' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const groupHandle = realmHandle.group('staff');
    const roleHandle = realmHandle.role('staff-role');

    await groupHandle.assignRole(roleHandle);

    expect(core.groups.addRealmRoleMappings).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'group-1',
      roles: [{ id: 'role-1', name: 'staff-role' }],
    });
  });

  test('group lookup retries transient root lookup failures', async () => {
    const core = {
      groups: {
        find: vi
          .fn()
          .mockRejectedValueOnce(new Error('unknown_error'))
          .mockResolvedValueOnce([{ id: 'group-1', name: 'parent' }]),
      },
    } as any;

    await expect(GroupHandle.getByName(core, 'demo', 'parent')).resolves.toMatchObject({
      id: 'group-1',
      name: 'parent',
    });

    expect(core.groups.find).toHaveBeenCalledTimes(2);
    expect(core.groups.find).toHaveBeenLastCalledWith({
      realm: 'demo',
      search: 'parent',
      exact: true,
    });
  });

  test('realm role composite addition resolves composite role lazily', async () => {
    const core = {
      roles: {
        findOneByName: vi
          .fn()
          .mockResolvedValueOnce({ id: 'parent-1', name: 'parent-role' })
          .mockResolvedValueOnce({ id: 'child-1', name: 'child-role' }),
        createComposite: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const parentRoleHandle = realmHandle.role('parent-role');
    const childRoleHandle = realmHandle.role('child-role');

    await parentRoleHandle.addComposite(childRoleHandle);

    expect(core.roles.createComposite).toHaveBeenCalledWith({ realm: 'demo', roleId: 'parent-1' }, [
      { id: 'child-1', name: 'child-role' },
    ]);
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
