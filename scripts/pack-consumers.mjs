// Install the packed tarball into isolated ESM, CJS, and TypeScript consumer
// projects, then exercise `simpleAuth()` validation and representative
// handle creation against each.
//
// Run with: node scripts/pack-consumers.mjs
//
// Exit non-zero if any consumer fails to install or its smoke test fails.
// Never runs against the workspace `node_modules` — every consumer gets a
// fresh, isolated install of the freshly packed tarball.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const ROOT = resolve(process.cwd());
const SNAPSHOT_ROOT = join(ROOT, 'scripts', 'api-snapshots');
const ESM_RUNTIME_EXPORTS = readSnapshot('esm-runtime-exports.json');
const CJS_RUNTIME_EXPORTS = readSnapshot('cjs-runtime-exports.json');
const DECLARATION_EXPORTS = readSnapshot('declaration-exports.json');
const PACKAGE_ENTRY_POINTS = readSnapshot('package-entry-points.json');

function readSnapshot(name) {
  return JSON.parse(readFileSync(join(SNAPSHOT_ROOT, name), 'utf8'));
}

function assertSnapshot(name, actual, expected) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  if (JSON.stringify(actualSorted) === JSON.stringify(expectedSorted)) return;

  const actualSet = new Set(actualSorted);
  const expectedSet = new Set(expectedSorted);
  const missing = expectedSorted.filter((entry) => !actualSet.has(entry));
  const extra = actualSorted.filter((entry) => !expectedSet.has(entry));
  console.error(
    `pack:consumers FAILED: ${name} snapshot mismatch` +
      (missing.length ? `\nmissing: ${missing.join(', ')}` : '') +
      (extra.length ? `\nextra: ${extra.join(', ')}` : ''),
  );
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    stdio: opts.silent ? ['ignore', 'ignore', 'pipe'] : 'inherit',
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    console.error(
      `pack:consumers FAILED: command "${cmd} ${args.join(' ')}" exited ${result.status}` +
        (stderr ? `\n${stderr}` : ''),
    );
    process.exit(result.status ?? 1);
  }
  return result;
}

function ensureBuilt() {
  run('pnpm', ['exec', 'rimraf', './dist']);
  run('pnpm', ['build'], { silent: true });
}

