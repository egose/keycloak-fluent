import KeycloakAdminClientFluent from '../src/index';

test('Realms', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testrealm';
  const realmDisplayName = 'A realm for testing purposes';

  const one = await kcMaster.realm(realm).ensure({ displayName: realmDisplayName });
  expect(one).toBeTruthy();
  expect(one?.realmName).toBe(realm);
  expect(one?.realm?.displayName).toBe(realmDisplayName);

  const searchedRealms = await kcMaster.searchRealms(realm.slice(1, -1));
  expect(Array.isArray(searchedRealms)).toBe(true);
  expect(searchedRealms.length).toBeGreaterThan(0);
});
