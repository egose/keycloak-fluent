import KeycloakAdminClientFluent from '../src/index';

test('Child Groups', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testchildgrouprealm';
  const groupName = 'testgroup';
  const childGroupName = 'testchildgroup';
  const nestedChildGroupName = 'testnestedchildgroup';
  const nested2ChildGroupName = 'testnested2childgroup';
  const nested3ChildGroupName = 'testnested3childgroup';

  const therealm = await kcMaster.realm(realm).ensure({});
  const thegroup = await therealm.group(groupName).ensure({});
  const thechildgroup = await thegroup.childGroup(childGroupName).ensure({});

  expect(thechildgroup).toBeTruthy();
  expect(thechildgroup?.realmName).toBe(realm);
  expect(thechildgroup?.parentGroupName).toBe(groupName);
  expect(thechildgroup?.group?.name).toBe(childGroupName);

  const thechildgroup2 = await kcMaster.realm(realm).group(groupName).childGroup(childGroupName).ensure({});

  expect(thechildgroup2).toBeTruthy();
  expect(thechildgroup2?.realmName).toBe(realm);
  expect(thechildgroup2?.parentGroupName).toBe(groupName);
  expect(thechildgroup2?.group?.name).toBe(childGroupName);

  const thechildgroup3 = await thechildgroup2.childGroup(nestedChildGroupName).ensure({});
  expect(thechildgroup3).toBeTruthy();
  expect(thechildgroup3?.realmName).toBe(realm);
  expect(thechildgroup3?.parentGroupPath).toBe(`/${groupName}/${childGroupName}`);
  expect(thechildgroup3?.group?.name).toBe(nestedChildGroupName);

  const thechildgroup4 = await thechildgroup3.childGroup(nested2ChildGroupName).ensure({});
  expect(thechildgroup4).toBeTruthy();
  expect(thechildgroup4?.realmName).toBe(realm);
  expect(thechildgroup4?.parentGroupPath).toBe(`/${groupName}/${childGroupName}/${nestedChildGroupName}`);
  expect(thechildgroup4?.group?.name).toBe(nested2ChildGroupName);

  const thechildgroup5 = await thechildgroup4.childGroup(nested3ChildGroupName).ensure({});
  expect(thechildgroup5).toBeTruthy();
  expect(thechildgroup5?.realmName).toBe(realm);
  expect(thechildgroup5?.parentGroupPath).toBe(
    `/${groupName}/${childGroupName}/${nestedChildGroupName}/${nested2ChildGroupName}`,
  );
  expect(thechildgroup5?.group?.name).toBe(nested3ChildGroupName);

  await thechildgroup.discard();
});
