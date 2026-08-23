import { readFile } from 'node:fs/promises';

const workflowPath = '.github/workflows/publish.yaml';
const packageJsonPath = 'package.json';

const [workflow, packageJsonText] = await Promise.all([
  readFile(workflowPath, 'utf8'),
  readFile(packageJsonPath, 'utf8'),
]);
const packageJson = JSON.parse(packageJsonText);

const failures = [];

function expect(description, condition) {
  if (!condition) {
    failures.push(description);
  }
}

const publishCheck = packageJson.scripts?.['publish:check'] ?? '';

expect('publish:check runs test typechecking', /pnpm\s+typecheck:tests/.test(publishCheck));
expect('publish workflow is tag-triggered', /tags:\s*\n\s*-\s*v\*\.\*\.\*/.test(workflow));
expect('publish workflow has tag-scoped concurrency', /concurrency:[\s\S]*group:\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}/.test(workflow));
expect('publish workflow does not cancel an in-flight publish for the same tag', /cancel-in-progress:\s*false/.test(workflow));
expect('static verification checks out the tagged SHA', /static-verification:[\s\S]*actions\/checkout@[a-f0-9]{40}[\s\S]*ref:\s*\$\{\{\s*github\.sha\s*\}\}/.test(workflow));
expect('integration verification checks out the tagged SHA', /integration-verification:[\s\S]*actions\/checkout@[a-f0-9]{40}[\s\S]*ref:\s*\$\{\{\s*github\.sha\s*\}\}/.test(workflow));
expect('publish job checks out the tagged SHA', /publish:[\s\S]*actions\/checkout@[a-f0-9]{40}[\s\S]*ref:\s*\$\{\{\s*github\.sha\s*\}\}/.test(workflow));
expect('integration verification runs inside the sandbox action', /integration-verification:[\s\S]*uses:\s*\.\/\.github\/actions\/setup-sandbox[\s\S]*script:\s*pnpm test:integration/.test(workflow));
expect('publish waits for static verification', /needs:[\s\S]*-\s*static-verification/.test(workflow));
expect('publish waits for integration verification', /needs:[\s\S]*-\s*integration-verification/.test(workflow));
expect('publish job has read-only contents permission', /publish:[\s\S]*permissions:\s*\n\s*contents:\s*read/.test(workflow));
expect('publish step uses npm publish without lifecycle scripts', /npm publish --ignore-scripts --access public/.test(workflow));
expect('publish job refuses an already-published package version', /npm view "\$PACKAGE_SPEC" version/.test(workflow));

const tokenMatches = [...workflow.matchAll(/NPM_TOKEN|NODE_AUTH_TOKEN|_authToken|secrets\.NPM_TOKEN/g)];
const publishStepIndex = workflow.indexOf('- name: Publish package');
expect('npm credential references exist only in the final publish step', tokenMatches.length > 0 && tokenMatches.every((match) => match.index > publishStepIndex));

const publishJobStart = workflow.indexOf('\n  publish:');
const publishStepStart = workflow.indexOf('- name: Publish package');
const prePublishSection = workflow.slice(0, publishStepStart);
expect('secret-free verification jobs do not reference npm credentials', !/NPM_TOKEN|NODE_AUTH_TOKEN|_authToken|secrets\.NPM_TOKEN/.test(prePublishSection));
expect('workflow contains a publish job before the final publish step', publishJobStart !== -1 && publishJobStart < publishStepStart);

if (failures.length > 0) {
  console.error('Release workflow verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Release workflow verification passed.');
