import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Group Role Mappings', async () => {
  await withEnsuredMasterRealm('testgrouprolemappingrealm', async ({ realm, realmHandle }) => {
    const groupHandle = await realmHandle.group('staff').ensure({});
    const realmRoleHandle = await realmHandle.role('staff-role').ensure({ description: 'Realm role for staff' });
    const clientHandle = await realmHandle.client('staff-client').ensure({});
    const clientRoleHandle = await clientHandle
      .role('staff-client-role')
      .ensure({ description: 'Client role for staff' });

    await groupHandle.assignRole(realmRoleHandle);
    await groupHandle.assignClientRole(clientRoleHandle);

    const assignedRealmRoles = await groupHandle.listAssignedRoles();
    expect(Array.isArray(assignedRealmRoles)).toBe(true);
    expect(assignedRealmRoles.some((role) => role.name === 'staff-role')).toBe(true);

    const assignedClientRoles = await groupHandle.listAssignedClientRoles(clientHandle);
    expect(Array.isArray(assignedClientRoles)).toBe(true);
    expect(assignedClientRoles.some((role) => role.name === 'staff-client-role')).toBe(true);

    await groupHandle.unassignRole(realmRoleHandle);
    await groupHandle.unassignClientRole(clientRoleHandle);

    const assignedRealmRolesAfterUnassign = await groupHandle.listAssignedRoles();
    expect(assignedRealmRolesAfterUnassign.some((role) => role.name === 'staff-role')).toBe(false);

    const assignedClientRolesAfterUnassign = await groupHandle.listAssignedClientRoles(clientHandle);
    expect(assignedClientRolesAfterUnassign.some((role) => role.name === 'staff-client-role')).toBe(false);

    expect(groupHandle.realmName).toBe(realm);
  });
});
