import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
await kcMaster.simpleAuth({
  username: 'admin',
  password: 'password', // pragma: allowlist secret
});

const realmName = 'my-custom-realm';
const realmDisplayName = 'My custom realm';
const realmAdminClientId = 'my-custom-realm-admin-sa';
const realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret
const realmAdminClientDescription = 'My realm admin service account';
const realmUserUsername = 'myuser';
const realmUserPassword = 'myuser-password'; // pragma: allowlist secret
const realmUserFirstName = 'Jone';
const realmUserLastName = 'Doe';
const realmRoleName = 'my-role';
const realmRoleDescription = 'My role';
const realmGroupName = 'my-group';
const realmGroupDescription = 'My group';
const realmChildGroupName = 'my-child-group';
const realmChildGroupDescription = 'My child group';
const clientId = 'my-client';
const clientDescription = 'My client';
const clientRoleName = 'my-client-role';
const clientRoleDescription = 'My client role';
const serviceAccountId = 'my-service-account';
const serviceAccountSecret = 'my-service-account-password'; // pragma: allowlist secret
const publicBrowserLoginClientId = 'my-public-browser-login-client';
const confidentialBrowserLoginClientId = 'my-confidential-browser-login-client';
const confidentialBrowserLoginClientSecret = 'my-confidential-browser-login-client-password'; // pragma: allowlist secret
const clientProtocolMapperName = 'my-client-mapper';
const clientAudienceMapperName = 'my-audience-mapper';
const clientHardcodedClaimMapperName = 'my-hardcoded-claim-mapper';
const clientUserAttributeMapperName = 'my-user-attribute-mapper';

const customRealm = await kcMaster.realm(realmName).ensure({ displayName: realmDisplayName });
await customRealm
  .realmAdminServiceAccount(realmAdminClientId)
  .ensure({ description: realmAdminClientDescription, secret: realmAdminClientSecret });

const kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kcCustom.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});

const realmUser = await customRealm
  .user(realmUserUsername)
  .ensure({ firstName: realmUserFirstName, lastName: realmUserLastName, password: realmUserPassword });

const realmRole = await customRealm.role(realmRoleName).ensure({ description: realmRoleDescription });
const realmGroup = await customRealm.group(realmGroupName).ensure({ description: realmGroupDescription });
const realmChildGroup = await realmGroup
  .childGroup(realmChildGroupName)
  .ensure({ description: realmChildGroupDescription });

await realmUser.assignRole(realmRole);
await realmUser.assignGroup(realmGroup);
await realmUser.assignGroup(realmChildGroup);

const client = await customRealm.client(clientId).ensure({ description: clientDescription });
const clientRole = await client.role(clientRoleName).ensure({ description: clientRoleDescription });
await realmUser.assignClientRole(clientRole);

const serviceAccount = await customRealm.serviceAccount(serviceAccountId).ensure({ secret: serviceAccountSecret });
const publicBrowserLoginClient = await customRealm.publicBrowserLoginClient(publicBrowserLoginClientId).ensure({});
const confidentialBrowserLoginClient = await customRealm
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
