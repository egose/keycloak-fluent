import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Public Browser Login Clients', async () => {
  await withEnsuredMasterRealm('testpublicloginclientrealm', async ({ realm, realmHandle }) => {
    const clientId = 'testpublicloginclient';
    const clientDisplayName = 'A public browser login client for testing purposes';

    const clientHandle = await realmHandle
      .publicBrowserLoginClient(clientId)
      .ensure({ description: clientDisplayName });

    expect(clientHandle).toBeTruthy();
    expect(clientHandle?.realmName).toBe(realm);
    expect(clientHandle?.client?.clientId).toBe(clientId);
    expect(clientHandle?.client?.description).toBe(clientDisplayName);
    expect(clientHandle?.client?.publicClient).toBe(true);
    expect(clientHandle?.client?.standardFlowEnabled).toBe(true);
    expect(clientHandle?.client?.directAccessGrantsEnabled).toBe(false);
    expect(clientHandle?.client?.implicitFlowEnabled).toBe(false);
    expect(clientHandle?.client?.serviceAccountsEnabled).toBe(false);
    expect(clientHandle?.client?.redirectUris).toStrictEqual(['*']);
  });
});
