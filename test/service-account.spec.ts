import KeycloakAdminClientFluent from '../src/index';

test('Service Accounts', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testserviceaccountrealm';
  const clientId = 'testserviceaccount';
  const clientDisplayName = 'A service account for testing purposes';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theclient = await therealm
    .serviceAccount(clientId)
    .ensure({ description: clientDisplayName, secret: 'testsecret' }); // pragma: allowlist secret

  expect(theclient).toBeTruthy();
  expect(theclient?.realmName).toBe(realm);
  expect(theclient?.client?.clientId).toBe(clientId);
  expect(theclient?.client?.description).toBe(clientDisplayName);
  expect(theclient?.client?.publicClient).toBe(false);
  expect(theclient?.client?.standardFlowEnabled).toBe(false);
  expect(theclient?.client?.directAccessGrantsEnabled).toBe(false);
  expect(theclient?.client?.implicitFlowEnabled).toBe(false);
  expect(theclient?.client?.serviceAccountsEnabled).toBe(true);

  const kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: realm });
  await kcCustom.simpleAuth({
    clientId,
    clientSecret: 'testsecret', // pragma: allowlist secret
  });

  await expect(
    kcCustom
      .realm(realm)
      .client(clientId + 'bysvc')
      .ensure({}),
  ).rejects.toThrow(/HTTP 403 Forbidden/);
});