function packTarball() {
  // `--ignore-scripts` skips the package's own `prepack`; `ensureBuilt()`
  // already rebuilt `dist/` from current source above. This keeps tsup's
  // CLI output out of the JSON stdout we parse below.
  const out = execFileSync('npm', ['pack', '--json', '--ignore-scripts'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(out);
  if (!Array.isArray(parsed) || parsed.length !== 1) {
    console.error(`pack:consumers FAILED: unexpected \`npm pack\` output: ${out}`);
    process.exit(1);
  }
  return join(ROOT, parsed[0].filename);
}

function rmAndMkdir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

// Each runtime smoke test exercises:
// 1. ESM/CJS runtime export names exactly match the public API snapshots.
// 2. Every named runtime export is callable/constructable from the installed root.
// 3. Deterministic `simpleAuth()` validation cases reject before network access.
// 4. `simpleAuth({})` uses the documented client-credentials default against a
//    local token endpoint, not an external network failure.
// 5. Public handle factory chains return instances of every exported handle.
const SMOKE_BODY_JS = `
const EXPECTED_RUNTIME_EXPORTS = __EXPECTED_RUNTIME_EXPORTS__;
const RUNTIME_CLASS_EXPORTS = EXPECTED_RUNTIME_EXPORTS.filter((name) => name !== 'default' && name !== 'createManagedKeycloakClient');

function assert(cond, msg) {
  if (!cond) throw new Error('assertion failed: ' + msg);
}

function assertExports(actual, expected, msg) {
  const actualSorted = Object.keys(actual).sort();
  const expectedSorted = [...expected].sort();
  assert(JSON.stringify(actualSorted) === JSON.stringify(expectedSorted), msg + ': ' + JSON.stringify(actualSorted));
}

function assertRuntimeExportFunctions() {
  assert(typeof api.default === 'function', 'default export is a class/function');
  for (const name of RUNTIME_CLASS_EXPORTS) {
    assert(typeof api[name] === 'function', name + ' is a function/class export');
  }
  assert(typeof api.createManagedKeycloakClient === 'function', 'createManagedKeycloakClient is exported');
}

function assertInstance(value, exportedName, msg) {
  assert(value instanceof api[exportedName], msg + ' is an instance of ' + exportedName);
}

function assertRejects(p, expectedSub) {
  return p.then(
    () => { throw new Error('expected rejection but promise resolved'); },
    (err) => {
      const m = String(err && err.message ? err.message : err);
      if (expectedSub && !m.includes(expectedSub)) {
        throw new Error('expected message to include "' + expectedSub + '" but got: ' + m);
      }
    },
  );
}

function withTokenServer(fn) {
  const requests = [];
  const server = createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, body });
      if (req.url === '/realms/master/protocol/openid-connect/token') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ access_token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjIwMDAwMDAwMDAsImlhdCI6MTkwMDAwMDAwMH0.', expires_in: 60, token_type: 'Bearer' })); # pragma: allowlist secret
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('local token server did not expose a TCP address'));
        return;
      }
      Promise.resolve(fn('http://127.0.0.1:' + address.port, requests)).then(resolve, reject).finally(() => {
        server.close();
      });
    });
  });
}

async function assertSimpleAuthDefaultClientCredentials(KcFluent) {
  await withTokenServer(async (baseUrl, requests) => {
    const kc = new KcFluent({ baseUrl, realmName: 'master' });
    await kc.simpleAuth({});
    assert(requests.length === 1, 'simpleAuth({}) sends exactly one local token request');
    const request = requests[0];
    assert(request.method === 'POST', 'simpleAuth({}) token request uses POST');
    assert(request.url === '/realms/master/protocol/openid-connect/token', 'simpleAuth({}) targets master token endpoint');
    const body = new URLSearchParams(request.body);
    assert(body.get('grant_type') === 'client_credentials', 'simpleAuth({}) selects client_credentials grant');
    assert(body.get('client_id') === 'admin-cli', 'simpleAuth({}) uses documented default clientId');
    assert(!body.has('password'), 'simpleAuth({}) does not send password');
    assert(!body.has('refresh_token'), 'simpleAuth({}) does not send refresh token');
  });
}

function assertHandleFactories(kc) {
  const realm = kc.realm('master');
  assertInstance(realm, 'RealmHandle', 'realm() result');
  assert(realm.realmName === 'master', 'realm handle has realmName="master"');
  assertInstance(kc.serverInfo(), 'ServerInfoHandle', 'serverInfo() result');
  assertInstance(kc.whoAmI('master'), 'WhoAmIHandle', 'whoAmI() result');

  const client = realm.client('client');
  assertInstance(client, 'ClientHandle', 'realm.client() result');
  assertInstance(realm.confidentialBrowserLoginClient('confidential'), 'ConfidentialBrowserLoginClientHandle', 'confidentialBrowserLoginClient() result');
  assertInstance(realm.publicBrowserLoginClient('public'), 'PublicBrowserLoginClientHandle', 'publicBrowserLoginClient() result');
  assertInstance(realm.serviceAccount('service'), 'ServiceAccountHandle', 'serviceAccount() result');
  assertInstance(realm.realmAdminServiceAccount('realm-admin'), 'RealmAdminServiceAccountHandle', 'realmAdminServiceAccount() result');

  const clientScope = realm.clientScope('scope');
  assertInstance(clientScope, 'ClientScopeHandle', 'realm.clientScope() result');
  assertInstance(realm.authenticationFlow('browser'), 'AuthenticationFlowHandle', 'realm.authenticationFlow() result');
  assertInstance(realm.component('component'), 'ComponentHandle', 'realm.component() result');
  assertInstance(realm.role('role'), 'RoleHandle', 'realm.role() result');
  const group = realm.group('group');
  assertInstance(group, 'GroupHandle', 'realm.group() result');
  assertInstance(group, 'AbstractGroupHandle', 'group handle');
  const childGroup = group.childGroup('child');
  assertInstance(childGroup, 'ChildGroupHandle', 'group.childGroup() result');
  assertInstance(childGroup, 'AbstractGroupHandle', 'child group handle');
  const nestedChildGroup = childGroup.childGroup('nested');
  assertInstance(nestedChildGroup, 'NestedChildGroupHandle', 'childGroup.childGroup() result');
  assertInstance(nestedChildGroup, 'AbstractGroupHandle', 'nested child group handle');
  assertInstance(realm.user('user'), 'UserHandle', 'realm.user() result');
  const identityProvider = realm.identityProvider('idp');
  assertInstance(identityProvider, 'IdentityProviderHandle', 'realm.identityProvider() result');
  assertInstance(identityProvider.mapper('mapper'), 'IdentityProviderMapperHandle', 'identityProvider.mapper() result');
  assertInstance(realm.organization('org'), 'OrganizationHandle', 'realm.organization() result');
  assertInstance(realm.userStorageProvider('provider'), 'UserStorageProviderHandle', 'realm.userStorageProvider() result');
  assertInstance(realm.cache(), 'CacheHandle', 'realm.cache() result');
  assertInstance(realm.attackDetection('user-id'), 'AttackDetectionHandle', 'realm.attackDetection() result');
  assertInstance(realm.clientPolicies(), 'ClientPoliciesHandle', 'realm.clientPolicies() result');
  assertInstance(realm.workflow('workflow'), 'WorkflowHandle', 'realm.workflow() result');

  assertInstance(client.role('role'), 'ClientRoleHandle', 'client.role() result');
  assertInstance(client.protocolMapper('mapper'), 'ProtocolMapperHandle', 'client.protocolMapper() result');
  assertInstance(client.userAttributeProtocolMapper('mapper'), 'UserAttributeProtocolMapperHandle', 'client.userAttributeProtocolMapper() result');
  assertInstance(client.hardcodedClaimProtocolMapper('mapper'), 'HardcodedClaimProtocolMapperHandle', 'client.hardcodedClaimProtocolMapper() result');
  assertInstance(client.audienceProtocolMapper('mapper'), 'AudienceProtocolMapperHandle', 'client.audienceProtocolMapper() result');

  assertInstance(clientScope.protocolMapper('mapper'), 'ClientScopeProtocolMapperHandle', 'clientScope.protocolMapper() result');
  assertInstance(clientScope.userAttributeProtocolMapper('mapper'), 'ClientScopeUserAttributeProtocolMapperHandle', 'clientScope.userAttributeProtocolMapper() result');
  assertInstance(clientScope.hardcodedClaimProtocolMapper('mapper'), 'ClientScopeHardcodedClaimProtocolMapperHandle', 'clientScope.hardcodedClaimProtocolMapper() result');
  assertInstance(clientScope.audienceProtocolMapper('mapper'), 'ClientScopeAudienceProtocolMapperHandle', 'clientScope.audienceProtocolMapper() result');
}

async function main() {
  assertExports(api, EXPECTED_RUNTIME_EXPORTS, 'runtime exports match snapshot');
  assertRuntimeExportFunctions();
  const KcFluent = api.default;
  const managed = api.createManagedKeycloakClient({ baseUrl: 'http://127.0.0.1', clientId: 'admin-cli', clientSecret: 'secret' });
  assert(managed instanceof KcFluent, 'createManagedKeycloakClient returns default client instance');
  assert(new api.UserPasswordProvisioningError({
    message: 'x',
    username: 'alice',
    realmName: 'master',
    passwordApplied: false,
    profileApplied: false,
    accountPersists: false,
    accountEnabled: false,
    initialProvisioning: true,
  }) instanceof Error, 'UserPasswordProvisioningError is constructable');
  assert(new api.WorkflowNotFoundError('master', 'flow') instanceof Error, 'WorkflowNotFoundError is constructable');
  assert(new api.DuplicateWorkflowNameError('master', 'flow', 2) instanceof Error, 'DuplicateWorkflowNameError is constructable');
  assert(new api.AuthenticationFlowNotFoundError('master', 'browser') instanceof Error, 'AuthenticationFlowNotFoundError is constructable');
  const kc = new KcFluent();
  assert(typeof kc.simpleAuth === 'function', 'simpleAuth is a method');
  assert(typeof kc.realm === 'function', 'realm is a method');
  assert(typeof kc.serverInfo === 'function', 'serverInfo is a method');
  assert(typeof kc.whoAmI === 'function', 'whoAmI is a method');

  await assertRejects(kc.simpleAuth({ clientId: '' }), 'clientId to be non-empty');
  await assertRejects(kc.simpleAuth({ password: 'p' }), 'username when password is provided');
  await assertRejects(kc.simpleAuth({ username: 'u' }), 'password when username is provided');
  await assertRejects(
    kc.simpleAuth({ password: 'p', refreshToken: 'r' }),
    'either password credentials or a refresh token',
  );
  await assertSimpleAuthDefaultClientCredentials(KcFluent);
  assertHandleFactories(kc);
}

main().then(
  () => { console.log('consumer smoke OK'); process.exit(0); },
  (err) => { console.error('consumer smoke FAILED:', err && err.stack ? err.stack : err); process.exit(1); },
);
`;

const SMOKE_SOURCE_ESM = `
import { createServer } from 'node:http';
import * as api from '@egose/keycloak-fluent';
${SMOKE_BODY_JS.replace('__EXPECTED_RUNTIME_EXPORTS__', JSON.stringify(ESM_RUNTIME_EXPORTS))}`;

const SMOKE_SOURCE_CJS = `
const { createServer } = require('node:http');
const api = require('@egose/keycloak-fluent');
${SMOKE_BODY_JS.replace('__EXPECTED_RUNTIME_EXPORTS__', JSON.stringify(CJS_RUNTIME_EXPORTS))}`;

const TYPE_IMPORT_NAMES = DECLARATION_EXPORTS.filter((name) => name !== 'default');
const TYPE_IMPORTS = TYPE_IMPORT_NAMES.map((name) => `  ${name},`).join('\n');
const TYPE_ARGUMENTS = new Map([['FetchPageResult', 'unknown']]);

function getTypeReference(name) {
  if (ESM_RUNTIME_EXPORTS.includes(name)) return `typeof ${name}`;
  const args = TYPE_ARGUMENTS.get(name);
  return args ? `${name}<${args}>` : name;
}

// TypeScript variant: strict-typed so the consumer's `tsc --noEmit` validates
// every public declaration export from the snapshot in an external project with
// `skipLibCheck: false`.
const SMOKE_SOURCE_TS = `
import KcFluent from '@egose/keycloak-fluent';
import { createServer } from 'node:http';
import type {
${TYPE_IMPORTS}
} from '@egose/keycloak-fluent';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error('assertion failed: ' + msg);
}

function assertRejects(p: Promise<unknown>, expectedSub?: string): Promise<void> {
  return p.then(
    () => { throw new Error('expected rejection but promise resolved'); },
    (err: unknown) => {
      const m = String(err instanceof Error ? err.message : err);
      if (expectedSub && !m.includes(expectedSub)) {
        throw new Error('expected message to include "' + expectedSub + '" but got: ' + m);
      }
    },
  );
}

function withTokenServer(fn: (baseUrl: string, requests: Array<{ method: string | undefined; url: string | undefined; body: string }>) => Promise<void>): Promise<void> {
  const requests: Array<{ method: string | undefined; url: string | undefined; body: string }> = [];
  const server = createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, body });
      if (req.url === '/realms/master/protocol/openid-connect/token') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ access_token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjIwMDAwMDAwMDAsImlhdCI6MTkwMDAwMDAwMH0.', expires_in: 60, token_type: 'Bearer' })); # pragma: allowlist secret
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('local token server did not expose a TCP address'));
        return;
      }
      fn('http://127.0.0.1:' + address.port, requests).then(resolve, reject).finally(() => {
        server.close();
      });
    });
  });
}

async function main(): Promise<void> {
  assert(typeof KcFluent === 'function', 'default export is a class/function');
  const kc = new KcFluent();
  assert(typeof kc.simpleAuth === 'function', 'simpleAuth is a method');
  assert(typeof kc.realm === 'function', 'realm is a method');
  assert(typeof kc.serverInfo === 'function', 'serverInfo is a method');
  assert(typeof kc.whoAmI === 'function', 'whoAmI is a method');

  await assertRejects(kc.simpleAuth({ clientId: '' }), 'clientId to be non-empty');
  await assertRejects(kc.simpleAuth({ password: 'p' }), 'username when password is provided');
  await assertRejects(kc.simpleAuth({ username: 'u' }), 'password when username is provided');
  await assertRejects(
    kc.simpleAuth({ password: 'p', refreshToken: 'r' }),
    'either password credentials or a refresh token',
  );

  await withTokenServer(async (baseUrl, requests) => {
    const localKc = new KcFluent({ baseUrl, realmName: 'master' });
    await localKc.simpleAuth({});
    assert(requests.length === 1, 'simpleAuth({}) sends exactly one local token request');
    const request = requests[0]!;
    assert(request.method === 'POST', 'simpleAuth({}) token request uses POST');
    assert(request.url === '/realms/master/protocol/openid-connect/token', 'simpleAuth({}) targets master token endpoint');
    const body = new URLSearchParams(request.body);
    assert(body.get('grant_type') === 'client_credentials', 'simpleAuth({}) selects client_credentials grant');
    assert(body.get('client_id') === 'admin-cli', 'simpleAuth({}) uses documented default clientId');
  });

  const realm = kc.realm('master');
  assert(realm && typeof realm === 'object', 'realm() returns a handle object');
  assert(realm.realmName === 'master', 'realm handle has realmName="master"');
}

main().then(
  () => { console.log('consumer smoke OK'); process.exit(0); },
  (err: unknown) => { console.error('consumer smoke FAILED:', err instanceof Error ? err.stack : err); process.exit(1); },
);

type PublicDeclarationSmoke = {
${TYPE_IMPORT_NAMES.map((name) => `  ${name}: ${getTypeReference(name)};`).join('\n')}
};

type _PublicDeclarationSmokeKey = keyof PublicDeclarationSmoke;
type _PublicDeclarationSmokeValue = PublicDeclarationSmoke;
`;

function writeConsumer(name, dir, opts) {
  const deps = {
    '@egose/keycloak-fluent': `file:${opts.tarballPath}`,
  };
  if (opts.typeScript) {
    deps.typescript = '^6.0.0';
    deps['@types/node'] = '^25.0.0';
    deps.tsx = '^4.21.0';
  }
  if (opts.upstreamVersion) {
    deps['@keycloak/keycloak-admin-client'] = opts.upstreamVersion;
  }

  const pkg = {
    name,
    version: '0.0.0',
    private: true,
    type: opts.packageType,
    dependencies: deps,
    scripts: opts.smokeScript,
  };
  writeFileSync(join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

  if (opts.typeScript) {
    writeFileSync(join(dir, 'consumer.ts'), SMOKE_SOURCE_TS);
    writeFileSync(
      join(dir, 'tsconfig.json'),
      `${JSON.stringify({
        compilerOptions: {
          target: 'es2022',
          module: 'es2022',
          moduleResolution: 'bundler',
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          types: ['node'],
        },
        include: ['consumer.ts'],
      }, null, 2)}\n`,
    );
  } else if (opts.packageType === 'module') {
    writeFileSync(join(dir, 'consumer.mjs'), SMOKE_SOURCE_ESM);
  } else {
    writeFileSync(join(dir, 'consumer.cjs'), SMOKE_SOURCE_CJS);
  }
}

function getDeclarationExports(dtsPath) {
  const source = ts.createSourceFile('index.d.ts', readFileSync(dtsPath, 'utf8'), ts.ScriptTarget.Latest, true);
  const names = [];

  for (const statement of source.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
      continue;
    }
    for (const specifier of statement.exportClause.elements) {
      names.push(specifier.name.text);
    }
  }

  return [...new Set(names)].sort();
}

function assertDeclarationSnapshot(dir) {
  assertSnapshot(
    'TypeScript declaration exports',
    getDeclarationExports(join(dir, 'node_modules', '@egose', 'keycloak-fluent', 'dist', 'index.d.ts')),
    DECLARATION_EXPORTS,
  );
}

function assertPackageEntryPoints(dir) {
  const pkg = JSON.parse(readFileSync(join(dir, 'node_modules', '@egose', 'keycloak-fluent', 'package.json'), 'utf8'));
  assertSnapshot('package entry points', Object.keys(pkg.exports ?? {}), PACKAGE_ENTRY_POINTS);
}

function npmInstall(dir) {
  run('npm', ['install', '--no-fund', '--no-audit', '--ignore-scripts'], {
    cwd: dir,
  });
}

function runSmoke(dir) {
  run('npm', ['run', '--silent', 'smoke'], { cwd: dir });
}

function runTypeCheck(dir) {
  run('npx', ['tsc', '--noEmit', '-p', join(dir, 'tsconfig.json')], {
    cwd: dir,
  });
}

let tarballPath;
let consumersRoot;

try {
  ensureBuilt();
  tarballPath = packTarball();

  consumersRoot = join(ROOT, '.packed-consumers');
  rmAndMkdir(consumersRoot);

  const consumers = [
    {
      name: '@packed-consumer/esm',
      dir: join(consumersRoot, 'esm'),
      opts: {
        packageType: 'module',
        typeScript: false,
        smokeScript: { smoke: 'node consumer.mjs' },
      },
    },
    {
      name: '@packed-consumer/cjs',
      dir: join(consumersRoot, 'cjs'),
      opts: {
        packageType: undefined,
        typeScript: false,
        smokeScript: { smoke: 'node consumer.cjs' },
      },
    },
    {
      name: '@packed-consumer/ts',
      dir: join(consumersRoot, 'ts'),
      opts: {
        packageType: 'module',
        typeScript: true,
        smokeScript: { smoke: 'tsx consumer.ts' },
      },
    },
    {
      name: '@packed-consumer/ts-min-keycloak-admin-client',
      dir: join(consumersRoot, 'ts-min-keycloak-admin-client'),
      opts: {
        packageType: 'module',
        typeScript: true,
        upstreamVersion: '26.5.7',
        smokeScript: { smoke: 'tsx consumer.ts' },
      },
    },
  ];

  for (const c of consumers) {
    rmAndMkdir(c.dir);
    writeConsumer(c.name, c.dir, { ...c.opts, tarballPath });
    console.log(`\npack:consumers: installing ${c.name}...`);
    npmInstall(c.dir);
    assertPackageEntryPoints(c.dir);
    assertDeclarationSnapshot(c.dir);
    console.log(`pack:consumers: running ${c.name} smoke test...`);
    runSmoke(c.dir);
    if (c.opts.typeScript) {
      console.log(`pack:consumers: type-checking ${c.name} against packed .d.ts (skipLibCheck=false)...`);
      runTypeCheck(c.dir);
    }
  }

  console.log('\npack:consumers OK: ESM, CJS, and TypeScript consumers exercised the packed tarball.');
  process.exit(0);
} catch (err) {
  console.error('pack:consumers FAILED:', err && err.stack ? err.stack : err);
  process.exit(1);
} finally {
  // Remove the tarball so the workspace tree stays clean; npm pack recreates
  // it on the next run. Keep the consumer dirs on failure for inspection.
  if (tarballPath && existsSync(tarballPath)) {
    rmSync(tarballPath);
  }
}
