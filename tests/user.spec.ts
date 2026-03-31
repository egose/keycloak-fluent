import NestedChildGroupHandle from '../src/groups/nested-child-group';
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
  const managementClient = 'realm-management';
  const adminRole = 'realm-admin';

  // Helper function to create nested groups
  const createNestedGroups = async (parentGroup: any, depth: number): Promise<NestedChildGroupHandle> => {
    let currentGroup = parentGroup;
    for (let i = 1; i <= depth; i++) {
      currentGroup = await currentGroup.childGroup(`testchildgroup${i}`).ensure({});
    }
    return currentGroup;
  };

  // Ensure realm and user
  const therealm = await kcMaster.realm(realm).ensure({});
  const theuser = await therealm.user(username).ensure({ firstName: userFirstname, password: username });

  expect(theuser).toBeTruthy();
  expect(theuser?.realmName).toBe(realm);
  expect(theuser?.user?.username).toBe(username);
  expect(theuser?.user?.firstName).toBe(userFirstname);

  // Update user details
  const theuser2 = await kcMaster
    .realm(realm)
    .user(username)
    .ensure({ firstName: `${userFirstname} v2`, password: `${username}v2` });

  // Assign and verify client role
  const realmadminrole = therealm.client(managementClient).role(adminRole);
  await theuser2.assignClientRole(realmadminrole);

  const roleAssignedUsers = await realmadminrole.listAssignedUsers();
  expect(Array.isArray(roleAssignedUsers)).toBe(true);
  expect(roleAssignedUsers.length).toBeGreaterThan(0);

  const userAssignedRoles = await theuser2.listAssignedClientRoles(therealm.client(managementClient));
  expect(Array.isArray(userAssignedRoles)).toBe(true);
  expect(userAssignedRoles.length).toBeGreaterThan(0);

  await theuser2.unassignClientRole(realmadminrole);

  const userAssignedRolesEmpty = await theuser2.listAssignedClientRoles(therealm.client(managementClient));
  expect(Array.isArray(userAssignedRolesEmpty)).toBe(true);
  expect(userAssignedRolesEmpty.length).toBe(0);

  // Create and assign nested groups
  const testgroup = await therealm.group('testgroupforuser').ensure({});
  const deepestGroup = await createNestedGroups(testgroup, 7);

  await theuser2.assignGroup(testgroup);
  await theuser2.assignGroup(deepestGroup);

  const groupAssignedUsers = await testgroup.listAssignedUsers();
  expect(Array.isArray(groupAssignedUsers)).toBe(true);
  expect(groupAssignedUsers.length).toBeGreaterThan(0);

  const groupAssignedUsersNested = await deepestGroup.listAssignedUsers();
  expect(Array.isArray(groupAssignedUsersNested)).toBe(true);
  expect(groupAssignedUsersNested.length).toBeGreaterThan(0);

  const userAssignedGroups = await theuser2.listAssignedGroups();
  expect(Array.isArray(userAssignedGroups)).toBe(true);
  expect(userAssignedGroups.length).toBeGreaterThan(0);

  await theuser2.unassignGroup(testgroup);
  await theuser2.unassignGroup(deepestGroup);

  const userAssignedGroupsEmpty = await theuser2.listAssignedGroups();
  expect(Array.isArray(userAssignedGroupsEmpty)).toBe(true);
  expect(userAssignedGroupsEmpty.length).toBe(0);

  // Final assertions
  expect(theuser2).toBeTruthy();
  expect(theuser2?.realmName).toBe(realm);
  expect(theuser2?.user?.username).toBe(username);
  expect(theuser2?.user?.firstName).toBe(`${userFirstname} v2`);

  // Search for users
  const searchedUsers = await therealm.searchUsers(username.slice(1, -1));
  expect(Array.isArray(searchedUsers)).toBe(true);
  expect(searchedUsers.length).toBeGreaterThan(0);
});
