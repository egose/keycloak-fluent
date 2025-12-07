import KeycloakAdminClientFluent from '../src/index';

test('Public Browser Login Clients', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testpublicloginclientrealm';
  const clientId = 'testpublicloginclient';
  const clientDisplayName = 'A public browser login client for testing purposes';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theclient = await therealm.publicBrowserLoginClient(clientId).ensure({ description: clientDisplayName });

  expect(theclient).toBeTruthy();
  expect(theclient?.realmName).toBe(realm);
  expect(theclient?.client?.clientId).toBe(clientId);
  expect(theclient?.client?.description).toBe(clientDisplayName);
  expect(theclient?.client?.publicClient).toBe(true);
  expect(theclient?.client?.standardFlowEnabled).toBe(true);
  expect(theclient?.client?.directAccessGrantsEnabled).toBe(false);
  expect(theclient?.client?.implicitFlowEnabled).toBe(false);
  expect(theclient?.client?.serviceAccountsEnabled).toBe(false);
  expect(theclient?.client?.redirectUris).toStrictEqual(['*']);
});
