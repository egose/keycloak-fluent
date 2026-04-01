import NestedChildGroupHandle from '../src/groups/nested-child-group';
import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Users', async () => {
  await withEnsuredMasterRealm('testuserrealm', async ({ kcMaster, realm, realmHandle }) => {
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
    const userHandle = await realmHandle.user(username).ensure({ firstName: userFirstname, password: username });

    expect(userHandle).toBeTruthy();
    expect(userHandle?.realmName).toBe(realm);
    expect(userHandle?.user?.username).toBe(username);
    expect(userHandle?.user?.firstName).toBe(userFirstname);

    // Update user details
    const updatedUserHandle = await kcMaster
      .realm(realm)
      .user(username)
      .ensure({ firstName: `${userFirstname} v2`, password: `${username}v2` });

    // Assign and verify client role
    const realmAdminRoleHandle = realmHandle.client(managementClient).role(adminRole);
    await updatedUserHandle.assignClientRole(realmAdminRoleHandle);

    const roleAssignedUsers = await realmAdminRoleHandle.listAssignedUsers();
    expect(Array.isArray(roleAssignedUsers)).toBe(true);
    expect(roleAssignedUsers.length).toBeGreaterThan(0);

    const userAssignedRoles = await updatedUserHandle.listAssignedClientRoles(realmHandle.client(managementClient));
    expect(Array.isArray(userAssignedRoles)).toBe(true);
    expect(userAssignedRoles.length).toBeGreaterThan(0);

    await updatedUserHandle.unassignClientRole(realmAdminRoleHandle);

    const userAssignedRolesEmpty = await updatedUserHandle.listAssignedClientRoles(
      realmHandle.client(managementClient),
    );
    expect(Array.isArray(userAssignedRolesEmpty)).toBe(true);
    expect(userAssignedRolesEmpty.length).toBe(0);

    // Create and assign nested groups
    const userGroupHandle = await realmHandle.group('testgroupforuser').ensure({});
    const deepestGroupHandle = await createNestedGroups(userGroupHandle, 7);

    await updatedUserHandle.assignGroup(userGroupHandle);
    await updatedUserHandle.assignGroup(deepestGroupHandle);

    const groupAssignedUsers = await userGroupHandle.listAssignedUsers();
    expect(Array.isArray(groupAssignedUsers)).toBe(true);
    expect(groupAssignedUsers.length).toBeGreaterThan(0);

    const groupAssignedUsersNested = await deepestGroupHandle.listAssignedUsers();
    expect(Array.isArray(groupAssignedUsersNested)).toBe(true);
    expect(groupAssignedUsersNested.length).toBeGreaterThan(0);

    const userAssignedGroups = await updatedUserHandle.listAssignedGroups();
    expect(Array.isArray(userAssignedGroups)).toBe(true);
    expect(userAssignedGroups.length).toBeGreaterThan(0);

    await updatedUserHandle.unassignGroup(userGroupHandle);
    await updatedUserHandle.unassignGroup(deepestGroupHandle);

    const userAssignedGroupsEmpty = await updatedUserHandle.listAssignedGroups();
    expect(Array.isArray(userAssignedGroupsEmpty)).toBe(true);
    expect(userAssignedGroupsEmpty.length).toBe(0);

    // Final assertions
    expect(updatedUserHandle).toBeTruthy();
    expect(updatedUserHandle?.realmName).toBe(realm);
    expect(updatedUserHandle?.user?.username).toBe(username);
    expect(updatedUserHandle?.user?.firstName).toBe(`${userFirstname} v2`);

    // Search for users
    const searchedUsers = await realmHandle.searchUsers(username.slice(1, -1));
    expect(Array.isArray(searchedUsers)).toBe(true);
    expect(searchedUsers.length).toBeGreaterThan(0);
  });
});
