import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Roles', async () => {
  await withEnsuredMasterRealm('testrolerealm', async ({ kcMaster, realm, realmHandle }) => {
    const roleName = 'testrole';
    const roleDisplayName = 'A role for testing purposes';

    const roleHandle = await realmHandle.role(roleName).ensure({ description: roleDisplayName });

    expect(roleHandle).toBeTruthy();
    expect(roleHandle?.realmName).toBe(realm);
    expect(roleHandle?.role?.name).toBe(roleName);
    expect(roleHandle?.role?.description).toBe(roleDisplayName);

    const updatedRoleHandle = await kcMaster
      .realm(realm)
      .role(roleName)
      .ensure({ description: roleDisplayName + ' v2' });

    expect(updatedRoleHandle).toBeTruthy();
    expect(updatedRoleHandle?.realmName).toBe(realm);
    expect(updatedRoleHandle?.role?.name).toBe(roleName);
    expect(updatedRoleHandle?.role?.description).toBe(roleDisplayName + ' v2');

    const searchedRoles = await realmHandle.searchRoles(roleName.slice(1, -1));
    expect(Array.isArray(searchedRoles)).toBe(true);
    expect(searchedRoles.length).toBeGreaterThan(0);
  });
});
