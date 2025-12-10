import KeycloakAdminClientFluent from '../src/index';

test('Client Scopes', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testclientscoperealm';
  const scopeName = 'testscope';
  const scopeDescription = 'A client scope for testing purposes';
  const scopeProtocolSaml = 'saml';
  const scopeProtocolOpenid = 'openid-connect';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theclientscope = await therealm
    .clientScope(scopeName)
    .ensure({ description: scopeDescription, protocol: scopeProtocolSaml });

  expect(theclientscope).toBeTruthy();
  expect(theclientscope?.realmName).toBe(realm);
  expect(theclientscope?.clientScope?.name).toBe(scopeName);
  expect(theclientscope?.clientScope?.description).toBe(scopeDescription);
  expect(theclientscope?.clientScope?.protocol).toBe(scopeProtocolSaml);

  const theclientscope2 = await kcMaster
    .realm(realm)
    .clientScope(scopeName)
    .ensure({ description: scopeDescription + ' v2', protocol: scopeProtocolOpenid });
  expect(theclientscope2).toBeTruthy();
  expect(theclientscope2?.realmName).toBe(realm);
  expect(theclientscope2?.clientScope?.name).toBe(scopeName);
  expect(theclientscope2?.clientScope?.description).toBe(scopeDescription + ' v2');
  expect(theclientscope?.clientScope?.protocol).toBe(scopeProtocolSaml);

  const searchedClientScopes = await therealm.searchClientScopes(scopeName.slice(1, -1));
  expect(Array.isArray(searchedClientScopes)).toBe(true);
  expect(searchedClientScopes.length).toBeGreaterThan(0);
});
