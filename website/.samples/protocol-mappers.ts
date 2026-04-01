import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const realmName = 'my-custom-realm';
const realmAdminClientId = 'my-custom-realm-admin-sa';
const realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret
const serviceAccountId = 'my-service-account';
const serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret
const publicBrowserLoginClientId = 'my-public-browser-login-client';
const confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';
const confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret
const clientProtocolMapperName = 'my-client-mapper';
const clientAudienceMapperName = 'my-audience-mapper';
const clientHardcodedClaimMapperName = 'my-hardcoded-claim-mapper';
const clientUserAttributeMapperName = 'my-user-attribute-mapper';

const kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kc.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});

const realm = kc.realm(realmName);

const serviceAccount = await realm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });
const publicBrowserLoginClient = await realm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});
const confidentialBrowserLoginClient = await realm
  .serviceAccount(confidentialBrowserLoginClientId)
  .ensure({ secret: confidentialBrowserLoginClientSecret });

await serviceAccount.protocolMapper(clientProtocolMapperName).ensure({});
await publicBrowserLoginClient.audienceProtocolMapper(clientAudienceMapperName).ensure({ audience: 'myname' });

await confidentialBrowserLoginClient
  .hardcodedClaimProtocolMapper(clientHardcodedClaimMapperName)
  .ensure({ claimName: 'fruite', claimValue: 'apple' });

await confidentialBrowserLoginClient
  .userAttributeProtocolMapper(clientUserAttributeMapperName)
  .ensure({ claimName: 'myemail', userAttribute: 'email' });
