import { describe, expect, test, vi } from 'vitest';
import KeycloakAdminClientFluent from '../src/index';
import RealmHandle from '../src/realm';

describe('Implementation Consistency: Resource Handles', () => {
  test('organization handle supports CRUD, membership, invitations, and identity provider linking', async () => {
    const inviteFormData = new FormData();
    const existingUserInviteFormData = new FormData();
    const core = {
      organizations: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'org-1', alias: 'acme', name: 'Acme Corp' }])
          .mockResolvedValueOnce([{ id: 'org-1', alias: 'acme', name: 'Acme Corp' }])
          .mockResolvedValueOnce([{ id: 'org-1', alias: 'acme', name: 'Acme Corp' }]),
        findOne: vi.fn().mockResolvedValue({ id: 'org-1', alias: 'acme', name: 'Acme Corp' }),
        create: vi.fn().mockResolvedValue({ id: 'org-1' }),
        updateById: vi.fn().mockResolvedValue(undefined),
        delById: vi.fn().mockResolvedValue(undefined),
        listMembers: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
        addMember: vi.fn().mockResolvedValue('created'),
        delMember: vi.fn().mockResolvedValue('deleted'),
        invite: vi.fn().mockResolvedValue({ invited: true }),
        inviteExistingUser: vi.fn().mockResolvedValue({ invitedExisting: true }),
        listIdentityProviders: vi.fn().mockResolvedValue([{ alias: 'google' }]),
        linkIdp: vi.fn().mockResolvedValue('linked'),
        unLinkIdp: vi.fn().mockResolvedValue('unlinked'),
      },
      users: {
        find: vi.fn().mockResolvedValue([{ id: 'user-1', username: 'alice' }]),
      },
      identityProviders: {
        findOne: vi.fn().mockResolvedValue({ alias: 'google' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const organizationHandle = realmHandle.organization('acme');
    const userHandle = realmHandle.user('alice');
    const identityProviderHandle = realmHandle.identityProvider('google');

    await expect(organizationHandle.create({ name: 'Acme Corp' })).resolves.toEqual({
      id: 'org-1',
      alias: 'acme',
      name: 'Acme Corp',
    });
    await expect(organizationHandle.update({ name: 'Acme Corp' })).resolves.toEqual({
      id: 'org-1',
      alias: 'acme',
      name: 'Acme Corp',
    });
    await expect(organizationHandle.listMembers({ page: 2, pageSize: 25, membershipType: 'managed' })).resolves.toEqual(
      [{ id: 'user-1', username: 'alice' }],
    );
    await expect(organizationHandle.addMember(userHandle)).resolves.toEqual([{ id: 'user-1', username: 'alice' }]);
    await expect(organizationHandle.removeMember(userHandle)).resolves.toEqual([{ id: 'user-1', username: 'alice' }]);
    await expect(organizationHandle.invite(inviteFormData)).resolves.toEqual({ invited: true });
    await expect(organizationHandle.inviteExistingUser(existingUserInviteFormData)).resolves.toEqual({
      invitedExisting: true,
    });
    await expect(organizationHandle.listIdentityProviders()).resolves.toEqual([{ alias: 'google' }]);
    await expect(organizationHandle.linkIdentityProvider(identityProviderHandle)).resolves.toEqual([
      { alias: 'google' },
    ]);
    await expect(organizationHandle.unlinkIdentityProvider(identityProviderHandle)).resolves.toEqual([
      { alias: 'google' },
    ]);
    await expect(organizationHandle.delete()).resolves.toBe('acme');

    expect(core.organizations.create).toHaveBeenCalledWith({
      realm: 'demo',
      alias: 'acme',
      enabled: true,
      name: 'Acme Corp',
    });
    expect(core.organizations.updateById).toHaveBeenCalledWith(
      { realm: 'demo', id: 'org-1' },
      expect.objectContaining({
        id: 'org-1',
        alias: 'acme',
        name: 'Acme Corp',
      }),
    );
    expect(core.organizations.listMembers).toHaveBeenCalledWith({
      realm: 'demo',
      orgId: 'org-1',
      first: 25,
      max: 25,
      membershipType: 'managed',
    });
    expect(core.organizations.addMember).toHaveBeenCalledWith({
      realm: 'demo',
      orgId: 'org-1',
      userId: 'user-1',
    });
    expect(core.organizations.linkIdp).toHaveBeenCalledWith({
      realm: 'demo',
      orgId: 'org-1',
      alias: 'google',
    });
    expect(core.organizations.delById).toHaveBeenCalledWith({ realm: 'demo', id: 'org-1' });
  });

  test('organization handle supports getById, ensure create path, and discard', async () => {
    const core = {
      organizations: {
        findOne: vi.fn().mockResolvedValue({ id: 'org-1', alias: 'acme', name: 'Acme Corp' }),
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'org-1', alias: 'acme', name: 'Acme Corp' }])
          .mockResolvedValueOnce([{ id: 'org-1', alias: 'acme', name: 'Acme Corp' }])
          .mockResolvedValueOnce([]),
        create: vi.fn().mockResolvedValue({ id: 'org-1' }),
        delById: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const organizationHandle = realmHandle.organization('acme');

    await expect(organizationHandle.getById('org-1')).resolves.toEqual({
      id: 'org-1',
      alias: 'acme',
      name: 'Acme Corp',
    });
    await expect(organizationHandle.ensure({ name: 'Acme Corp' })).resolves.toBe(organizationHandle);
    await expect(organizationHandle.discard()).resolves.toBe('acme');

    expect(core.organizations.create).toHaveBeenCalledWith({
      realm: 'demo',
      alias: 'acme',
      enabled: true,
      name: 'Acme Corp',
    });
    expect(core.organizations.delById).toHaveBeenCalledWith({ realm: 'demo', id: 'org-1' });
  });

  test('organization alias ambiguity is rejected', async () => {
    const core = {
      organizations: {
        find: vi.fn().mockResolvedValue([
          { id: 'org-1', alias: 'acme' },
          { id: 'org-2', alias: 'acme' },
        ]),
      },
    } as any;

    const organizationHandle = new RealmHandle(core, 'demo').organization('acme');

    await expect(organizationHandle.get()).rejects.toThrow('Organization alias "acme" is ambiguous in realm "demo"');
  });

  test('user storage provider helpers forward sync and cleanup operations', async () => {
    const core = {
      userStorageProvider: {
        name: vi.fn().mockResolvedValue({ id: 'provider-1', name: 'ldap-users' }),
        removeImportedUsers: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue({ added: 4, updated: 2, removed: 1, failed: 0 }),
        unlinkUsers: vi.fn().mockResolvedValue(undefined),
        mappersSync: vi.fn().mockResolvedValue({ added: 1, updated: 0, removed: 0, failed: 0 }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const providerHandle = realmHandle.userStorageProvider('provider-1');

    await expect(providerHandle.getName()).resolves.toEqual({ id: 'provider-1', name: 'ldap-users' });
    await providerHandle.removeImportedUsers();
    await expect(providerHandle.sync('triggerFullSync')).resolves.toEqual({
      added: 4,
      updated: 2,
      removed: 1,
      failed: 0,
    });
    await providerHandle.unlinkUsers();
    await expect(providerHandle.syncMappers('mapper-parent-1', 'fedToKeycloak')).resolves.toEqual({
      added: 1,
      updated: 0,
      removed: 0,
      failed: 0,
    });

    expect(core.userStorageProvider.name).toHaveBeenCalledWith({ realm: 'demo', id: 'provider-1' });
    expect(core.userStorageProvider.removeImportedUsers).toHaveBeenCalledWith({ realm: 'demo', id: 'provider-1' });
    expect(core.userStorageProvider.sync).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'provider-1',
      action: 'triggerFullSync',
    });
    expect(core.userStorageProvider.unlinkUsers).toHaveBeenCalledWith({ realm: 'demo', id: 'provider-1' });
    expect(core.userStorageProvider.mappersSync).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'provider-1',
      parentId: 'mapper-parent-1',
      direction: 'fedToKeycloak',
    });
  });

  test('user storage provider changed-user sync is forwarded', async () => {
    const core = {
      userStorageProvider: {
        sync: vi.fn().mockResolvedValue({ added: 0, updated: 3, removed: 0, failed: 0 }),
      },
    } as any;

    const providerHandle = new RealmHandle(core, 'demo').userStorageProvider('provider-1');

    await expect(providerHandle.sync('triggerChangedUsersSync')).resolves.toEqual({
      added: 0,
      updated: 3,
      removed: 0,
      failed: 0,
    });
    expect(core.userStorageProvider.sync).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'provider-1',
      action: 'triggerChangedUsersSync',
    });
  });

  test('cache and attack detection helpers forward realm-scoped system operations', async () => {
    const core = {
      cache: {
        clearUserCache: vi.fn().mockResolvedValue(undefined),
        clearKeysCache: vi.fn().mockResolvedValue(undefined),
        clearCrlCache: vi.fn().mockResolvedValue(undefined),
        clearRealmCache: vi.fn().mockResolvedValue(undefined),
      },
      attackDetection: {
        findOne: vi.fn().mockResolvedValue({ disabled: false, numFailures: 2 }),
        del: vi.fn().mockResolvedValue(undefined),
        delAll: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await realmHandle.cache().clearUserCache();
    await realmHandle.cache().clearKeysCache();
    await realmHandle.cache().clearCrlCache();
    await realmHandle.cache().clearRealmCache();

    await expect(realmHandle.attackDetection('user-1').get()).resolves.toEqual({ disabled: false, numFailures: 2 });
    await realmHandle.attackDetection('user-1').clear();
    await realmHandle.attackDetection().clearAll();

    expect(core.cache.clearUserCache).toHaveBeenCalledWith({ realm: 'demo' });
    expect(core.cache.clearKeysCache).toHaveBeenCalledWith({ realm: 'demo' });
    expect(core.cache.clearCrlCache).toHaveBeenCalledWith({ realm: 'demo' });
    expect(core.cache.clearRealmCache).toHaveBeenCalledWith({ realm: 'demo' });
    expect(core.attackDetection.findOne).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' });
    expect(core.attackDetection.del).toHaveBeenCalledWith({ realm: 'demo', id: 'user-1' });
    expect(core.attackDetection.delAll).toHaveBeenCalledWith({ realm: 'demo' });
  });

  test('attack detection forUser binds the user id for later calls', async () => {
    const core = {
      attackDetection: {
        findOne: vi.fn().mockResolvedValue({ disabled: true }),
      },
    } as any;

    const attackDetectionHandle = new RealmHandle(core, 'demo').attackDetection().forUser('user-2');

    await expect(attackDetectionHandle.get()).resolves.toEqual({ disabled: true });
    expect(core.attackDetection.findOne).toHaveBeenCalledWith({ realm: 'demo', id: 'user-2' });
  });

  test('client policies helpers forward profiles and policies operations', async () => {
    const core = {
      clientPolicies: {
        listProfiles: vi.fn().mockResolvedValue({ profiles: [{ name: 'secure-clients' }] }),
        createProfiles: vi.fn().mockResolvedValue(undefined),
        listPolicies: vi.fn().mockResolvedValue({ policies: [{ name: 'enforce-pkce' }] }),
        updatePolicy: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientPoliciesHandle = realmHandle.clientPolicies();

    await expect(clientPoliciesHandle.getProfiles(true)).resolves.toEqual({ profiles: [{ name: 'secure-clients' }] });
    await expect(clientPoliciesHandle.updateProfiles({ profiles: [{ name: 'secure-clients' }] })).resolves.toEqual({
      profiles: [{ name: 'secure-clients' }],
    });
    await expect(clientPoliciesHandle.getPolicies(true)).resolves.toEqual({ policies: [{ name: 'enforce-pkce' }] });
    await expect(clientPoliciesHandle.updatePolicies({ policies: [{ name: 'enforce-pkce' }] })).resolves.toEqual({
      policies: [{ name: 'enforce-pkce' }],
    });

    expect(core.clientPolicies.listProfiles).toHaveBeenCalledWith({
      realm: 'demo',
      includeGlobalProfiles: true,
    });
    expect(core.clientPolicies.createProfiles).toHaveBeenCalledWith({
      realm: 'demo',
      profiles: [{ name: 'secure-clients' }],
    });
    expect(core.clientPolicies.listPolicies).toHaveBeenCalledWith({
      realm: 'demo',
      includeGlobalPolicies: true,
    });
    expect(core.clientPolicies.updatePolicy).toHaveBeenCalledWith({
      realm: 'demo',
      policies: [{ name: 'enforce-pkce' }],
    });
  });

  test('workflow handle supports lookup, creation, pagination, and deletion', async () => {
    const core = {
      workflows: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }])
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }])
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }])
          .mockResolvedValueOnce([
            { id: 'wf-1', name: 'approval', enabled: true },
            { id: 'wf-2', name: 'auto-approval', enabled: false },
          ])
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }]),
        create: vi.fn().mockResolvedValue({ id: 'wf-1' }),
        update: vi.fn().mockResolvedValue(undefined),
        delById: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const workflowHandle = realmHandle.workflow('approval');

    await expect(workflowHandle.create({ enabled: true })).resolves.toEqual({
      id: 'wf-1',
      name: 'approval',
      enabled: true,
    });
    await expect(workflowHandle.ensure({ enabled: true })).resolves.toBe(workflowHandle);
    await expect(workflowHandle.list({ page: 2, pageSize: 1 })).resolves.toEqual([
      { id: 'wf-2', name: 'auto-approval', enabled: false },
    ]);
    await expect(workflowHandle.delete()).resolves.toBe('approval');

    expect(core.workflows.create).toHaveBeenCalledWith({
      realm: 'demo',
      name: 'approval',
      enabled: true,
    });
    expect(core.workflows.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'wf-1' },
      { id: 'wf-1', name: 'approval', enabled: true },
    );
    expect(core.workflows.delById).toHaveBeenCalledWith({ realm: 'demo', id: 'wf-1' });
  });

  test('workflow handle supports getById, ensure create path, and discard', async () => {
    const core = {
      workflows: {
        find: vi
          .fn()
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: 'wf-2', name: 'review', enabled: false }])
          .mockResolvedValueOnce([{ id: 'wf-2', name: 'review', enabled: false }])
          .mockResolvedValueOnce([{ id: 'wf-2', name: 'review', enabled: false }]),
        create: vi.fn().mockResolvedValue({ id: 'wf-2' }),
        update: vi.fn().mockResolvedValue(undefined),
        delById: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const workflowHandleById = realmHandle.workflow('review');
    const workflowHandle = realmHandle.workflow('review');

    await expect(workflowHandleById.getById('wf-1')).resolves.toEqual({ id: 'wf-1', name: 'approval', enabled: true });
    await expect(workflowHandle.ensure({ enabled: false })).resolves.toBe(workflowHandle);
    await expect(workflowHandle.discard()).resolves.toBe('review');

    expect(core.workflows.create).toHaveBeenCalledWith({ realm: 'demo', name: 'review', enabled: false });
    expect(core.workflows.delById).toHaveBeenCalledWith({ realm: 'demo', id: 'wf-2' });
  });

  test('workflow handle exposes update for existing workflows', async () => {
    const core = {
      workflows: {
        find: vi
          .fn()
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true, description: 'Existing' }])
          .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true, description: 'Existing' }]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const workflowHandle = new RealmHandle(core, 'demo').workflow('approval');

    await expect(workflowHandle.update({ enabled: false })).resolves.toEqual({
      id: 'wf-1',
      name: 'approval',
      enabled: true,
      description: 'Existing',
    });

    expect(core.workflows.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'wf-1' },
      expect.objectContaining({
        id: 'wf-1',
        name: 'approval',
        enabled: false,
        description: 'Existing',
      }),
    );
  });

  test('server info and who-am-i helpers forward root-scoped system operations', async () => {
    const fluent = new KeycloakAdminClientFluent() as any;
    fluent.core = {
      serverInfo: {
        find: vi.fn().mockResolvedValue({ systemInfo: { version: '26.0.0' } }),
        findEffectiveMessageBundles: vi
          .fn()
          .mockResolvedValue([{ key: 'loginTitle', value: 'Sign in', source: 'THEME' }]),
      },
      whoAmI: {
        find: vi.fn().mockResolvedValue({
          userId: 'user-1',
          realm: 'master',
          displayName: 'Admin',
          locale: 'en',
          createRealm: true,
          realm_access: {},
          temporary: false,
        }),
      },
    };

    await expect(fluent.serverInfo().get()).resolves.toEqual({ systemInfo: { version: '26.0.0' } });
    await expect(
      fluent.serverInfo().getEffectiveMessageBundles({ realm: 'master', themeType: 'login', locale: 'en' }),
    ).resolves.toEqual([{ key: 'loginTitle', value: 'Sign in', source: 'THEME' }]);
    await expect(fluent.whoAmI('master').get()).resolves.toEqual({
      userId: 'user-1',
      realm: 'master',
      displayName: 'Admin',
      locale: 'en',
      createRealm: true,
      realm_access: {},
      temporary: false,
    });

    expect(fluent.core.serverInfo.find).toHaveBeenCalledWith({});
    expect(fluent.core.serverInfo.findEffectiveMessageBundles).toHaveBeenCalledWith({
      realm: 'master',
      themeType: 'login',
      locale: 'en',
    });
    expect(fluent.core.whoAmI.find).toHaveBeenCalledWith({
      currentRealm: 'master',
      realm: undefined,
    });
  });

  test('who-am-i forwards an explicit target realm when provided', async () => {
    const fluent = new KeycloakAdminClientFluent() as any;
    fluent.core = {
      whoAmI: {
        find: vi.fn().mockResolvedValue({ userId: 'user-1', realm: 'demo' }),
      },
    };

    await expect(fluent.whoAmI('master', 'demo').get()).resolves.toEqual({ userId: 'user-1', realm: 'demo' });
    expect(fluent.core.whoAmI.find).toHaveBeenCalledWith({
      currentRealm: 'master',
      realm: 'demo',
    });
  });

  test('component handle supports CRUD by component lookup', async () => {
    const core = {
      components: {
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              id: 'component-1',
              name: 'ldap-users',
              parentId: 'demo',
              providerId: 'ldap',
              providerType: 'org.keycloak.storage.UserStorageProvider',
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'component-1',
              name: 'ldap-users',
              parentId: 'demo',
              providerId: 'ldap',
              providerType: 'org.keycloak.storage.UserStorageProvider',
            },
          ]),
        create: vi.fn().mockResolvedValue({ id: 'component-1' }),
        update: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const componentHandle = realmHandle.component('ldap-users', {
      parentId: 'demo',
      providerId: 'ldap',
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });

    await expect(
      componentHandle.create({
        parentId: 'demo',
        providerId: 'ldap',
        providerType: 'org.keycloak.storage.UserStorageProvider',
        config: { priority: ['0'] },
      }),
    ).resolves.toMatchObject({ id: 'component-1', name: 'ldap-users' });

    await expect(
      componentHandle.update({
        parentId: 'demo',
        providerId: 'ldap',
        providerType: 'org.keycloak.storage.UserStorageProvider',
        config: { priority: ['1'] },
      }),
    ).resolves.toMatchObject({ id: 'component-1', name: 'ldap-users' });

    await expect(componentHandle.delete()).resolves.toBe('ldap-users');

    expect(core.components.find).toHaveBeenNthCalledWith(1, {
      realm: 'demo',
      name: 'ldap-users',
      parent: 'demo',
      type: 'org.keycloak.storage.UserStorageProvider',
    });
    expect(core.components.create).toHaveBeenCalledWith({
      realm: 'demo',
      name: 'ldap-users',
      parentId: 'demo',
      providerId: 'ldap',
      providerType: 'org.keycloak.storage.UserStorageProvider',
      config: { priority: ['0'] },
    });
    expect(core.components.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'component-1' },
      {
        id: 'component-1',
        name: 'ldap-users',
        parentId: 'demo',
        providerId: 'ldap',
        providerType: 'org.keycloak.storage.UserStorageProvider',
        config: { priority: ['1'] },
      },
    );
    expect(core.components.del).toHaveBeenCalledWith({ realm: 'demo', id: 'component-1' });
  });

  test('component handle supports getById, ensure create path, and discard', async () => {
    const core = {
      components: {
        findOne: vi.fn().mockResolvedValue({
          id: 'component-1',
          name: 'ldap-users',
          providerType: 'org.keycloak.storage.UserStorageProvider',
        }),
        find: vi
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              id: 'component-2',
              name: 'ldap-review',
              providerType: 'org.keycloak.storage.UserStorageProvider',
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'component-2',
              name: 'ldap-review',
              providerType: 'org.keycloak.storage.UserStorageProvider',
            },
          ]),
        create: vi.fn().mockResolvedValue({ id: 'component-2' }),
        del: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const componentHandleById = realmHandle.component('ldap-review', {
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });
    const componentHandle = realmHandle.component('ldap-review', {
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });

    await expect(componentHandleById.getById('component-1')).resolves.toEqual({
      id: 'component-1',
      name: 'ldap-users',
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });
    await expect(
      componentHandle.ensure({
        providerType: 'org.keycloak.storage.UserStorageProvider',
      }),
    ).resolves.toBe(componentHandle);
    await expect(componentHandle.discard()).resolves.toBe('ldap-review');

    expect(core.components.create).toHaveBeenCalledWith({
      realm: 'demo',
      name: 'ldap-review',
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });
    expect(core.components.del).toHaveBeenCalledWith({ realm: 'demo', id: 'component-2' });
  });

  test('component lookup ambiguity is rejected', async () => {
    const core = {
      components: {
        find: vi.fn().mockResolvedValue([
          { id: 'component-1', name: 'ldap-users', providerType: 'org.keycloak.storage.UserStorageProvider' },
          { id: 'component-2', name: 'ldap-users', providerType: 'org.keycloak.storage.UserStorageProvider' },
        ]),
      },
    } as any;

    const componentHandle = new RealmHandle(core, 'demo').component('ldap-users', {
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });

    await expect(componentHandle.get()).rejects.toThrow(
      'Component "ldap-users" is ambiguous in realm "demo". Refine the lookup with parentId, providerId, providerType, or subType.',
    );
  });

  test('component subcomponent listing resolves the component lazily', async () => {
    const core = {
      components: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'component-1',
            name: 'ldap-users',
            parentId: 'demo',
            providerId: 'ldap',
            providerType: 'org.keycloak.storage.UserStorageProvider',
          },
        ]),
        listSubComponents: vi.fn().mockResolvedValue([{ id: 'mapper-1', helpText: 'LDAP mapper', properties: [] }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const componentHandle = realmHandle.component('ldap-users', {
      parentId: 'demo',
      providerType: 'org.keycloak.storage.UserStorageProvider',
    });

    await expect(
      componentHandle.listSubComponents('org.keycloak.storage.ldap.mappers.LDAPStorageMapper'),
    ).resolves.toEqual([{ id: 'mapper-1', helpText: 'LDAP mapper', properties: [] }]);
    expect(core.components.listSubComponents).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'component-1',
      type: 'org.keycloak.storage.ldap.mappers.LDAPStorageMapper',
    });
  });
});
