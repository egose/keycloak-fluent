import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';

describe('Implementation Consistency: Clients', () => {
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

  test('child handles follow parent client rebinding after getById', async () => {
    const core = {
      clients: {
        findOne: vi.fn().mockResolvedValue({ id: 'client-1', clientId: 'resolved-client' }),
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'resolved-client' }]),
        findRole: vi.fn().mockResolvedValue({ id: 'role-1', name: 'reader' }),
        findProtocolMapperByName: vi.fn().mockResolvedValue({ id: 'mapper-1', name: 'email-mapper' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('placeholder-client-id');
    const roleHandle = clientHandle.role('reader');
    const mapperHandle = clientHandle.protocolMapper('email-mapper');

    await clientHandle.getById('client-1');
    await roleHandle.get();
    await mapperHandle.get();

    expect(core.clients.find).toHaveBeenCalledWith({ realm: 'demo', clientId: 'resolved-client' });
    expect(core.clients.findRole).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      roleName: 'reader',
    });
    expect(core.clients.findProtocolMapperByName).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      name: 'email-mapper',
    });
  });

  test('client default scope assignment resolves client and scope lazily', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        addDefaultClientScope: vi.fn().mockResolvedValue(undefined),
      },
      clientScopes: {
        find: vi.fn().mockResolvedValue([{ id: 'scope-1', name: 'profile' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const clientScopeHandle = realmHandle.clientScope('profile');

    await clientHandle.addDefaultClientScope(clientScopeHandle);

    expect(core.clients.addDefaultClientScope).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      clientScopeId: 'scope-1',
    });
  });

  test('client secret retrieval resolves the client lazily', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        getClientSecret: vi.fn().mockResolvedValue({ value: 'secret-1' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');

    await expect(clientHandle.getSecret()).resolves.toMatchObject({ value: 'secret-1' });
    expect(core.clients.getClientSecret).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
    });
  });

  test('client update preserves existing fields while applying partial changes', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'client-1',
            clientId: 'app-client',
            protocol: 'openid-connect',
            redirectUris: ['https://existing.example/callback'],
            attributes: {
              'post.logout.redirect.uris': 'https://existing.example/logout',
            },
            standardFlowEnabled: true,
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');

    await clientHandle.update({ description: 'Updated description' });

    expect(core.clients.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1' },
      expect.objectContaining({
        id: 'client-1',
        clientId: 'app-client',
        description: 'Updated description',
        protocol: 'openid-connect',
        redirectUris: ['https://existing.example/callback'],
        attributes: {
          'post.logout.redirect.uris': 'https://existing.example/logout',
        },
        standardFlowEnabled: true,
      }),
    );
  });

  test('client scope mapping helpers resolve clients and roles lazily', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([
          { id: 'client-1', clientId: 'app-client' },
          { id: 'client-2', clientId: 'account' },
        ]),
        addRealmScopeMappings: vi.fn().mockResolvedValue(undefined),
        delRealmScopeMappings: vi.fn().mockResolvedValue(undefined),
        listRealmScopeMappings: vi.fn().mockResolvedValue([{ id: 'role-1', name: 'manage-users' }]),
        listAvailableRealmScopeMappings: vi.fn().mockResolvedValue([{ id: 'role-2', name: 'view-users' }]),
        listCompositeRealmScopeMappings: vi.fn().mockResolvedValue([{ id: 'role-3', name: 'realm-admin' }]),
        addClientScopeMappings: vi.fn().mockResolvedValue(undefined),
        delClientScopeMappings: vi.fn().mockResolvedValue(undefined),
        listClientScopeMappings: vi.fn().mockResolvedValue([{ id: 'role-4', name: 'manage-account' }]),
        listAvailableClientScopeMappings: vi.fn().mockResolvedValue([{ id: 'role-5', name: 'view-profile' }]),
        listCompositeClientScopeMappings: vi.fn().mockResolvedValue([{ id: 'role-6', name: 'account-admin' }]),
        listScopeMappings: vi.fn().mockResolvedValue({ realmMappings: [{ id: 'role-1', name: 'manage-users' }] }),
      },
      roles: {
        findOneByName: vi.fn().mockResolvedValue({ id: 'role-1', name: 'manage-users' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');
    const targetClientHandle = realmHandle.client('account');
    const roleHandle = realmHandle.role('manage-users');

    await clientHandle.addRealmScopeMappings([roleHandle]);
    await clientHandle.removeRealmScopeMappings([roleHandle]);
    await expect(clientHandle.listScopeMappings()).resolves.toEqual({
      realmMappings: [{ id: 'role-1', name: 'manage-users' }],
    });
    await expect(clientHandle.listRealmScopeMappings()).resolves.toEqual([{ id: 'role-1', name: 'manage-users' }]);
    await expect(clientHandle.listAvailableRealmScopeMappings()).resolves.toEqual([
      { id: 'role-2', name: 'view-users' },
    ]);
    await expect(clientHandle.listCompositeRealmScopeMappings()).resolves.toEqual([
      { id: 'role-3', name: 'realm-admin' },
    ]);
    await clientHandle.addClientScopeMappings(targetClientHandle, [roleHandle]);
    await clientHandle.removeClientScopeMappings(targetClientHandle, [roleHandle]);
    await expect(clientHandle.listClientScopeMappings(targetClientHandle)).resolves.toEqual([
      { id: 'role-4', name: 'manage-account' },
    ]);
    await expect(clientHandle.listAvailableClientScopeMappings(targetClientHandle)).resolves.toEqual([
      { id: 'role-5', name: 'view-profile' },
    ]);
    await expect(clientHandle.listCompositeClientScopeMappings(targetClientHandle)).resolves.toEqual([
      { id: 'role-6', name: 'account-admin' },
    ]);

    expect(core.clients.addRealmScopeMappings).toHaveBeenCalledWith({ realm: 'demo', id: 'client-1' }, [
      { id: 'role-1', name: 'manage-users' },
    ]);
    expect(core.clients.addClientScopeMappings).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1', client: 'client-2' },
      [{ id: 'role-1', name: 'manage-users' }],
    );
    expect(core.clients.listClientScopeMappings).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      client: 'client-2',
    });
  });

  test('client protocol mapper and session helpers use lazy resolution and pagination', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        listProtocolMappers: vi.fn().mockResolvedValue([{ id: 'mapper-1', name: 'email' }]),
        findProtocolMappersByProtocol: vi
          .fn()
          .mockResolvedValue([{ id: 'mapper-2', name: 'aud', protocol: 'openid-connect' }]),
        addMultipleProtocolMappers: vi.fn().mockResolvedValue(undefined),
        listSessions: vi.fn().mockResolvedValue([{ id: 'session-1', username: 'alice' }]),
        listOfflineSessions: vi.fn().mockResolvedValue([{ id: 'offline-1', username: 'alice' }]),
        getSessionCount: vi.fn().mockResolvedValue({ count: 2 }),
        getOfflineSessionCount: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');

    await expect(clientHandle.listProtocolMappers()).resolves.toEqual([{ id: 'mapper-1', name: 'email' }]);
    await expect(clientHandle.listProtocolMappersByProtocol('openid-connect')).resolves.toEqual([
      { id: 'mapper-2', name: 'aud', protocol: 'openid-connect' },
    ]);
    await clientHandle.addProtocolMappers([
      { name: 'email', protocol: 'openid-connect', protocolMapper: 'oidc-usermodel-property-mapper' },
    ]);
    await expect(clientHandle.listSessions({ page: 3, pageSize: 25 })).resolves.toEqual([
      { id: 'session-1', username: 'alice' },
    ]);
    await expect(clientHandle.listOfflineSessions({ page: 2, pageSize: 50 })).resolves.toEqual([
      { id: 'offline-1', username: 'alice' },
    ]);
    await expect(clientHandle.getSessionCount()).resolves.toEqual({ count: 2 });
    await expect(clientHandle.getOfflineSessionCount()).resolves.toEqual({ count: 1 });

    expect(core.clients.addMultipleProtocolMappers).toHaveBeenCalledWith({ realm: 'demo', id: 'client-1' }, [
      { name: 'email', protocol: 'openid-connect', protocolMapper: 'oidc-usermodel-property-mapper' },
    ]);
    expect(core.clients.listSessions).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      first: 50,
      max: 25,
    });
    expect(core.clients.listOfflineSessions).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      first: 50,
      max: 50,
    });
  });

  test('client admin helpers forward revocation, installation, cluster, key, and permission operations', async () => {
    const buffer = new ArrayBuffer(8);
    const formData = new FormData();
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        generateRegistrationAccessToken: vi.fn().mockResolvedValue({ registrationAccessToken: 'rat-1' }),
        getInstallationProviders: vi.fn().mockResolvedValue('{"realm":"demo"}'),
        pushRevocation: vi.fn().mockResolvedValue({ successRequests: ['node-1'] }),
        addClusterNode: vi.fn().mockResolvedValue(undefined),
        deleteClusterNode: vi.fn().mockResolvedValue(undefined),
        testNodesAvailable: vi.fn().mockResolvedValue({ successRequests: ['node-1'] }),
        getKeyInfo: vi.fn().mockResolvedValue({ kid: 'kid-1' }),
        generateKey: vi.fn().mockResolvedValue({ kid: 'kid-2' }),
        downloadKey: vi.fn().mockResolvedValue(buffer),
        generateAndDownloadKey: vi.fn().mockResolvedValue(buffer),
        uploadKey: vi.fn().mockResolvedValue({ uploaded: true }),
        uploadCertificate: vi.fn().mockResolvedValue({ uploaded: true }),
        listFineGrainPermissions: vi.fn().mockResolvedValue({ enabled: true, resource: 'client-1' }),
        updateFineGrainPermission: vi.fn().mockResolvedValue({ enabled: false, resource: 'client-1' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');

    await expect(clientHandle.generateRegistrationAccessToken()).resolves.toEqual({ registrationAccessToken: 'rat-1' });
    await expect(clientHandle.getInstallationProvider('keycloak-oidc-keycloak-json')).resolves.toBe('{"realm":"demo"}');
    await expect(clientHandle.pushRevocation()).resolves.toEqual({ successRequests: ['node-1'] });
    await clientHandle.addClusterNode('node-a');
    await clientHandle.removeClusterNode('node-a');
    await expect(clientHandle.testNodesAvailable()).resolves.toEqual({ successRequests: ['node-1'] });
    await expect(clientHandle.getKeyInfo('jwt.credential')).resolves.toEqual({ kid: 'kid-1' });
    await expect(clientHandle.generateKey('jwt.credential')).resolves.toEqual({ kid: 'kid-2' });
    await expect(
      clientHandle.downloadKey('jwt.credential', { keyAlias: 'demo', storePassword: 'secret' }), // pragma: allowlist secret
    ).resolves.toBe(buffer);
    await expect(
      clientHandle.generateAndDownloadKey('jwt.credential', { keyAlias: 'demo', storePassword: 'secret' }), // pragma: allowlist secret
    ).resolves.toBe(buffer);
    await expect(clientHandle.uploadKey('jwt.credential', formData)).resolves.toEqual({ uploaded: true });
    await expect(clientHandle.uploadCertificate('jwt.credential', formData)).resolves.toEqual({ uploaded: true });
    await expect(clientHandle.listPermissions()).resolves.toEqual({ enabled: true, resource: 'client-1' });
    await expect(clientHandle.updatePermissions({ enabled: false })).resolves.toEqual({
      enabled: false,
      resource: 'client-1',
    });

    expect(core.clients.getInstallationProviders).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      providerId: 'keycloak-oidc-keycloak-json',
    });
    expect(core.clients.addClusterNode).toHaveBeenCalledWith({ realm: 'demo', id: 'client-1', node: 'node-a' });
    expect(core.clients.deleteClusterNode).toHaveBeenCalledWith({ realm: 'demo', id: 'client-1', node: 'node-a' });
    expect(core.clients.downloadKey).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1', attr: 'jwt.credential' },
      { keyAlias: 'demo', storePassword: 'secret' }, // pragma: allowlist secret
    );
    expect(core.clients.updateFineGrainPermission).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1' },
      { enabled: false },
    );
  });

  test('client authorization resource server and resource helpers forward correctly', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        getResourceServer: vi.fn().mockResolvedValue({ id: 'rs-1', policyEnforcementMode: 'ENFORCING' }),
        updateResourceServer: vi.fn().mockResolvedValue(undefined),
        importResource: vi.fn().mockResolvedValue({ imported: true }),
        exportResource: vi.fn().mockResolvedValue({ id: 'rs-1', resources: [] }),
        evaluateResource: vi.fn().mockResolvedValue({ status: 'PERMIT', results: [] }),
        listResources: vi.fn().mockResolvedValue([{ _id: 'resource-1', name: 'invoice' }]),
        getResource: vi.fn().mockResolvedValue({ _id: 'resource-1', name: 'invoice' }),
        createResource: vi.fn().mockResolvedValue({ _id: 'resource-2', name: 'report' }),
        updateResource: vi.fn().mockResolvedValue(undefined),
        delResource: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');

    await expect(clientHandle.getResourceServer()).resolves.toEqual({ id: 'rs-1', policyEnforcementMode: 'ENFORCING' });
    await expect(clientHandle.updateResourceServer({ policyEnforcementMode: 'PERMISSIVE' } as any)).resolves.toEqual({
      id: 'rs-1',
      policyEnforcementMode: 'ENFORCING',
    });
    await expect(clientHandle.importResourceServer({ resources: [] } as any)).resolves.toEqual({ imported: true });
    await expect(clientHandle.exportResourceServer()).resolves.toEqual({ id: 'rs-1', resources: [] });
    await expect(
      clientHandle.evaluateAuthorization({ userId: 'user-1', entitlements: false, context: { attributes: {} } } as any),
    ).resolves.toEqual({ status: 'PERMIT', results: [] });
    await expect(clientHandle.listResources({ name: 'invoice', page: 2, pageSize: 25 })).resolves.toEqual([
      { _id: 'resource-1', name: 'invoice' },
    ]);
    await expect(clientHandle.getResource('resource-1')).resolves.toEqual({ _id: 'resource-1', name: 'invoice' });
    await expect(clientHandle.createResource({ name: 'report' })).resolves.toEqual({
      _id: 'resource-2',
      name: 'report',
    });
    await expect(clientHandle.updateResource('resource-1', { name: 'invoice' })).resolves.toEqual({
      _id: 'resource-1',
      name: 'invoice',
    });
    await clientHandle.deleteResource('resource-1');

    expect(core.clients.updateResourceServer).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1' },
      { policyEnforcementMode: 'PERMISSIVE' },
    );
    expect(core.clients.evaluateResource).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1' },
      { userId: 'user-1', entitlements: false, context: { attributes: {} } },
    );
    expect(core.clients.listResources).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      first: 25,
      max: 25,
      name: 'invoice',
      type: undefined,
      owner: undefined,
      uri: undefined,
      deep: undefined,
    });
    expect(core.clients.delResource).toHaveBeenCalledWith({ realm: 'demo', id: 'client-1', resourceId: 'resource-1' });
  });

  test('client authorization policy, scope, and permission helpers forward correctly', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        listPolicies: vi.fn().mockResolvedValue([{ id: 'policy-1', name: 'allow-admins' }]),
        findPolicyByName: vi.fn().mockResolvedValue({ id: 'policy-1', name: 'allow-admins' }),
        createPolicy: vi.fn().mockResolvedValue({ id: 'policy-2', name: 'deny-guests' }),
        updatePolicy: vi.fn().mockResolvedValue(undefined),
        findOnePolicyWithType: vi.fn().mockResolvedValue({ id: 'policy-1', name: 'allow-admins' }),
        delPolicy: vi.fn().mockResolvedValue(undefined),
        listDependentPolicies: vi.fn().mockResolvedValue([{ id: 'policy-3', name: 'aggregate' }]),
        listPolicyProviders: vi.fn().mockResolvedValue([{ type: 'role', name: 'Role Policy' }]),
        listAllScopes: vi.fn().mockResolvedValue([{ id: 'scope-1', name: 'view' }]),
        listAllPermissionsByScope: vi.fn().mockResolvedValue([{ id: 'perm-1', name: 'view-permission' }]),
        listAllResourcesByScope: vi.fn().mockResolvedValue([{ _id: 'resource-1', name: 'invoice' }]),
        getAuthorizationScope: vi.fn().mockResolvedValue({ id: 'scope-1', name: 'view' }),
        createAuthorizationScope: vi.fn().mockResolvedValue({ created: true }),
        updateAuthorizationScope: vi.fn().mockResolvedValue(undefined),
        delAuthorizationScope: vi.fn().mockResolvedValue(undefined),
        findPermissions: vi.fn().mockResolvedValue([{ id: 'perm-1', name: 'view-permission' }]),
        findOnePermission: vi.fn().mockResolvedValue({ id: 'perm-1', name: 'view-permission' }),
        createPermission: vi.fn().mockResolvedValue({ id: 'perm-2', name: 'edit-permission' }),
        updatePermission: vi.fn().mockResolvedValue(undefined),
        delPermission: vi.fn().mockResolvedValue(undefined),
        getAssociatedScopes: vi.fn().mockResolvedValue([{ id: 'scope-1', name: 'view' }]),
        getAssociatedResources: vi.fn().mockResolvedValue([{ _id: 'resource-1', name: 'invoice' }]),
        getAssociatedPolicies: vi.fn().mockResolvedValue([{ id: 'policy-1', name: 'allow-admins' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const clientHandle = realmHandle.client('app-client');

    await expect(clientHandle.listAuthorizationPolicies({ name: 'allow', page: 2, pageSize: 10 })).resolves.toEqual([
      { id: 'policy-1', name: 'allow-admins' },
    ]);
    await expect(clientHandle.findAuthorizationPolicyByName('allow-admins')).resolves.toEqual({
      id: 'policy-1',
      name: 'allow-admins',
    });
    await expect(clientHandle.createAuthorizationPolicy('role', { name: 'deny-guests' })).resolves.toEqual({
      id: 'policy-2',
      name: 'deny-guests',
    });
    await expect(clientHandle.updateAuthorizationPolicy('role', 'policy-1', { name: 'allow-admins' })).resolves.toEqual(
      { id: 'policy-1', name: 'allow-admins' },
    );
    await clientHandle.deleteAuthorizationPolicy('policy-1');
    await expect(clientHandle.listDependentAuthorizationPolicies('policy-1')).resolves.toEqual([
      { id: 'policy-3', name: 'aggregate' },
    ]);
    await expect(clientHandle.listAuthorizationPolicyProviders()).resolves.toEqual([
      { type: 'role', name: 'Role Policy' },
    ]);
    await expect(clientHandle.listAuthorizationScopes({ name: 'view', page: 3, pageSize: 20 })).resolves.toEqual([
      { id: 'scope-1', name: 'view' },
    ]);
    await expect(clientHandle.listAuthorizationPermissionsByScope('scope-1')).resolves.toEqual([
      { id: 'perm-1', name: 'view-permission' },
    ]);
    await expect(clientHandle.listAuthorizationResourcesByScope('scope-1')).resolves.toEqual([
      { _id: 'resource-1', name: 'invoice' },
    ]);
    await expect(clientHandle.getAuthorizationScope('scope-1')).resolves.toEqual({ id: 'scope-1', name: 'view' });
    await expect(clientHandle.createAuthorizationScope({ name: 'edit' })).resolves.toEqual({ created: true });
    await expect(clientHandle.updateAuthorizationScope('scope-1', { name: 'view' })).resolves.toEqual({
      id: 'scope-1',
      name: 'view',
    });
    await clientHandle.deleteAuthorizationScope('scope-1');
    await expect(clientHandle.findAuthorizationPermissions({ name: 'view', page: 2, pageSize: 25 })).resolves.toEqual([
      { id: 'perm-1', name: 'view-permission' },
    ]);
    await expect(clientHandle.getAuthorizationPermission('scope', 'perm-1')).resolves.toEqual({
      id: 'perm-1',
      name: 'view-permission',
    });
    await expect(clientHandle.createAuthorizationPermission('scope', { name: 'edit-permission' })).resolves.toEqual({
      id: 'perm-2',
      name: 'edit-permission',
    });
    await expect(
      clientHandle.updateAuthorizationPermission('scope', 'perm-1', { name: 'view-permission' }),
    ).resolves.toEqual({
      id: 'perm-1',
      name: 'view-permission',
    });
    await clientHandle.deleteAuthorizationPermission('scope', 'perm-1');
    await expect(clientHandle.getAssociatedAuthorizationScopes('perm-1')).resolves.toEqual([
      { id: 'scope-1', name: 'view' },
    ]);
    await expect(clientHandle.getAssociatedAuthorizationResources('perm-1')).resolves.toEqual([
      { _id: 'resource-1', name: 'invoice' },
    ]);
    await expect(clientHandle.getAssociatedAuthorizationPolicies('perm-1')).resolves.toEqual([
      { id: 'policy-1', name: 'allow-admins' },
    ]);

    expect(core.clients.listPolicies).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      first: 10,
      max: 10,
      name: 'allow',
      type: undefined,
      resource: undefined,
      scope: undefined,
      permission: undefined,
      owner: undefined,
      fields: undefined,
    });
    expect(core.clients.listAllScopes).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      name: 'view',
      deep: undefined,
      first: 40,
      max: 20,
    });
    expect(core.clients.findPermissions).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      name: 'view',
      resource: undefined,
      scope: undefined,
      first: 25,
      max: 25,
    });
    expect(core.clients.delPermission).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'client-1',
      type: 'scope',
      permissionId: 'perm-1',
    });
  });
});
