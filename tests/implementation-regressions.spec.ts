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

  test('identity provider update preserves existing config while normalizing jwks usage', async () => {
    const core = {
      identityProviders: {
        findOne: vi.fn().mockResolvedValue({
          alias: 'demo-idp',
          providerId: 'oidc',
          config: {
            clientId: 'existing-client',
            clientSecret: 'existing-secret', // pragma: allowlist secret
            jwksUrl: '',
            useJwksUrl: 'false',
          },
        }),
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
          clientId: 'existing-client',
          clientSecret: 'existing-secret', // pragma: allowlist secret
          jwksUrl: 'https://issuer.example/jwks',
          useJwksUrl: 'true',
        }),
      }),
    );
  });

  test('client scope update preserves existing nested attributes', async () => {
    const core = {
      clientScopes: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'scope-1',
            name: 'profile',
            protocol: 'openid-connect',
            attributes: { custom: 'keep-me' },
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const scopeHandle = new RealmHandle(core, 'demo').clientScope('profile');

    await scopeHandle.update({ description: 'Updated scope' });

    expect(core.clientScopes.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'scope-1' },
      expect.objectContaining({
        id: 'scope-1',
        name: 'profile',
        description: 'Updated scope',
        protocol: 'openid-connect',
        attributes: { custom: 'keep-me' },
      }),
    );
  });

  test('realm ensure preserves existing nested settings on update', async () => {
    const core = {
      realms: {
        findOne: vi.fn().mockResolvedValue({
          realm: 'demo',
          enabled: true,
          displayName: 'Existing realm',
          smtpServer: {
            host: 'smtp.example.test',
            port: '587',
          },
        }),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');

    await realmHandle.ensure({ displayNameHtml: '<b>Updated realm</b>' });

    expect(core.realms.update).toHaveBeenCalledWith(
      { realm: 'demo' },
      expect.objectContaining({
        realm: 'demo',
        enabled: true,
        displayName: 'Existing realm',
        displayNameHtml: '<b>Updated realm</b>',
        smtpServer: {
          host: 'smtp.example.test',
          port: '587',
        },
      }),
    );
  });

  test('organization ensure preserves existing settings on update', async () => {
    const core = {
      organizations: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'org-1',
            alias: 'engineering',
            enabled: true,
            domains: [{ name: 'example.com', verified: true }],
          },
        ]),
        updateById: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const organizationHandle = new RealmHandle(core, 'demo').organization('engineering');

    await organizationHandle.ensure({ description: 'Updated engineering org' });

    expect(core.organizations.updateById).toHaveBeenCalledWith(
      { realm: 'demo', id: 'org-1' },
      expect.objectContaining({
        id: 'org-1',
        alias: 'engineering',
        enabled: true,
        description: 'Updated engineering org',
        domains: [{ name: 'example.com', verified: true }],
      }),
    );
  });

  test('component update preserves existing config fields', async () => {
    const core = {
      components: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'component-1',
            name: 'ldap',
            providerType: 'org.keycloak.storage.UserStorageProvider',
            config: {
              priority: ['0'],
              cachePolicy: ['DEFAULT'],
            },
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const componentHandle = new RealmHandle(core, 'demo').component('ldap');

    await componentHandle.update({ parentId: 'realm-1' });

    expect(core.components.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'component-1' },
      expect.objectContaining({
        id: 'component-1',
        name: 'ldap',
        parentId: 'realm-1',
        providerType: 'org.keycloak.storage.UserStorageProvider',
        config: {
          priority: ['0'],
          cachePolicy: ['DEFAULT'],
        },
      }),
    );
  });

  test('role update preserves existing attributes', async () => {
    const core = {
      roles: {
        findOneByName: vi.fn().mockResolvedValue({
          id: 'role-1',
          name: 'admin',
          attributes: { source: ['seeded'] },
          composite: true,
        }),
        updateById: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const roleHandle = new RealmHandle(core, 'demo').role('admin');

    await roleHandle.update({ description: 'Updated role' });

    expect(core.roles.updateById).toHaveBeenCalledWith(
      { realm: 'demo', id: 'role-1' },
      expect.objectContaining({
        id: 'role-1',
        name: 'admin',
        description: 'Updated role',
        composite: true,
        attributes: { source: ['seeded'] },
      }),
    );
  });

  test('user update preserves existing attributes and access while handling password separately', async () => {
    const core = {
      users: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'user-1',
            username: 'alice',
            emailVerified: true,
            attributes: { team: ['platform'] },
            access: { manage: true, view: true },
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
        resetPassword: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const userHandle = new RealmHandle(core, 'demo').user('alice');

    await userHandle.update({ firstName: 'Alice', password: 'new-secret' }); // pragma: allowlist secret

    expect(core.users.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'user-1' },
      expect.objectContaining({
        id: 'user-1',
        username: 'alice',
        firstName: 'Alice',
        emailVerified: true,
        attributes: { team: ['platform'] },
        access: { manage: true, view: true },
      }),
    );
    expect(core.users.resetPassword).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'user-1',
      credential: {
        temporary: false,
        type: 'password',
        value: 'new-secret',
      },
    });
  });

  test('authentication flow ensure preserves existing flags on update', async () => {
    const core = {
      authenticationManagement: {
        getFlows: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 'flow-1', alias: 'browser-copy', providerId: 'custom-flow', topLevel: false, builtIn: true },
          ])
          .mockResolvedValueOnce([
            { id: 'flow-1', alias: 'browser-copy', providerId: 'custom-flow', topLevel: false, builtIn: true },
          ]),
        updateFlow: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const flowHandle = new RealmHandle(core, 'demo').authenticationFlow('browser-copy');

    await flowHandle.ensure({ description: 'Updated flow description' });

    expect(core.authenticationManagement.updateFlow).toHaveBeenCalledWith(
      { realm: 'demo', flowId: 'flow-1' },
      expect.objectContaining({
        id: 'flow-1',
        alias: 'browser-copy',
        description: 'Updated flow description',
        providerId: 'custom-flow',
        topLevel: false,
        builtIn: true,
      }),
    );
  });

  test('confidential browser login client ensure preserves existing redirect uris on update', async () => {
    const core = {
      clients: {
        find: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'client-1',
              clientId: 'browser-client',
              redirectUris: ['https://existing.example/callback'],
              standardFlowEnabled: true,
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'client-1',
              clientId: 'browser-client',
              redirectUris: ['https://existing.example/callback'],
              standardFlowEnabled: true,
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'client-1',
              clientId: 'browser-client',
              redirectUris: ['https://existing.example/callback'],
              standardFlowEnabled: true,
            },
          ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const clientHandle = new RealmHandle(core, 'demo').confidentialBrowserLoginClient('browser-client');

    await clientHandle.ensure({ description: 'Updated browser client' });

    expect(core.clients.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1' },
      expect.objectContaining({
        clientId: 'browser-client',
        description: 'Updated browser client',
        publicClient: false,
        standardFlowEnabled: true,
        redirectUris: ['https://existing.example/callback'],
      }),
    );
  });

  test('public browser login client update preserves existing redirect uris', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'client-1',
            clientId: 'public-browser-client',
            redirectUris: ['https://existing.example/callback'],
            publicClient: true,
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const clientHandle = new RealmHandle(core, 'demo').publicBrowserLoginClient('public-browser-client');

    await clientHandle.update({ description: 'Updated public browser client' });

    expect(core.clients.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1' },
      expect.objectContaining({
        clientId: 'public-browser-client',
        description: 'Updated public browser client',
        publicClient: true,
        redirectUris: ['https://existing.example/callback'],
      }),
    );
  });

  test('workflow update preserves existing fields while applying partial changes', async () => {
    const core = {
      workflows: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'wf-1',
            name: 'approval',
            enabled: true,
            description: 'Existing workflow',
            config: { reviewers: ['ops'] },
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const workflowHandle = new RealmHandle(core, 'demo').workflow('approval');

    await workflowHandle.update({ enabled: false });

    expect(core.workflows.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'wf-1' },
      expect.objectContaining({
        id: 'wf-1',
        name: 'approval',
        enabled: false,
        description: 'Existing workflow',
        config: { reviewers: ['ops'] },
      }),
    );
  });

  test('group update preserves existing attributes', async () => {
    const core = {
      groups: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'group-1',
            name: 'staff',
            path: '/staff',
            attributes: { team: ['platform'] },
          },
        ]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const groupHandle = new RealmHandle(core, 'demo').group('staff');

    await groupHandle.update({ realmRoles: ['staff-role'] });

    expect(core.groups.update).toHaveBeenCalledWith(
      { realm: 'demo', id: 'group-1' },
      expect.objectContaining({
        id: 'group-1',
        name: 'staff',
        path: '/staff',
        realmRoles: ['staff-role'],
        attributes: { team: ['platform'] },
      }),
    );
  });

  test('child group ensure preserves existing attributes on update', async () => {
    const core = {
      groups: {
        find: vi.fn().mockResolvedValue([{ id: 'group-1', name: 'parent' }]),
        listSubGroups: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'child-1',
              name: 'team-a',
              path: '/parent/team-a',
              attributes: { owner: ['alice'] },
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'child-1',
              name: 'team-a',
              path: '/parent/team-a',
              attributes: { owner: ['alice'] },
            },
          ]),
        updateChildGroup: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const childGroupHandle = new RealmHandle(core, 'demo').group('parent').childGroup('team-a');

    await childGroupHandle.ensure({ realmRoles: ['team-role'] });

    expect(core.groups.updateChildGroup).toHaveBeenCalledWith(
      { realm: 'demo', id: 'group-1' },
      expect.objectContaining({
        id: 'child-1',
        name: 'team-a',
        path: '/parent/team-a',
        realmRoles: ['team-role'],
        attributes: { owner: ['alice'] },
      }),
    );
  });

  test('nested child group update preserves existing attributes', async () => {
    const core = {
      groups: {
        find: vi.fn().mockResolvedValue([{ id: 'group-1', name: 'parent' }]),
        listSubGroups: vi.fn().mockImplementation(({ parentId }: { parentId: string }) => {
          if (parentId === 'group-1') {
            return Promise.resolve([{ id: 'child-1', name: 'child', path: '/parent/child' }]);
          }

          if (parentId === 'child-1') {
            return Promise.resolve([
              {
                id: 'nested-1',
                name: 'nested',
                path: '/parent/child/nested',
                attributes: { owner: ['bob'] },
              },
            ]);
          }

          return Promise.resolve([]);
        }),
        updateChildGroup: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const nestedChildHandle = new RealmHandle(core, 'demo').group('parent').childGroup('child').childGroup('nested');

    await nestedChildHandle.update({ realmRoles: ['nested-role'] });

    expect(core.groups.updateChildGroup).toHaveBeenCalledWith(
      { realm: 'demo', id: 'child-1' },
      expect.objectContaining({
        id: 'nested-1',
        name: 'nested',
        path: '/parent/child/nested',
        realmRoles: ['nested-role'],
        attributes: { owner: ['bob'] },
      }),
    );
  });

  test('client role update preserves existing attributes', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        findRole: vi.fn().mockResolvedValue({
          id: 'role-1',
          name: 'reader',
          attributes: { source: ['seeded'] },
          composite: true,
        }),
        updateRole: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const roleHandle = new RealmHandle(core, 'demo').client('app-client').role('reader');

    await roleHandle.update({ description: 'Updated client role' });

    expect(core.clients.updateRole).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1', roleName: 'reader' },
      expect.objectContaining({
        id: 'role-1',
        name: 'reader',
        description: 'Updated client role',
        composite: true,
        attributes: { source: ['seeded'] },
      }),
    );
  });

  test('protocol mapper update preserves existing config', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        findProtocolMapperByName: vi.fn().mockResolvedValue({
          id: 'mapper-1',
          name: 'email-mapper',
          protocol: 'openid-connect',
          config: { 'claim.name': 'email' },
        }),
        updateProtocolMapper: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const mapperHandle = new RealmHandle(core, 'demo').client('app-client').protocolMapper('email-mapper');

    await mapperHandle.update({ protocolMapper: 'oidc-usermodel-property-mapper' });

    expect(core.clients.updateProtocolMapper).toHaveBeenCalledWith(
      { realm: 'demo', id: 'client-1', mapperId: 'mapper-1' },
      expect.objectContaining({
        id: 'mapper-1',
        name: 'email-mapper',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-property-mapper',
        config: { 'claim.name': 'email' },
      }),
    );
  });

  test('client scope protocol mapper update preserves existing config', async () => {
    const core = {
      clientScopes: {
        find: vi.fn().mockResolvedValue([{ id: 'scope-1', name: 'profile' }]),
        findProtocolMapperByName: vi.fn().mockResolvedValue({
          id: 'mapper-1',
          name: 'profile-mapper',
          protocol: 'openid-connect',
          config: { 'claim.name': 'profile' },
        }),
        updateProtocolMapper: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const mapperHandle = new RealmHandle(core, 'demo').clientScope('profile').protocolMapper('profile-mapper');

    await mapperHandle.update({ protocolMapper: 'oidc-usermodel-attribute-mapper' });

    expect(core.clientScopes.updateProtocolMapper).toHaveBeenCalledWith(
      { realm: 'demo', id: 'scope-1', mapperId: 'mapper-1' },
      expect.objectContaining({
        id: 'mapper-1',
        name: 'profile-mapper',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        config: { 'claim.name': 'profile' },
      }),
    );
  });

  test('identity provider mapper update preserves existing config', async () => {
    const core = {
      identityProviders: {
        findOne: vi.fn().mockResolvedValue({ alias: 'demo-idp' }),
        findMappers: vi.fn().mockResolvedValue([
          {
            id: 'mapper-1',
            name: 'email-mapper',
            identityProviderAlias: 'demo-idp',
            config: { syncMode: 'INHERIT' },
          },
        ]),
        updateMapper: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const mapperHandle = new RealmHandle(core, 'demo').identityProvider('demo-idp').mapper('email-mapper');

    await mapperHandle.update({ identityProviderMapper: 'oidc-user-attribute-idp-mapper' });

    expect(core.identityProviders.updateMapper).toHaveBeenCalledWith(
      { realm: 'demo', alias: 'demo-idp', id: 'mapper-1' },
      expect.objectContaining({
        id: 'mapper-1',
        name: 'email-mapper',
        identityProviderAlias: 'demo-idp',
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        config: { syncMode: 'INHERIT' },
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

  test('child group lookup follows parent group rebinding after getById', async () => {
    const core = {
      groups: {
        findOne: vi.fn().mockResolvedValue({ id: 'group-1', name: 'resolved-parent' }),
        find: vi.fn().mockImplementation(({ search }: { search: string }) => {
          if (search === 'resolved-parent') {
            return Promise.resolve([{ id: 'group-1', name: 'resolved-parent' }]);
          }

          return Promise.resolve([]);
        }),
        listSubGroups: vi.fn().mockResolvedValue([{ id: 'child-1', name: 'team-a' }]),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const parentGroupHandle = realmHandle.group('placeholder-parent');
    const childGroupHandle = parentGroupHandle.childGroup('team-a');

    await parentGroupHandle.getById('group-1');
    await expect(childGroupHandle.get()).resolves.toEqual({ id: 'child-1', name: 'team-a' });

    expect(core.groups.find).toHaveBeenCalledWith({ realm: 'demo', search: 'resolved-parent', exact: true });
    expect(core.groups.listSubGroups).toHaveBeenCalledWith({
      realm: 'demo',
      parentId: 'group-1',
      briefRepresentation: false,
      first: 0,
      max: 1000,
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

  test('group sub-group lookup paginates beyond the first 1000 results', async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => ({ id: `group-${index}`, name: `group-${index}` }));
    const core = {
      groups: {
        listSubGroups: vi
          .fn()
          .mockResolvedValueOnce(firstPage)
          .mockResolvedValueOnce([{ id: 'group-1000', name: 'group-1000' }]),
      },
    } as any;

    await expect(GroupHandle.listSubGroups(core, 'demo', 'parent-1')).resolves.toHaveLength(1001);
    expect(core.groups.listSubGroups).toHaveBeenNthCalledWith(1, {
      realm: 'demo',
      parentId: 'parent-1',
      briefRepresentation: false,
      first: 0,
      max: 1000,
    });
    expect(core.groups.listSubGroups).toHaveBeenNthCalledWith(2, {
      realm: 'demo',
      parentId: 'parent-1',
      briefRepresentation: false,
      first: 1000,
      max: 1000,
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
