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

  expect(theuser2).toBeTruthy();
  expect(theuser2?.realmName).toBe(realm);
  expect(theuser2?.user?.username).toBe(username);
  expect(theuser2?.user?.firstName).toBe(userFirstname + ' v2');
});
