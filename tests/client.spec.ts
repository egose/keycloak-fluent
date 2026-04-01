import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Clients', async () => {
  await withEnsuredMasterRealm('testclientrealm', async ({ kcMaster, realm, realmHandle }) => {
    const clientId = 'testclient';
    const clientDisplayName = 'A client for testing purposes';
    const initialSecret = 'testclientsecret'; // pragma: allowlist secret

    const clientHandle = await realmHandle.client(clientId).ensure({
      description: clientDisplayName,
      publicClient: false,
      secret: initialSecret,
    });

    expect(clientHandle).toBeTruthy();
    expect(clientHandle?.realmName).toBe(realm);
    expect(clientHandle?.client?.clientId).toBe(clientId);
    expect(clientHandle?.client?.description).toBe(clientDisplayName);

    const clientSecret = await clientHandle.getSecret();
    expect(clientSecret?.value).toBeTruthy();

    const updatedClientHandle = await kcMaster
      .realm(realm)
      .client(clientId)
      .ensure({ description: clientDisplayName + ' v2' });
    expect(updatedClientHandle).toBeTruthy();
    expect(updatedClientHandle?.realmName).toBe(realm);
    expect(updatedClientHandle?.client?.clientId).toBe(clientId);
    expect(updatedClientHandle?.client?.description).toBe(clientDisplayName + ' v2');

    const regeneratedSecret = await updatedClientHandle.regenerateSecret();
    expect(regeneratedSecret?.value).toBeTruthy();
    expect(regeneratedSecret?.value).not.toBe(clientSecret.value);

    const fetchedRegeneratedSecret = await updatedClientHandle.getSecret();
    expect(fetchedRegeneratedSecret?.value).toBe(regeneratedSecret.value);

    const searchedClients = await realmHandle.searchClients(clientId.slice(1, -1));
    expect(Array.isArray(searchedClients)).toBe(true);
    expect(searchedClients.length).toBeGreaterThan(0);
  });
});
