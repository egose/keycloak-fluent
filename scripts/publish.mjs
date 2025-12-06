import { execSync } from 'child_process';
import fse from 'fs-extra';
import _isArray from 'lodash-es/isArray.js';
import _forEach from 'lodash-es/forEach.js';
import _isString from 'lodash-es/isString.js';
import _isPlainObject from 'lodash-es/isPlainObject.js';
import _pick from 'lodash-es/pick.js';

const PUBLISH_DIR = 'dist';

const parseJson = (dir) => {
  const content = fse.readFileSync(dir).toString('utf-8');
  return JSON.parse(content);
};

const writeJson = (dir, object) => {
  fse.writeFileSync(dir, Buffer.from(JSON.stringify(object, null, 2), 'utf-8'));
};

async function main() {
  const originalPackageJSON = 'package.json';
  const targetPackageJSON = `${PUBLISH_DIR}/package.json`;
  let packageData = parseJson(originalPackageJSON);
  if (!packageData.name) return;

  const names = [packageData.name];
  if (_isArray(packageData.additionalNames)) names.push(...packageData.additionalNames);

  execSync('pnpm bundle');

  packageData = _pick(packageData, [
    'version',
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'sideEffects',
    'repository',
    'dependencies',
    'peerDependencies',
    'publishConfig',
    'release',
    'engines',
    'main',
    'module',
    'types',
    'exports',
  ]);

  ['LICENSE', 'README.md', 'CHANGELOG.md'].forEach((file) => {
    const src = file;
    const dest = `${PUBLISH_DIR}/${file}`;

    try {
      execSync(`test -f "${src}" && cp "${src}" "${dest}"`, { stdio: 'inherit' });
    } catch (error) {
      // Ignore errors if the file does not exist
    }
  });

  _forEach(names, (name) => {
    const packageJSON = {
      ...packageData,
      name,
      main: './index.cjs',
      module: './index.js',
      types: './index.d.ts',
      exports: {
        '.': {
          require: './index.cjs',
          import: './index.js',
          types: './index.d.ts',
        },
      },
    };

    console.log(packageJSON);

    writeJson(targetPackageJSON, packageJSON);
    execSync(`cd ${PUBLISH_DIR} && npm publish --access public`);
  });
}

main().catch(console.error);
