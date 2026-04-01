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

const ldapComponent = await realm
  .component('ldap-users', {
    parentId: realmName,
    providerId: 'ldap',
    providerType: 'org.keycloak.storage.UserStorageProvider',
  })
  .ensure({
    parentId: realmName,
    providerId: 'ldap',
    providerType: 'org.keycloak.storage.UserStorageProvider',
    config: {
      enabled: ['true'],
      priority: ['0'],
    },
  });

const ldapMappers = await ldapComponent.listSubComponents('org.keycloak.storage.ldap.mappers.LDAPStorageMapper');
