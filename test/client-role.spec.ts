import KeycloakAdminClientFluent from '../src/index';

test('Clients', async () => {
  const kcClient = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcClient.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testclientrolerealm';
  const clientId = 'testclient';
  const roleName = 'testrole';
  const roleDescription = 'A role for testing purposes';

  const therealm = await kcClient.realm(realm).ensure({});
  const theclient = await therealm.client(clientId).ensure({});
  const therole = await theclient.role(roleName).ensure({ description: roleDescription });

  expect(therole).toBeTruthy();
  expect(therole?.realm.realm).toBe(realm);
  expect(therole?.client.clientId).toBe(clientId);
  expect(therole?.role?.name).toBe(roleName);
  expect(therole?.role?.description).toBe(roleDescription);
});
