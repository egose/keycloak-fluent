import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Groups', async () => {
  await withEnsuredMasterRealm('testgrouprealm', async ({ kcMaster, realm, realmHandle }) => {
    const groupName = 'testgroup';
    const groupDisplayName = 'A group for testing purposes';

    const groupHandle = await realmHandle.group(groupName).ensure({ description: groupDisplayName });

    expect(groupHandle).toBeTruthy();
    expect(groupHandle?.realmName).toBe(realm);
    expect(groupHandle?.group?.name).toBe(groupName);
    expect(groupHandle?.group?.description).toBe(groupDisplayName);

    const updatedGroupHandle = await kcMaster
      .realm(realm)
      .group(groupName)
      .ensure({ description: groupDisplayName + ' v2' });

    expect(updatedGroupHandle).toBeTruthy();
    expect(updatedGroupHandle?.realmName).toBe(realm);
    expect(updatedGroupHandle?.group?.name).toBe(groupName);
    expect(updatedGroupHandle?.group?.description).toBe(groupDisplayName + ' v2');

    const searchedGroups = await realmHandle.searchGroups(groupName.slice(1, -1));
    expect(Array.isArray(searchedGroups)).toBe(true);
    expect(searchedGroups.length).toBeGreaterThan(0);
  });
});
