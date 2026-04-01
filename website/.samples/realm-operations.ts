import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const realmName = 'my-custom-realm';
const realmAdminClientId = 'my-custom-realm-admin-sa';
const realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret

const kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kc.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});

const realm = kc.realm(realmName);

await realm.cache().clearUserCache();
await realm.cache().clearKeysCache();

const bruteForceStatus = await realm.attackDetection('user-id-123').get();
if (bruteForceStatus && !bruteForceStatus.disabled) {
  await realm.attackDetection('user-id-123').clear();
}

await realm.clientPolicies().updateProfiles({
  profiles: [{ name: 'secure-clients' }],
});

await realm.clientPolicies().updatePolicies({
  policies: [{ name: 'enforce-pkce' }],
});

const approvalWorkflow = await realm.workflow('approval').ensure({ enabled: true });
const workflows = await approvalWorkflow.list({ page: 1, pageSize: 20 });
