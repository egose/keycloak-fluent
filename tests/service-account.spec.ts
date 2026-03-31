import { expect, test } from 'vitest';
import { createAuthenticatedRealmClient, withEnsuredMasterRealm } from './test-utils';

test('Service Accounts', async () => {
  await withEnsuredMasterRealm('testserviceaccountrealm', async ({ realm, realmHandle }) => {
    const clientId = 'testserviceaccount';
    const clientDisplayName = 'A service account for testing purposes';

    const clientHandle = await realmHandle
      .serviceAccount(clientId)
      .ensure({ description: clientDisplayName, secret: 'testsecret' }); // pragma: allowlist secret

    expect(clientHandle).toBeTruthy();
    expect(clientHandle?.realmName).toBe(realm);
    expect(clientHandle?.client?.clientId).toBe(clientId);
    expect(clientHandle?.client?.description).toBe(clientDisplayName);
    expect(clientHandle?.client?.publicClient).toBe(false);
    expect(clientHandle?.client?.standardFlowEnabled).toBe(false);
    expect(clientHandle?.client?.directAccessGrantsEnabled).toBe(false);
    expect(clientHandle?.client?.implicitFlowEnabled).toBe(false);
    expect(clientHandle?.client?.serviceAccountsEnabled).toBe(true);

    const kcCustom = await createAuthenticatedRealmClient(realm, clientId, 'testsecret'); // pragma: allowlist secret

    await expect(
      kcCustom
        .realm(realm)
        .client(clientId + 'bysvc')
        .ensure({}),
    ).rejects.toThrow(/HTTP 403 Forbidden/);
  });
});
