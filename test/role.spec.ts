import KeycloakAdminClientFluent from '../src/index';

test('Roles', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testrolerealm';
  const roleName = 'testrole';
  const roleDisplayName = 'A role for testing purposes';

  const therealm = await kcMaster.realm(realm).ensure({});
  const therole = await therealm.role(roleName).ensure({ description: roleDisplayName });

  expect(therole).toBeTruthy();
  expect(therole?.realmName).toBe(realm);
  expect(therole?.role?.name).toBe(roleName);
  expect(therole?.role?.description).toBe(roleDisplayName);

  const therole2 = await kcMaster
    .realm(realm)
    .role(roleName)
    .ensure({ description: roleDisplayName + ' v2' });

  expect(therole2).toBeTruthy();
  expect(therole2?.realmName).toBe(realm);
  expect(therole2?.role?.name).toBe(roleName);
  expect(therole2?.role?.description).toBe(roleDisplayName + ' v2');
});
