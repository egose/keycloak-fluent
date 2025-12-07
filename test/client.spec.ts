import KeycloakAdminClientFluent from '../src/index';

test('Clients', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testclientrealm';
  const clientId = 'testclient';
  const clientDisplayName = 'A client for testing purposes';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theclient = await therealm.client(clientId).ensure({ description: clientDisplayName });

  expect(theclient).toBeTruthy();
  expect(theclient?.realmName).toBe(realm);
  expect(theclient?.client?.clientId).toBe(clientId);
  expect(theclient?.client?.description).toBe(clientDisplayName);

  const theclient2 = await kcMaster
    .realm(realm)
    .client(clientId)
    .ensure({ description: clientDisplayName + ' v2' });
  expect(theclient2).toBeTruthy();
  expect(theclient2?.realmName).toBe(realm);
  expect(theclient2?.client?.clientId).toBe(clientId);
  expect(theclient2?.client?.description).toBe(clientDisplayName + ' v2');
});
