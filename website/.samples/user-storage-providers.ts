import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const realmName = 'my-custom-realm';
const realmAdminClientId = 'my-custom-realm-admin-sa';
const realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret
const providerId = 'federation-provider-id';
const mapperParentId = 'ldap-mapper-parent-id';

const kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kc.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});

const provider = kc.realm(realmName).userStorageProvider(providerId);

const providerMetadata = await provider.getName();
const fullSyncResult = await provider.sync('triggerFullSync');
const changedUsersSyncResult = await provider.sync('triggerChangedUsersSync');
const mapperSyncResult = await provider.syncMappers(mapperParentId, 'fedToKeycloak');

await provider.unlinkUsers();
await provider.removeImportedUsers();
