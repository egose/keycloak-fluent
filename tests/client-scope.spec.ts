import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Client Scopes', async () => {
  await withEnsuredMasterRealm('testclientscoperealm', async ({ kcMaster, realm, realmHandle }) => {
    const scopeName = 'testscope';
    const scopeDescription = 'A client scope for testing purposes';
    const scopeProtocolSaml = 'saml';
    const scopeProtocolOpenid = 'openid-connect';

    const clientScopeHandle = await realmHandle
      .clientScope(scopeName)
      .ensure({ description: scopeDescription, protocol: scopeProtocolSaml });

    expect(clientScopeHandle).toBeTruthy();
    expect(clientScopeHandle?.realmName).toBe(realm);
    expect(clientScopeHandle?.clientScope?.name).toBe(scopeName);
    expect(clientScopeHandle?.clientScope?.description).toBe(scopeDescription);
    expect(clientScopeHandle?.clientScope?.protocol).toBe(scopeProtocolSaml);

    const updatedClientScopeHandle = await kcMaster
      .realm(realm)
      .clientScope(scopeName)
      .ensure({ description: scopeDescription + ' v2', protocol: scopeProtocolOpenid });
    expect(updatedClientScopeHandle).toBeTruthy();
    expect(updatedClientScopeHandle?.realmName).toBe(realm);
    expect(updatedClientScopeHandle?.clientScope?.name).toBe(scopeName);
    expect(updatedClientScopeHandle?.clientScope?.description).toBe(scopeDescription + ' v2');
    expect(updatedClientScopeHandle?.clientScope?.protocol).toBe(scopeProtocolOpenid);

    const searchedClientScopes = await realmHandle.searchClientScopes(scopeName.slice(1, -1));
    expect(Array.isArray(searchedClientScopes)).toBe(true);
    expect(searchedClientScopes.length).toBeGreaterThan(0);
  });
});
