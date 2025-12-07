import KeycloakAdminClientFluent from '../src/index';

test('Identity Providers', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testidprealm';
  const idpName = 'testidp';
  const idpProviderId = 'keycloak-oidc';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theidp = await therealm.identityProvider(idpName).ensure({ providerId: idpProviderId });

  expect(theidp).toBeTruthy();
  expect(theidp?.realmName).toBe(realm);
  expect(theidp?.identityProvider?.alias).toBe(idpName);
  expect(theidp?.identityProvider?.providerId).toBe(idpProviderId);

  const theidp2 = await kcMaster.realm(realm).identityProvider(idpName).ensure({ providerId: idpProviderId });

  expect(theidp2).toBeTruthy();
  expect(theidp2?.realmName).toBe(realm);
  expect(theidp2?.identityProvider?.alias).toBe(idpName);
  expect(theidp2?.identityProvider?.providerId).toBe(idpProviderId);
});
