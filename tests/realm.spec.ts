import { expect, test } from 'vitest';
import { withMasterRealm } from './test-utils';

test('Realms', async () => {
  await withMasterRealm('testrealm', async ({ kcMaster, realm }) => {
    const realmDisplayName = 'A realm for testing purposes';

    const one = await kcMaster.realm(realm).ensure({ displayName: realmDisplayName });
    expect(one).toBeTruthy();
    expect(one?.realmName).toBe(realm);
    expect(one?.realm?.displayName).toBe(realmDisplayName);

    const searchedRealms = await kcMaster.searchRealms(realm.slice(1, -1));
    expect(Array.isArray(searchedRealms)).toBe(true);
    expect(searchedRealms.length).toBeGreaterThan(0);
  });
});
