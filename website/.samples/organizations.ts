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
const organization = await realm.organization('acme').ensure({
  name: 'Acme Corp',
  description: 'Default organization for Acme users',
});

const alice = await realm.user('alice').ensure({
  email: 'alice@example.com',
  firstName: 'Alice',
  lastName: 'Admin',
  enabled: true,
});

await organization.addMember(alice);

const invite = new FormData();
invite.set('email', 'contractor@example.com');
await organization.invite(invite);

// Assumes the identity provider already exists in the realm.
await organization.linkIdentityProvider(realm.identityProvider('google'));

const members = await organization.listMembers({ membershipType: 'managed' });
const linkedIdentityProviders = await organization.listIdentityProviders();
