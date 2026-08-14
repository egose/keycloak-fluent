import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import { DuplicateWorkflowNameError, WorkflowNotFoundError, type WorkflowListOptions } from '../src/workflow';

describe('Implementation Consistency: Workflow Lookup and Pagination', () => {
  describe('WorkflowHandle.getById', () => {
    test('uses server-side findOne(id) and terminates as soon as the unique match is known', async () => {
      const findOne = vi.fn().mockResolvedValueOnce({ id: 'wf-1', name: 'approval', enabled: true });
      const find = vi.fn();
      const core = { workflows: { findOne, find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.getById('wf-1')).resolves.toEqual({
        id: 'wf-1',
        name: 'approval',
        enabled: true,
      });

      expect(core.workflows.findOne).toHaveBeenCalledTimes(1);
      expect(core.workflows.findOne).toHaveBeenCalledWith({ id: 'wf-1', realm: 'demo', includeId: true });
      expect(core.workflows.find).not.toHaveBeenCalled();
    });

    test('returns null when the id is not found (catchNotFound -> undefined)', async () => {
      const findOne = vi.fn().mockResolvedValueOnce(undefined);
      const find = vi.fn();
      const core = { workflows: { findOne, find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.getById('missing-id')).resolves.toBeNull();

      expect(core.workflows.findOne).toHaveBeenCalledWith({ id: 'missing-id', realm: 'demo', includeId: true });
      expect(core.workflows.find).not.toHaveBeenCalled();
    });

    test('coerces the Keycloak 26.6.x "Not a valid workflow resource" 400 to null (no 404 on this endpoint)', async () => {
      // Keycloak 26.6.x returns HTTP 400 { error: 'Not a valid workflow resource: <id>' }
      // for any unknown workflow id (the OpenAPI route defines only 200/400, no
      // 404), so `findOne(catchNotFound: true)` (which only catches 404) would
      // throw. `getById` must coerce that specific 400 to `null` to keep its
      // not-found contract. A regression that rethrows this 400 would surface
      // here as a rejection.
      const networkError = Object.assign(new Error('Request failed with status code 400'), {
        response: { status: 400 },
        responseData: { error: 'Not a valid workflow resource: 00000000-0000-0000-0000-000000000000' },
      });
      const findOne = vi.fn().mockRejectedValueOnce(networkError);
      const find = vi.fn();
      const core = { workflows: { findOne, find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.getById('00000000-0000-0000-0000-000000000000')).resolves.toBeNull();

      expect(core.workflows.findOne).toHaveBeenCalledTimes(1);
      expect(core.workflows.findOne).toHaveBeenCalledWith({
        id: '00000000-0000-0000-0000-000000000000',
        realm: 'demo',
        includeId: true,
      });
      expect(core.workflows.find).not.toHaveBeenCalled();
    });

    test('rethrows an unrelated 400 (not the workflow-resource not-found signal) instead of coercing to null', async () => {
      // A 400 that is NOT the "Not a valid workflow resource" not-found signal
      // must not be masked as `null`; only the specific not-found 400 is
      // coerced, so genuine validation errors still surface to callers.
      const networkError = Object.assign(new Error('Request failed with status code 400'), {
        response: { status: 400 },
        responseData: { error: 'Some other validation failure' },
      });
      const findOne = vi.fn().mockRejectedValueOnce(networkError);
      const core = { workflows: { findOne } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      // The original transport error is rethrown unchanged (not coerced to
      // null and not rewrapped), preserving its status and response data so
      // callers can branch on the genuine validation failure.
      await expect(handle.getById('wf-1')).rejects.toBe(networkError);
      expect(core.workflows.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('WorkflowHandle.get (lookup by name)', () => {
    test('forwards search + exact:true to the server, never fetching the full list', async () => {
      const find = vi.fn().mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }]);
      const findOne = vi.fn();
      const core = { workflows: { find, findOne } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.get()).resolves.toEqual({
        id: 'wf-1',
        name: 'approval',
        enabled: true,
      });

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'approval',
        exact: true,
      });
      expect(core.workflows.findOne).not.toHaveBeenCalled();
    });

    test('returns null when no workflow matches the name exactly', async () => {
      const find = vi.fn().mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('does-not-exist');
      await expect(handle.get()).resolves.toBeNull();

      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'does-not-exist',
        exact: true,
      });
    });

    test('throws DuplicateWorkflowNameError when the exact name matches more than one workflow', async () => {
      const find = vi.fn().mockResolvedValue([
        { id: 'wf-1', name: 'approval', enabled: true },
        { id: 'wf-2', name: 'approval', enabled: false },
      ]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      const firstAttempt = handle.get();
      await expect(firstAttempt).rejects.toBeInstanceOf(DuplicateWorkflowNameError);
      await expect(firstAttempt).rejects.toMatchObject({
        realmName: 'demo',
        workflowName: 'approval',
        matchCount: 2,
      });

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'approval',
        exact: true,
      });
    });

    test('reuses the cached representation on a second get() call without re-fetching', async () => {
      const find = vi.fn().mockResolvedValueOnce([{ id: 'wf-1', name: 'approval', enabled: true }]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.get()).resolves.toEqual({ id: 'wf-1', name: 'approval', enabled: true });
      const second = await handle.get();
      expect(second).toEqual({ id: 'wf-1', name: 'approval', enabled: true });

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('WorkflowHandle.requireWorkflow', () => {
    test('throws WorkflowNotFoundError (not a generic Error) when the workflow is missing', async () => {
      const find = vi.fn().mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');

      await expect(handle.delete()).rejects.toBeInstanceOf(WorkflowNotFoundError);
      await expect(handle.delete()).rejects.toMatchObject({
        workflowName: 'approval',
        realmName: 'demo',
      });

      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'approval',
        exact: true,
      });
    });
  });

  describe('WorkflowHandle.list (server-side pagination)', () => {
    test('forwards page/pageSize to first/max and only requests one page', async () => {
      const find = vi.fn().mockResolvedValueOnce([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.list({ page: 1, pageSize: 10 })).resolves.toEqual([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
      expect(core.workflows.find).toHaveBeenCalledWith({ realm: 'demo', first: 0, max: 10 });
    });

    test('forwards first/max directly when only those are supplied', async () => {
      const find = vi.fn().mockResolvedValueOnce([{ id: 'wf-2', name: 'auto-approval' }]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      const opts: WorkflowListOptions = { first: 50, max: 25 };
      await expect(handle.list(opts)).resolves.toEqual([{ id: 'wf-2', name: 'auto-approval' }]);

      expect(core.workflows.find).toHaveBeenCalledWith({ realm: 'demo', first: 50, max: 25 });
    });

    test('uses page=1 / pageSize=100 by default (no full collection load)', async () => {
      const find = vi.fn().mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.list()).resolves.toEqual([]);

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
      expect(core.workflows.find).toHaveBeenCalledWith({ realm: 'demo', first: 0, max: 100 });
    });

    test('does not slice the result; returns the page the server produced', async () => {
      const find = vi.fn().mockResolvedValueOnce([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
        { id: 'wf-3', name: 'review' },
      ]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      const opts: WorkflowListOptions = { page: 2, pageSize: 1 };
      await expect(handle.list(opts)).resolves.toEqual([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
        { id: 'wf-3', name: 'review' },
      ]);

      expect(core.workflows.find).toHaveBeenCalledWith({ realm: 'demo', first: 1, max: 1 });
    });
  });

  describe('WorkflowHandle.listAll (full-collection iteration via fetchAll)', () => {
    test('pages until a short page is returned; advances by returned rows (not requested max)', async () => {
      const find = vi
        .fn()
        .mockResolvedValueOnce([
          { id: 'wf-1', name: 'approval' },
          { id: 'wf-2', name: 'auto-approval' },
        ])
        .mockResolvedValueOnce([{ id: 'wf-3', name: 'review' }]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.listAll({ pageSize: 2 })).resolves.toEqual([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
        { id: 'wf-3', name: 'review' },
      ]);

      expect(core.workflows.find).toHaveBeenCalledTimes(2);
      expect(core.workflows.find).toHaveBeenNthCalledWith(1, { realm: 'demo', first: 0, max: 2 });
      expect(core.workflows.find).toHaveBeenNthCalledWith(2, { realm: 'demo', first: 2, max: 2 });
    });

    test('continues when the page is an exact multiple of pageSize (terminates at empty page)', async () => {
      const find = vi
        .fn()
        .mockResolvedValueOnce([
          { id: 'wf-1', name: 'approval' },
          { id: 'wf-2', name: 'auto-approval' },
        ])
        .mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.listAll({ pageSize: 2 })).resolves.toEqual([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);

      expect(core.workflows.find).toHaveBeenCalledTimes(2);
    });

    test('aborts with RangeError when maxPages is exceeded', async () => {
      const find = vi.fn().mockResolvedValue([{ id: 'wf-1', name: 'approval' }]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.listAll({ pageSize: 1, maxPages: 3 })).rejects.toBeInstanceOf(RangeError);

      expect(core.workflows.find).toHaveBeenCalledTimes(3);
    });

    test('validates pageSize/first/maxPages before the first fetch', async () => {
      const find = vi.fn();
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.listAll({ pageSize: 0 } as any)).rejects.toBeInstanceOf(RangeError);
      await expect(handle.listAll({ first: -1 } as any)).rejects.toBeInstanceOf(RangeError);
      await expect(handle.listAll({ maxPages: 0 } as any)).rejects.toBeInstanceOf(RangeError);

      expect(core.workflows.find).not.toHaveBeenCalled();
    });

    test('passes AbortSignal through fetchAll', async () => {
      const find = vi.fn().mockResolvedValue([{ id: 'wf-1', name: 'approval' }]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      const controller = new AbortController();
      controller.abort(new Error('cancelled before start'));
      await expect(handle.listAll({ pageSize: 10, signal: controller.signal })).rejects.toThrow();
    });

    test('terminates after a short first page when the server caps below requested pageSize', async () => {
      const find = vi.fn().mockResolvedValueOnce([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      await expect(handle.listAll({ pageSize: 100 })).resolves.toEqual([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
      expect(core.workflows.find).toHaveBeenCalledWith({ realm: 'demo', first: 0, max: 100 });
    });
  });

  describe('WorkflowHandle.listAllStream', () => {
    test('yields one page at a time and stops at the terminator', async () => {
      const find = vi
        .fn()
        .mockResolvedValueOnce([{ id: 'wf-1', name: 'approval' }])
        .mockResolvedValueOnce([{ id: 'wf-2', name: 'auto-approval' }])
        .mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      const pages: any[] = [];
      for await (const page of handle.listAllStream({ pageSize: 1 })) {
        pages.push(page);
      }

      expect(pages).toEqual([[{ id: 'wf-1', name: 'approval' }], [{ id: 'wf-2', name: 'auto-approval' }], []]);
      expect(core.workflows.find).toHaveBeenCalledTimes(3);
    });

    test('aborts with RangeError when maxPages is exceeded', async () => {
      let counter = 0;
      const find = vi.fn().mockImplementation(() => {
        counter += 1;
        return Promise.resolve([{ id: `wf-${counter}`, name: `w${counter}` }]);
      });
      const core = { workflows: { find } } as any;

      const handle = new RealmHandle(core, 'demo').workflow('approval');
      const iterator = handle.listAllStream({ pageSize: 1, maxPages: 2 });
      const tracedError: unknown = await (async () => {
        try {
          for await (const _page of iterator) {
            void _page;
          }
          return undefined;
        } catch (error) {
          return error;
        }
      })();
      expect(tracedError).toBeInstanceOf(RangeError);
      expect(core.workflows.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('realm.searchWorkflows (server-side search)', () => {
    test('forwards search/exact:false/first/max and does not fetch the full collection', async () => {
      const find = vi.fn().mockResolvedValueOnce([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);
      const core = { workflows: { find } } as any;

      const realmHandle = new RealmHandle(core, 'demo');
      await expect(realmHandle.searchWorkflows('appr', { page: 2, pageSize: 25 })).resolves.toEqual([
        { id: 'wf-1', name: 'approval' },
        { id: 'wf-2', name: 'auto-approval' },
      ]);

      expect(core.workflows.find).toHaveBeenCalledTimes(1);
      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'appr',
        exact: false,
        first: 25,
        max: 25,
      });
    });

    test('forwards first/max directly when supplied', async () => {
      const find = vi.fn().mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const realmHandle = new RealmHandle(core, 'demo');
      await realmHandle.searchWorkflows('foo', { first: 40, max: 20 });

      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'foo',
        exact: false,
        first: 40,
        max: 20,
      });
    });

    test('defaults to page=1 / pageSize=100', async () => {
      const find = vi.fn().mockResolvedValueOnce([]);
      const core = { workflows: { find } } as any;

      const realmHandle = new RealmHandle(core, 'demo');
      await realmHandle.searchWorkflows('appr');

      expect(core.workflows.find).toHaveBeenCalledWith({
        realm: 'demo',
        search: 'appr',
        exact: false,
        first: 0,
        max: 100,
      });
    });
  });
});
