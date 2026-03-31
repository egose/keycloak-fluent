import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Client Scope Assignments', async () => {
  await withEnsuredMasterRealm('testclientscopeassignmentrealm', async ({ realm, realmHandle }) => {
    const clientHandle = await realmHandle.client('web-app').ensure({});
    const defaultScopeHandle = await realmHandle
      .clientScope('profile-default')
      .ensure({ description: 'Default scope for web-app' });
    const optionalScopeHandle = await realmHandle
      .clientScope('profile-optional')
      .ensure({ description: 'Optional scope for web-app' });

    await clientHandle.addDefaultClientScope(defaultScopeHandle);
    await clientHandle.addOptionalClientScope(optionalScopeHandle);

    const defaultScopes = await clientHandle.listDefaultClientScopes();
    expect(Array.isArray(defaultScopes)).toBe(true);
    expect(defaultScopes.some((scope) => scope.name === 'profile-default')).toBe(true);

    const optionalScopes = await clientHandle.listOptionalClientScopes();
    expect(Array.isArray(optionalScopes)).toBe(true);
    expect(optionalScopes.some((scope) => scope.name === 'profile-optional')).toBe(true);

    await clientHandle.removeDefaultClientScope(defaultScopeHandle);
    await clientHandle.removeOptionalClientScope(optionalScopeHandle);

    const defaultScopesAfterRemove = await clientHandle.listDefaultClientScopes();
    expect(defaultScopesAfterRemove.some((scope) => scope.name === 'profile-default')).toBe(false);

    const optionalScopesAfterRemove = await clientHandle.listOptionalClientScopes();
    expect(optionalScopesAfterRemove.some((scope) => scope.name === 'profile-optional')).toBe(false);

    expect(clientHandle.realmName).toBe(realm);
  });
});
