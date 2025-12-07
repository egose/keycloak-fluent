import KeycloakAdminClientFluent from '../src/index';

test('Groups', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testgrouprealm';
  const groupName = 'testgroup';
  const groupDisplayName = 'A group for testing purposes';

  const therealm = await kcMaster.realm(realm).ensure({});
  const thegroup = await therealm.group(groupName).ensure({ description: groupDisplayName });

  expect(thegroup).toBeTruthy();
  expect(thegroup?.realmName).toBe(realm);
  expect(thegroup?.group?.name).toBe(groupName);
  expect(thegroup?.group?.description).toBe(groupDisplayName);

  const thegroup2 = await kcMaster
    .realm(realm)
    .group(groupName)
    .ensure({ description: groupDisplayName + ' v2' });

  expect(thegroup2).toBeTruthy();
  expect(thegroup2?.realmName).toBe(realm);
  expect(thegroup2?.group?.name).toBe(groupName);
  expect(thegroup2?.group?.description).toBe(groupDisplayName + ' v2');
});
