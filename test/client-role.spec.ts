import KeycloakAdminClientFluent from '../src/index';

test('Client Roles', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testclientrolerealm';
  const clientId = 'testclient';
  const roleName = 'testrole';
  const roleDescription = 'A role for testing purposes';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theclient = await therealm.client(clientId).ensure({});
  const therole = await theclient.role(roleName).ensure({ description: roleDescription });

  expect(therole).toBeTruthy();
  expect(therole?.realmName).toBe(realm);
  expect(therole?.client.clientId).toBe(clientId);
  expect(therole?.role?.name).toBe(roleName);
  expect(therole?.role?.description).toBe(roleDescription);

  const searchedRoles = await theclient.searchRoles(roleName.slice(1, -1));
  expect(Array.isArray(searchedRoles)).toBe(true);
  expect(searchedRoles.length).toBeGreaterThan(0);
});
