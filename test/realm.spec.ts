import KeycloakAdminClientFluent from '../src/index';

test('Realms', async () => {
  const kcClient = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcClient.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testrealm';
  const realmDisplayName = 'A realm for testing purposes';

  const one = await kcClient.realm(realm).ensure({ displayName: realmDisplayName });
  expect(one).toBeTruthy();
  expect(one?.realmName).toBe(realm);
  expect(one?.realm?.displayName).toBe(realmDisplayName);
});
