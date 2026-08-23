import { readFileSync } from 'node:fs';

const failures = [];

function read(path) {
  return readFileSync(path, 'utf8');
}

function expect(description, condition) {
  if (!condition) failures.push(description);
}

const packageJson = JSON.parse(read('package.json'));
const pnpmLock = read('pnpm-lock.yaml');
const dockerfile = read('sandbox/keycloak/Dockerfile');
const readme = read('README.md');
const rootApiDoc = read('website/docs/api/keycloak-admin-client-fluent.mdx');
const userApiDoc = read('website/docs/api/user.mdx');
const userSource = read('src/user.ts');
const setupSandboxAction = read('.github/actions/setup-sandbox/action.yml');

const adminClientRange = packageJson.dependencies?.['@keycloak/keycloak-admin-client'];
const adminClientLockVersion = pnpmLock.match(/'@keycloak\/keycloak-admin-client':\n\s+specifier: \^?26\.5\.7\n\s+version: ([0-9.]+)/)?.[1];
const keycloakServerVersion = dockerfile.match(/FROM quay\.io\/keycloak\/keycloak:([0-9.]+)@sha256:/)?.[1];

expect('package.json declares @keycloak/keycloak-admin-client dependency range', adminClientRange === '^26.5.7');
expect('pnpm-lock.yaml resolves @keycloak/keycloak-admin-client', Boolean(adminClientLockVersion));
expect('sandbox Dockerfile pins a Keycloak server version', Boolean(keycloakServerVersion));

for (const [path, text] of [
  ['README.md', readme],
  ['website/docs/api/keycloak-admin-client-fluent.mdx', rootApiDoc],
]) {
  expect(`${path} mentions package dependency range ${adminClientRange}`, text.includes(`@keycloak/keycloak-admin-client@${adminClientRange}`));
  expect(`${path} mentions minimum supported admin client 26.5.7`, text.includes('@keycloak/keycloak-admin-client@26.5.7') || text.includes('admin client `26.5.7`'));
  expect(`${path} mentions lockfile-resolved admin client ${adminClientLockVersion}`, text.includes(`@keycloak/keycloak-admin-client@${adminClientLockVersion}`) || text.includes(`admin client \`${adminClientLockVersion}\``));
  expect(`${path} mentions sandbox Keycloak ${keycloakServerVersion}`, text.includes(`Keycloak \`${keycloakServerVersion}\``) || text.includes(`keycloak:${keycloakServerVersion}`));
}

expect('README separates sandbox-free checks from integration commands', readme.includes('Sandbox-free local checks can run without Docker or a Keycloak server'));
expect('README warns test:integration requires the sandbox', readme.includes('Do not run `pnpm test` or `pnpm test:integration` until the sandbox is reachable'));
expect('README documents publish:check includes typecheck:tests', readme.includes('`typecheck:tests` -> `test:unit`'));

const readmeAndWebsiteDocs = `${readme}\n${rootApiDoc}\n${userApiDoc}`;
expect('public docs do not claim checksum verification', !/checksum-(?:verified|verif)|checksum verification|checksum-verifies/i.test(readmeAndWebsiteDocs));
expect('setup-sandbox action has no stale docker-compose checksum input', !setupSandboxAction.includes('docker-compose-sha256'));
expect('README describes setup-tools as the Docker Compose installation boundary', readme.includes('.github/actions/setup-tools'));

const userInputSourceSnippet = userSource.match(/export type UserInputData = Omit<UserRepresentation, 'username' \| 'id'> & \{[\s\S]*?\n\};/)?.[0];
expect('src/user.ts exposes UserInputData snippet', Boolean(userInputSourceSnippet));
expect('UserInputData source includes passwordTemporary', userInputSourceSnippet?.includes('passwordTemporary?: boolean;'));
expect('user API docs import UserInputData from the package root', userApiDoc.includes("import type { UserInputData } from '@egose/keycloak-fluent';"));
expect('user API docs include passwordTemporary', userApiDoc.includes('passwordTemporary?: boolean;'));
expect('user API docs import UserPasswordProvisioningError from the package root', userApiDoc.includes("import { UserPasswordProvisioningError } from '@egose/keycloak-fluent';"));

if (failures.length > 0) {
  console.error('Documentation checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Documentation checks passed.');
