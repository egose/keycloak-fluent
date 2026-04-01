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

const customRealm = await kcMaster.realm(realmName).ensure({ displayName: realmDisplayName });
await customRealm
  .realmAdminServiceAccount(realmAdminClientId)
  .ensure({ description: realmAdminClientDescription, secret: realmAdminClientSecret });

const kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kcCustom.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});
