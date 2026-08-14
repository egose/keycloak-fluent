// Inspect the tarball that `npm pack` would produce.
//
// Run with: node scripts/pack-inspect.mjs
//
// Exits non-zero if the tarball contains files outside the allow-list or is
// missing any of the required root-entry distribution files. This catches
// stale `dist/` artifacts and accidental file-package drift before publish.

import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

const REQUIRED_DIST_FILES = [
  'dist/index.cjs',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/index.d.cts',
];

const ALLOWED_PREFIXES = [
  'dist/',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'package.json',
];

function runBuild() {
  // Inspect the dist produced from the current source. Rebuild silently so
  // tsup's CLI output does not contaminate the `npm pack --dry-run --json`
  // stdout below.
  try {
    execFileSync('pnpm', ['--silent', 'build'], {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
  } catch (err) {
    console.error('pack:inspect FAILED: `pnpm build` did not succeed');
    process.exit(1);
  }
}

function packDryRun() {
  // `--ignore-scripts` skips the package's own `prepack` so the tsup CLI
  // output does not bleed into the JSON response. We rebuild_dist_ explicitly
  // above from current source, so the inspected tarball always reflects the
  // real source, never a stale checkout.
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(out);
}

function fail(message) {
  console.error(`pack:inspect FAILED: ${message}`);
  process.exit(1);
}

runBuild();

const packed = packDryRun();
if (!Array.isArray(packed) || packed.length !== 1) {
  fail(`expected exactly one tarball entry from \`npm pack --dry-run\`, got ${packed.length}`);
}

const entries = packed[0].files ?? [];
console.log(`pack:inspect: tarball "${packed[0].filename}" (${packed[0].files?.length ?? 0} entries)`);

const presentPaths = new Set();
for (const entry of entries) {
  const rel = entry.path.replace(/^\.?\//, '');
  presentPaths.add(rel);
  const allowed = ALLOWED_PREFIXES.some((p) => rel === p || rel.startsWith(p));
  if (!allowed) {
    fail(`tarball contains disallowed path "${rel}" (not under ${ALLOWED_PREFIXES.join(', ')})`);
  }
  if (rel.endsWith('.map')) {
    fail(`tarball contains source map "${rel}" (package policy excludes source maps)`);
  }
}

for (const req of REQUIRED_DIST_FILES) {
  if (!presentPaths.has(req)) {
    fail(`required distribution file "${req}" is missing from the tarball`);
  }
}

const extraDist = [...presentPaths]
  .filter((p) => p.startsWith('dist/') && !REQUIRED_DIST_FILES.includes(p));
if (extraDist.length > 0) {
  fail(
    `tarball contains unexpected dist entries besides the root entry: ${extraDist.join(', ')}. ` +
      `The package exports map only exposes the root; tsup must be narrowed to \`entry: ['src/index.ts']\`.`,
  );
}

console.log('pack:inspect OK: tarball contains only intended files and no source maps.');
