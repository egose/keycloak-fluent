import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const kc = new KeycloakAdminClientFluent({
  baseUrl: 'http://localhost:8080',
  realmName: 'master',
});

await kc.simpleAuth({
  username: 'admin',
  password: 'password', // pragma: allowlist secret
});

const info = await kc.serverInfo().get();
const loginMessages = await kc.serverInfo().getEffectiveMessageBundles({
  realm: 'master',
  themeType: 'login',
  locale: 'en',
});

const currentAdmin = await kc.whoAmI('master').get();
const currentAdminInRealm = await kc.whoAmI('master', 'my-custom-realm').get();
