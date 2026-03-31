import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Confidential Browser Login Clients', async () => {
  await withEnsuredMasterRealm('testconfidentialloginclientrealm', async ({ realm, realmHandle }) => {
    const clientId = 'testconfidentialloginclient';
    const clientDisplayName = 'A confidential browser login client for testing purposes';

    const clientHandle = await realmHandle
      .confidentialBrowserLoginClient(clientId)
      .ensure({ description: clientDisplayName });

    expect(clientHandle).toBeTruthy();
    expect(clientHandle?.realmName).toBe(realm);
    expect(clientHandle?.client?.clientId).toBe(clientId);
    expect(clientHandle?.client?.description).toBe(clientDisplayName);
    expect(clientHandle?.client?.publicClient).toBe(false);
    expect(clientHandle?.client?.standardFlowEnabled).toBe(true);
    expect(clientHandle?.client?.directAccessGrantsEnabled).toBe(false);
    expect(clientHandle?.client?.implicitFlowEnabled).toBe(false);
    expect(clientHandle?.client?.serviceAccountsEnabled).toBe(false);
    expect(clientHandle?.client?.redirectUris).toStrictEqual(['*']);
  });
});
