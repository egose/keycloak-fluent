import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('User Federated Identities', async () => {
  await withEnsuredMasterRealm('testuserfederatedidentityrealm', async ({ realm, realmHandle }) => {
    const userHandle = await realmHandle.user('federated-user').ensure({
      firstName: 'Federated',
      password: 'federated-user', // pragma: allowlist secret
    });
    const identityProviderHandle = await realmHandle.identityProvider('test-federated-idp').ensure({
      providerId: 'keycloak-oidc',
    });

    await userHandle.linkFederatedIdentity(identityProviderHandle, {
      userId: 'external-user-id',
      userName: 'external-user-name',
    });

    const federatedIdentities = await userHandle.listFederatedIdentities();
    expect(Array.isArray(federatedIdentities)).toBe(true);
    expect(
      federatedIdentities.some(
        (identity) =>
          identity.identityProvider === 'test-federated-idp' &&
          identity.userId === 'external-user-id' &&
          identity.userName === 'external-user-name',
      ),
    ).toBe(true);

    await userHandle.unlinkFederatedIdentity(identityProviderHandle);

    const federatedIdentitiesAfterUnlink = await userHandle.listFederatedIdentities();
    expect(federatedIdentitiesAfterUnlink.some((identity) => identity.identityProvider === 'test-federated-idp')).toBe(
      false,
    );

    expect(userHandle.realmName).toBe(realm);
  });
});
