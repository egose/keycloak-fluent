import { expect, test } from 'vitest';
import { createAuthenticatedRealmClient, withEnsuredMasterRealm } from './test-utils';

test('Realm Admin Service Accounts', async () => {
  await withEnsuredMasterRealm('testrealmadminserviceaccountrealm', async ({ realm, realmHandle }) => {
    const clientId = 'testrealmadminserviceaccount';
    const clientDisplayName = 'A realm admin service account for testing purposes';

    const clientHandle = await realmHandle
      .realmAdminServiceAccount(clientId)
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

    const serviceCreatedClientHandle = await kcCustom
      .realm(realm)
      .client(clientId + 'bysvc')
      .ensure({});

    expect(serviceCreatedClientHandle).toBeTruthy();
  });
});
