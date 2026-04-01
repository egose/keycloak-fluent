import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Child Groups', async () => {
  await withEnsuredMasterRealm('testchildgrouprealm', async ({ kcMaster, realm, realmHandle }) => {
    const groupName = 'testgroup';
    const childGroupName = 'testchildgroup';
    const nestedChildGroupName = 'testnestedchildgroup';
    const nested2ChildGroupName = 'testnested2childgroup';
    const nested3ChildGroupName = 'testnested3childgroup';

    const parentGroupHandle = await realmHandle.group(groupName).ensure({});
    const childGroupHandle = await parentGroupHandle.childGroup(childGroupName).ensure({});

    expect(childGroupHandle).toBeTruthy();
    expect(childGroupHandle?.realmName).toBe(realm);
    expect(childGroupHandle?.parentGroupName).toBe(groupName);
    expect(childGroupHandle?.group?.name).toBe(childGroupName);

    const childGroupHandleFromPath = await kcMaster.realm(realm).group(groupName).childGroup(childGroupName).ensure({});

    expect(childGroupHandleFromPath).toBeTruthy();
    expect(childGroupHandleFromPath?.realmName).toBe(realm);
    expect(childGroupHandleFromPath?.parentGroupName).toBe(groupName);
    expect(childGroupHandleFromPath?.group?.name).toBe(childGroupName);

    const nestedChildGroupHandle = await childGroupHandleFromPath.childGroup(nestedChildGroupName).ensure({});
    expect(nestedChildGroupHandle).toBeTruthy();
    expect(nestedChildGroupHandle?.realmName).toBe(realm);
    expect(nestedChildGroupHandle?.parentGroupPath).toBe(`/${groupName}/${childGroupName}`);
    expect(nestedChildGroupHandle?.group?.name).toBe(nestedChildGroupName);

    const nestedChildGroupHandle2 = await nestedChildGroupHandle.childGroup(nested2ChildGroupName).ensure({});
    expect(nestedChildGroupHandle2).toBeTruthy();
    expect(nestedChildGroupHandle2?.realmName).toBe(realm);
    expect(nestedChildGroupHandle2?.parentGroupPath).toBe(`/${groupName}/${childGroupName}/${nestedChildGroupName}`);
    expect(nestedChildGroupHandle2?.group?.name).toBe(nested2ChildGroupName);

    const nestedChildGroupHandle3 = await nestedChildGroupHandle2.childGroup(nested3ChildGroupName).ensure({});
    expect(nestedChildGroupHandle3).toBeTruthy();
    expect(nestedChildGroupHandle3?.realmName).toBe(realm);
    expect(nestedChildGroupHandle3?.parentGroupPath).toBe(
      `/${groupName}/${childGroupName}/${nestedChildGroupName}/${nested2ChildGroupName}`,
    );
    expect(nestedChildGroupHandle3?.group?.name).toBe(nested3ChildGroupName);
  });
});
