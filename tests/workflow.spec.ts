import { expect, test } from 'vitest';
import { DuplicateWorkflowNameError, WorkflowNotFoundError } from '../src/workflow';
import { withEnsuredMasterRealm } from './test-utils';

test('Workflow: server-side lookup, pagination, and not-found path', async () => {
  await withEnsuredMasterRealm('testworkflow', async ({ realmHandle }) => {
    const workflowName = `approve-${Math.random().toString(36).slice(2, 10)}`;

    // Keycloak 26.6.x requires every workflow to declare at least one step
    // whose providers share a single resource type (USERS / CLIENTS / ...);
    // an empty-steps workflow is rejected with
    // "Steps provided should support a single type". `delete-user` is a
    // built-in USERS-type step provider present in the digest-pinned sandbox,
    // so a one-step workflow with it is the minimal valid create body.
    const workflow = await realmHandle.workflow(workflowName).ensure({
      enabled: true,
      steps: [{ uses: 'delete-user' }],
    });
    expect(workflow).toBeTruthy();
    expect(workflow?.workflow?.id).toBeTruthy();
    expect(workflow?.workflow?.name).toBe(workflowName);

    // Direct id lookup terminates as soon as the unique match is known.
    const id = workflow!.workflow!.id!;
    const byId = await realmHandle.workflow(workflowName).getById(id);
    expect(byId?.id).toBe(id);
    expect(byId?.name).toBe(workflowName);

    // Missing id resolves to null. Keycloak 26.6.x never returns 404 for an
    // unknown workflow id (OpenAPI: only 200/400); it returns 400
    // "Not a valid workflow resource: <id>", which `getById` coerces to null
    // (see unit regression in `tests/implementation-workflow.spec.ts`).
    // Use a freshly-deleted uuid so the live server actually exercises the
    // not-found path it really sends, rather than a malformed-id string.
    const probeName = `probe-${Math.random().toString(36).slice(2, 10)}`;
    const probe = await realmHandle.workflow(probeName).ensure({
      enabled: true,
      steps: [{ uses: 'delete-user' }],
    });
    const probeId = probe!.workflow!.id!;
    await probe.delete();
    const missing = await realmHandle.workflow(probeName).getById(probeId);
    expect(missing).toBeNull();

    // Exact-name lookup returns the single match.
    const byName = await realmHandle.workflow(workflowName).get();
    expect(byName?.id).toBe(id);

    // A second get() reuses the cached representation (no extra round trip).
    const cached = await realmHandle.workflow(workflowName).get();
    expect(cached?.id).toBe(id);

    // `list()` requests only a single page from the server.
    const page = await realmHandle.workflow(workflowName).list({ page: 1, pageSize: 10 });
    expect(Array.isArray(page)).toBe(true);
    expect(page.length).toBeGreaterThan(0);
    expect(page.some((w) => w.id === id)).toBe(true);

    // `listAll()` iterates across pages and includes the created workflow.
    const all = await realmHandle.workflow(workflowName).listAll({ pageSize: 10, maxPages: 50 });
    expect(all.some((w) => w.id === id)).toBe(true);

    // searchWorkflows forwards the keyword to the server.
    const searched = await realmHandle.searchWorkflows(workflowName.slice(0, 6), { pageSize: 10 });
    expect(searched.some((w) => w.name === workflowName)).toBe(true);

    // Mutating a missing workflow raises the typed not-found error.
    const stranger = realmHandle.workflow('definitely-not-a-workflow');
    await expect(stranger.update({ enabled: false })).rejects.toBeInstanceOf(WorkflowNotFoundError);

    // Cleanup.
    await workflow.delete();
    expect(await realmHandle.workflow(workflowName).get()).toBeNull();

    // Note: duplicate-name behavior is covered at the unit-test layer
    // (`tests/implementation-workflow.spec.ts`); Keycloak itself enforces
    // unique workflow names, so a live duplicate cannot be created here.
    // This smoke-check just confirms the error type remains exported.
    expect(DuplicateWorkflowNameError).toBeDefined();
  });
});
