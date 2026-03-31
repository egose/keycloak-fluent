import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Identity Providers', async () => {
  await withEnsuredMasterRealm('testidprealm', async ({ kcMaster, realm, realmHandle }) => {
    const idpName = 'testidp';
    const idpProviderId = 'keycloak-oidc';

    const identityProviderHandle = await realmHandle.identityProvider(idpName).ensure({ providerId: idpProviderId });

    expect(identityProviderHandle).toBeTruthy();
    expect(identityProviderHandle?.realmName).toBe(realm);
    expect(identityProviderHandle?.identityProvider?.alias).toBe(idpName);
    expect(identityProviderHandle?.identityProvider?.providerId).toBe(idpProviderId);

    const updatedIdentityProviderHandle = await kcMaster
      .realm(realm)
      .identityProvider(idpName)
      .ensure({ providerId: idpProviderId });

    expect(updatedIdentityProviderHandle).toBeTruthy();
    expect(updatedIdentityProviderHandle?.realmName).toBe(realm);
    expect(updatedIdentityProviderHandle?.identityProvider?.alias).toBe(idpName);
    expect(updatedIdentityProviderHandle?.identityProvider?.providerId).toBe(idpProviderId);

    const searchedIdentityProviders = await realmHandle.searchIdentityProviders(idpName.slice(1, -1));
    expect(Array.isArray(searchedIdentityProviders)).toBe(true);
    expect(searchedIdentityProviders.length).toBeGreaterThan(0);
  });
});
