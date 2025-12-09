import KeycloakAdminClientFluent from '../src/index';

test('Users', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testuserrealm';
  const username = 'testuser';
  const userFirstname = 'Test';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theuser = await therealm.user(username).ensure({ firstName: userFirstname });

  expect(theuser).toBeTruthy();
  expect(theuser?.realmName).toBe(realm);
  expect(theuser?.user?.username).toBe(username);
  expect(theuser?.user?.firstName).toBe(userFirstname);

  const theuser2 = await kcMaster
    .realm(realm)
    .user(username)
    .ensure({ firstName: userFirstname + ' v2' });

  const realmadminrole = therealm.client('realm-management').role('realm-admin');
  await theuser2.assignClientRole(realmadminrole);
  await theuser2.unassignClientRole(realmadminrole);

  const testgroup = await therealm.group('testgroupforuser').ensure({});
  const testchildgroup = await testgroup.childGroup('testchildgroup').ensure({});
  const testchildgroup2 = await testchildgroup.childGroup('testchildgroup2').ensure({});
  const testchildgroup3 = await testchildgroup2.childGroup('testchildgroup3').ensure({});
  const testchildgroup4 = await testchildgroup3.childGroup('testchildgroup4').ensure({});
  const testchildgroup5 = await testchildgroup4.childGroup('testchildgroup5').ensure({});
  const testchildgroup6 = await testchildgroup5.childGroup('testchildgroup6').ensure({});
  const testchildgroup7 = await testchildgroup6.childGroup('testchildgroup7').ensure({});

  await theuser2.assignGroup(testgroup);
  await theuser2.assignGroup(testchildgroup7);
  await theuser2.unassignGroup(testgroup);
  await theuser2.unassignGroup(testchildgroup7);

  expect(theuser2).toBeTruthy();
  expect(theuser2?.realmName).toBe(realm);
  expect(theuser2?.user?.username).toBe(username);
  expect(theuser2?.user?.firstName).toBe(userFirstname + ' v2');
});
