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

await realm.authenticationFlow('browser').copy('browser-copy');

const flow = realm.authenticationFlow('browser-copy');
await flow.addExecution('auth-cookie');
await flow.addSubFlow({
  alias: 'browser-copy-forms',
  description: 'Custom subflow for additional form checks',
});

const executions = await flow.listExecutions();
const cookieExecution = executions.find((execution) => execution.providerId === 'auth-cookie');

if (cookieExecution?.id) {
  await flow.updateExecution({ ...cookieExecution, requirement: 'ALTERNATIVE' });
  await flow.raiseExecutionPriority(cookieExecution.id);
}

const config = await flow.createConfig({
  alias: 'cookie-config',
  config: { 'cookie.max.age': '3600' },
});

await flow.updateConfig({
  ...config,
  config: { 'cookie.max.age': '7200' },
});

await flow.updateRequiredAction('UPDATE_PASSWORD', { enabled: true, defaultAction: false });
await flow.updateRequiredActionConfig('UPDATE_PASSWORD', { config: { max_auth_age: '600' } });
