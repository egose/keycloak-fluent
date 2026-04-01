import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const realmName = 'my-custom-realm';
const realmAdminClientId = 'my-custom-realm-admin-sa';
const realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret
const clientId = 'my-client';
const clientDescription = 'My client';
const clientRoleName = 'my-client-role';
const clientRoleDescription = 'My client role';
const serviceAccountId = 'my-service-account';
const serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret
const publicBrowserLoginClientId = 'my-public-browser-login-client';
const confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';
const confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret

const kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kc.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});

const realm = kc.realm(realmName);

const client = await realm.client(clientId).ensure({ description: clientDescription });
await client.role(clientRoleName).ensure({ description: clientRoleDescription });

await realm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });
await realm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});
await realm.serviceAccount(confidentialBrowserLoginClientId).ensure({ secret: confidentialBrowserLoginClientSecret });
