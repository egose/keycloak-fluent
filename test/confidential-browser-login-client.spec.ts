import KeycloakAdminClientFluent from '../src/index';

test('Confidential Browser Login Clients', async () => {
  const kcClient = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcClient.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testconfidentialloginclientrealm';
  const clientId = 'testconfidentialloginclient';
  const clientDisplayName = 'A confidential browser login client for testing purposes';

  const therealm = await kcClient.realm(realm).ensure({});
  const theclient = await therealm.confidentialBrowserLoginClient(clientId).ensure({ description: clientDisplayName });

  expect(theclient).toBeTruthy();
  expect(theclient?.realmName).toBe(realm);
  expect(theclient?.client?.clientId).toBe(clientId);
  expect(theclient?.client?.description).toBe(clientDisplayName);
  expect(theclient?.client?.publicClient).toBe(false);
  expect(theclient?.client?.standardFlowEnabled).toBe(true);
  expect(theclient?.client?.directAccessGrantsEnabled).toBe(false);
  expect(theclient?.client?.implicitFlowEnabled).toBe(false);
  expect(theclient?.client?.serviceAccountsEnabled).toBe(false);
  expect(theclient?.client?.redirectUris).toStrictEqual(['*']);
});
