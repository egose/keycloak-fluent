import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Client Roles', async () => {
  await withEnsuredMasterRealm('testclientrolerealm', async ({ realm, realmHandle }) => {
    const clientId = 'testclient';
    const roleName = 'testrole';
    const roleDescription = 'A role for testing purposes';

    const clientHandle = await realmHandle.client(clientId).ensure({});
    const roleHandle = await clientHandle.role(roleName).ensure({ description: roleDescription });

    expect(roleHandle).toBeTruthy();
    expect(roleHandle?.realmName).toBe(realm);
    expect(roleHandle?.client.clientId).toBe(clientId);
    expect(roleHandle?.role?.name).toBe(roleName);
    expect(roleHandle?.role?.description).toBe(roleDescription);

    const searchedRoles = await clientHandle.searchRoles(roleName.slice(1, -1));
    expect(Array.isArray(searchedRoles)).toBe(true);
    expect(searchedRoles.length).toBeGreaterThan(0);
  });
});
