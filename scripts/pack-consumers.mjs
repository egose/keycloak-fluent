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
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

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

// Each consumer's smoke test exercises:
// 1. The default export is a class with `simpleAuth`, `realm`, `serverInfo`,
//    and `whoAmI` methods.
// 2. `simpleAuth({})` rejects.
// 3. `simpleAuth({ password: 'x' })` (missing username) rejects.
// 4. `simpleAuth({ username: 'x' })` (missing password) rejects.
// 5. `simpleAuth({ password: 'p', refreshToken: 'r' })` rejects (both).
// 6. `kc.realm('master')` returns a handle whose `realmName` is 'master'.
const SMOKE_SOURCE_JS = `
import KcFluent from '@egose/keycloak-fluent';

function assert(cond, msg) {
  if (!cond) throw new Error('assertion failed: ' + msg);
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

async function main() {
  assert(typeof KcFluent === 'function', 'default export is a class/function');
  const kc = new KcFluent();
  assert(typeof kc.simpleAuth === 'function', 'simpleAuth is a method');
  assert(typeof kc.realm === 'function', 'realm is a method');
  assert(typeof kc.serverInfo === 'function', 'serverInfo is a method');
  assert(typeof kc.whoAmI === 'function', 'whoAmI is a method');

  await assertRejects(kc.simpleAuth({}), undefined);
  await assertRejects(kc.simpleAuth({ password: 'p' }), 'username when password is provided');
  await assertRejects(kc.simpleAuth({ username: 'u' }), 'password when username is provided');
  await assertRejects(
    kc.simpleAuth({ password: 'p', refreshToken: 'r' }),
    'either password credentials or a refresh token',
  );

  const realm = kc.realm('master');
  assert(realm && typeof realm === 'object', 'realm() returns a handle object');
  assert(realm.realmName === 'master', 'realm handle has realmName="master"');
}

main().then(
  () => { console.log('consumer smoke OK'); process.exit(0); },
  (err) => { console.error('consumer smoke FAILED:', err && err.stack ? err.stack : err); process.exit(1); },
);
`;

// TypeScript variant: same logic, strict-typed so the consumer's `tsc
// --noEmit` validates the packed `.d.ts` compiles in an external project
// with `skipLibCheck: false`.
const SMOKE_SOURCE_TS = `
import KcFluent from '@egose/keycloak-fluent';

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

async function main(): Promise<void> {
  assert(typeof KcFluent === 'function', 'default export is a class/function');
  const kc = new KcFluent();
  assert(typeof kc.simpleAuth === 'function', 'simpleAuth is a method');
  assert(typeof kc.realm === 'function', 'realm is a method');
  assert(typeof kc.serverInfo === 'function', 'serverInfo is a method');
  assert(typeof kc.whoAmI === 'function', 'whoAmI is a method');

  await assertRejects(kc.simpleAuth({}), undefined);
  await assertRejects(kc.simpleAuth({ password: 'p' }), 'username when password is provided');
  await assertRejects(kc.simpleAuth({ username: 'u' }), 'password when username is provided');
  await assertRejects(
    kc.simpleAuth({ password: 'p', refreshToken: 'r' }),
    'either password credentials or a refresh token',
  );

  const realm = kc.realm('master');
  assert(realm && typeof realm === 'object', 'realm() returns a handle object');
  assert(realm.realmName === 'master', 'realm handle has realmName="master"');
}

main().then(
  () => { console.log('consumer smoke OK'); process.exit(0); },
  (err: unknown) => { console.error('consumer smoke FAILED:', err instanceof Error ? err.stack : err); process.exit(1); },
);
`;

const SMOKE_SOURCE_CJS = SMOKE_SOURCE_JS.replace(
  "import KcFluent from '@egose/keycloak-fluent';",
  "const KcFluent = require('@egose/keycloak-fluent').default;",
);

function writeConsumer(name, dir, opts) {
  const deps = {
    '@egose/keycloak-fluent': `file:${opts.tarballPath}`,
  };
  if (opts.typeScript) {
    deps.typescript = '^6.0.0';
    deps['@types/node'] = '^25.0.0';
    deps.tsx = '^4.21.0';
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
    writeFileSync(join(dir, 'consumer.mjs'), SMOKE_SOURCE_JS);
  } else {
    writeFileSync(join(dir, 'consumer.cjs'), SMOKE_SOURCE_CJS);
  }
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
  ];

  for (const c of consumers) {
    rmAndMkdir(c.dir);
    writeConsumer(c.name, c.dir, { ...c.opts, tarballPath });
    console.log(`\npack:consumers: installing ${c.name}...`);
    npmInstall(c.dir);
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
