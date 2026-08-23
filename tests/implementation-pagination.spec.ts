import { describe, expect, test, vi } from 'vitest';
import { fetchAll, fetchAllStream } from '../src/utils/fetch-all';
import { toSinglePageQuery } from '../src/utils/single-page-query';
import RealmHandle from '../src/realm';

function pageFetcher<T>(pages: T[][]) {
  const calls: Array<{ first: number; max: number }> = [];
  let index = 0;
  const fn = vi.fn(async (first: number, max: number) => {
    calls.push({ first, max });
    const page = pages[index] ?? [];
    index += 1;
    return page;
  });
  return { fn, calls };
}

describe('Implementation Pagination: single-page queries', () => {
  test('converts valid page and offset styles without changing request shapes', () => {
    expect(toSinglePageQuery()).toEqual({ first: 0, max: 100 });
    expect(toSinglePageQuery({ page: 3, pageSize: 25 })).toEqual({ first: 50, max: 25 });
    expect(toSinglePageQuery({ first: 50, max: 25 })).toEqual({ first: 50, max: 25 });
    expect(toSinglePageQuery({ page: 2 })).toEqual({ first: 100, max: 100 });
    expect(toSinglePageQuery({ pageSize: 25 })).toEqual({ first: 0, max: 25 });
    expect(toSinglePageQuery({ first: 50 })).toEqual({ first: 50, max: 100 });
    expect(toSinglePageQuery({ max: 25 })).toEqual({ first: 0, max: 25 });
  });

  test.each([
    ['zero page', { page: 0 }],
    ['negative page', { page: -1 }],
    ['fractional page', { page: 1.5 }],
    ['NaN page', { page: Number.NaN }],
    ['infinite page', { page: Number.POSITIVE_INFINITY }],
    ['zero pageSize', { pageSize: 0 }],
    ['negative first', { first: -1 }],
    ['zero max', { max: 0 }],
    ['fractional first', { first: 1.5 }],
    ['infinite max', { max: Number.POSITIVE_INFINITY }],
    ['overflowed page offset', { page: Number.MAX_SAFE_INTEGER, pageSize: 2 }],
    ['overflowed first/max range', { first: Number.MAX_SAFE_INTEGER, max: 2 }],
    ['conflicting styles', { page: 1, first: 0 }],
    ['conflicting partial styles', { pageSize: 25, max: 25 }],
  ])('rejects invalid %s before conversion', async (_name, options) => {
    expect(() => toSinglePageQuery(options)).toThrow(RangeError);
  });

  test('invalid realm-level single-page options make zero admin-client calls', async () => {
    const core = {
      clients: { find: vi.fn().mockResolvedValue([]) },
      realms: { findEvents: vi.fn().mockResolvedValue([]) },
      workflows: { find: vi.fn().mockResolvedValue([]) },
    } as any;
    const realmHandle = new RealmHandle(core, 'demo');

    await expect(realmHandle.searchClients('client', { page: 0 })).rejects.toThrow(RangeError);
    await expect(realmHandle.findEvents({ pageSize: 0 })).rejects.toThrow(RangeError);
    await expect(realmHandle.workflow('approval').list({ page: 1, first: 0 })).rejects.toThrow(RangeError);

    expect(core.clients.find).not.toHaveBeenCalled();
    expect(core.realms.findEvents).not.toHaveBeenCalled();
    expect(core.workflows.find).not.toHaveBeenCalled();
  });

  test('invalid child-handle single-page options make zero admin-client calls before resolution', async () => {
    const core = {
      clients: {
        find: vi.fn().mockResolvedValue([{ id: 'client-1', clientId: 'app-client' }]),
        listSessions: vi.fn().mockResolvedValue([]),
        findRole: vi.fn().mockResolvedValue({ id: 'role-1', name: 'client-role' }),
      },
      organizations: {
        find: vi.fn().mockResolvedValue([{ id: 'org-1', alias: 'engineering' }]),
        listMembers: vi.fn().mockResolvedValue([]),
      },
      roles: {
        findOneByName: vi.fn().mockResolvedValue({ id: 'role-1', name: 'realm-role' }),
        getCompositeRoles: vi.fn().mockResolvedValue([]),
      },
    } as any;
    const realmHandle = new RealmHandle(core, 'demo');

    await expect(realmHandle.client('app-client').listSessions({ page: -1 })).rejects.toThrow(RangeError);
    await expect(realmHandle.organization('engineering').listMembers({ max: 0 })).rejects.toThrow(RangeError);
    await expect(realmHandle.role('realm-role').listComposites({ page: 1.5 })).rejects.toThrow(RangeError);
    await expect(realmHandle.client('app-client').role('client-role').listComposites({ first: -1 })).rejects.toThrow(
      RangeError,
    );

    expect(core.clients.find).not.toHaveBeenCalled();
    expect(core.clients.listSessions).not.toHaveBeenCalled();
    expect(core.clients.findRole).not.toHaveBeenCalled();
    expect(core.organizations.find).not.toHaveBeenCalled();
    expect(core.organizations.listMembers).not.toHaveBeenCalled();
    expect(core.roles.findOneByName).not.toHaveBeenCalled();
    expect(core.roles.getCompositeRoles).not.toHaveBeenCalled();
  });
});

describe('Implementation Pagination: fetchAll', () => {
  test('continues after 50 returned rows when max is 100 and more rows exist', async () => {
    const requested = 100;
    const { fn, calls } = pageFetcher([
      Array.from({ length: 50 }, (_, i) => `row-${i}`),
      Array.from({ length: 50 }, (_, i) => `row-${50 + i}`),
      [],
    ]);

    const result = await fetchAll(fn, { pageSize: requested });

    expect(result).toHaveLength(100);
    expect(calls).toEqual([
      { first: 0, max: 100 },
      { first: 50, max: 100 },
      { first: 100, max: 100 },
    ]);
  });

  test('advances by returned rows so server-capped pages do not skip data', async () => {
    const allRows = Array.from({ length: 125 }, (_, i) => `row-${i}`);
    const calls: Array<{ first: number; max: number }> = [];
    const fn = vi.fn(async (first: number, max: number) => {
      calls.push({ first, max });
      return allRows.slice(first, first + 50);
    });

    const result = await fetchAll(fn, { pageSize: 100, maxPages: 10 });

    expect(result).toEqual(allRows);
    expect(calls).toEqual([
      { first: 0, max: 100 },
      { first: 50, max: 100 },
      { first: 100, max: 100 },
      { first: 125, max: 100 },
    ]);
  });

  test('handles exact page-size multiple by stopping on the subsequent empty page', async () => {
    const pages = [Array.from({ length: 5 }, (_, i) => `row-0-${i}`), []];
    const { fn, calls } = pageFetcher(pages);

    const result = await fetchAll(fn, { pageSize: 5 });

    expect(result).toHaveLength(5);
    expect(calls).toEqual([
      { first: 0, max: 5 },
      { first: 5, max: 5 },
    ]);
  });

  test('accepts a non-zero starting offset', async () => {
    const pages = [Array.from({ length: 2 }, (_, i) => `row-${20 + i}`)];
    const { fn, calls } = pageFetcher(pages);

    const result = await fetchAll(fn, { pageSize: 10, first: 20 });

    expect(result).toEqual(['row-20', 'row-21']);
    expect(calls).toEqual([
      { first: 20, max: 10 },
      { first: 22, max: 10 },
    ]);
  });

  test('stops on an empty first page', async () => {
    const { fn, calls } = pageFetcher([[]]);

    const result = await fetchAll(fn, { pageSize: 10 });

    expect(result).toEqual([]);
    expect(calls).toEqual([{ first: 0, max: 10 }]);
  });

  test('treats a null page as empty', async () => {
    const fn = vi.fn(async () => null as unknown as string[]);
    const result = await fetchAll(fn, { pageSize: 10 });
    expect(result).toEqual([]);
  });

  test('does not silently truncate when a full page is followed by more rows than fit another page', async () => {
    // Without an explicit total/done signal, a short page is not authoritative;
    // iteration ends only after the subsequent empty page.
    const pages = [
      Array.from({ length: 5 }, (_, i) => `row-${i}`), // full page relative to requested 5
      Array.from({ length: 5 }, (_, i) => `row-${5 + i}`), // full page again
      Array.from({ length: 3 }, (_, i) => `row-${10 + i}`), // short non-terminal page
    ];
    const { fn, calls } = pageFetcher(pages);

    await expect(fetchAll(fn, { pageSize: 5, maxPages: 100 })).resolves.toHaveLength(13);

    expect(calls).toEqual([
      { first: 0, max: 5 },
      { first: 5, max: 5 },
      { first: 10, max: 5 },
      { first: 13, max: 5 },
    ]);
  });

  test('repeated-page protection: fetchAll throws when the same content is returned twice', async () => {
    const repeated = Array.from({ length: 50 }, (_, i) => `row-${i}`);
    const fn = vi.fn(async () => [...repeated]);

    await expect(fetchAll(fn, { pageSize: 100, maxPages: 10 })).rejects.toThrow(/same non-empty page/);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('repeated-page protection: stream throws when the same array object is returned twice', async () => {
    const repeated = Array.from({ length: 5 }, (_, i) => `row-${i}`);
    const fn = vi.fn(async (first: number, max: number) => {
      void first;
      void max;
      return repeated;
    });

    const pages: string[][] = [];
    await expect(async () => {
      for await (const page of fetchAllStream(fn, { pageSize: 5, maxPages: 100 })) {
        pages.push(page);
      }
    }).rejects.toThrow(/same non-empty page/);

    expect(pages).toHaveLength(1);
    expect(pages[0]).toBe(repeated);
  });

  test('maxPages guard prevents infinite loops when the endpoint ignores first', async () => {
    let counter = 0;
    const fn = vi.fn(async () => {
      counter += 1;
      return Array.from({ length: 10 }, (_, i) => `row-${counter}-${i}`);
    });

    await expect(fetchAll(fn, { pageSize: 10, maxPages: 3 })).rejects.toThrow(/maxPages \(3\)/);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('stream maxPages guard forwards the bounded-page error', async () => {
    let counter = 0;
    const fn = vi.fn(async () => {
      counter += 1;
      return Array.from({ length: 5 }, (_, i) => `row-${counter}-${i}`);
    });

    const iterator = fetchAllStream(fn, { pageSize: 5, maxPages: 2 });
    await iterator.next(); // page 0
    await iterator.next(); // page 1

    await expect(iterator.next()).rejects.toThrow(/maxPages \(2\)/);
  });

  test('maxItems bounds buffered results', async () => {
    const { fn } = pageFetcher([
      Array.from({ length: 3 }, (_, i) => `row-${i}`),
      Array.from({ length: 3 }, (_, i) => `row-${3 + i}`),
    ]);

    await expect(fetchAll(fn, { pageSize: 10, maxItems: 5 })).rejects.toThrow(/maxItems \(5\)/);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('maxItems bounds streaming results', async () => {
    const { fn } = pageFetcher([
      Array.from({ length: 3 }, (_, i) => `row-${i}`),
      Array.from({ length: 3 }, (_, i) => `row-${3 + i}`),
    ]);
    const pages: string[][] = [];
    const iterator = fetchAllStream(fn, { pageSize: 10, maxItems: 5 });

    pages.push((await iterator.next()).value);
    await expect(iterator.next()).rejects.toThrow(/maxItems \(5\)/);
    expect(pages).toHaveLength(1);
  });

  test('stream short-circuits on an explicit done page from the fetcher', async () => {
    const firstPage = ['a', 'b'];
    let callIndex = 0;
    const fn = vi.fn(async () => {
      callIndex += 1;
      if (callIndex === 1) {
        return { rows: firstPage, done: true };
      }
      return ['unreachable'];
    });

    const pages: string[][] = [];
    for await (const page of fetchAllStream(fn, { pageSize: 10, maxPages: 100 })) {
      pages.push(page);
    }

    expect(pages).toEqual([firstPage]);
  });

  test('stream terminates on an empty page without yielding it', async () => {
    const { fn } = pageFetcher([['row-0'], []]);
    const pages: string[][] = [];

    for await (const page of fetchAllStream(fn, { pageSize: 10, maxPages: 100 })) {
      pages.push(page);
    }

    expect(pages).toEqual([['row-0']]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('cancellation via AbortSignal aborts the loop', async () => {
    const firstPage = Array.from({ length: 10 }, (_, i) => `row-${i}`);
    const secondPage = Array.from({ length: 10 }, (_, i) => `row-${10 + i}`);
    const controller = new AbortController();
    const fn = vi.fn(async (first: number, max: number) => {
      if (first === 0) return firstPage;
      controller.abort();
      return secondPage;
    });

    await expect(fetchAll(fn, { pageSize: 10, signal: controller.signal })).rejects.toBeDefined();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('stream cancellation via AbortSignal aborts before yielding an aborted page', async () => {
    const controller = new AbortController();
    const fn = vi.fn(async (first: number) => {
      if (first === 0) return ['row-0'];
      controller.abort(new Error('cancelled'));
      return ['row-1'];
    });
    const pages: string[][] = [];

    await expect(async () => {
      for await (const page of fetchAllStream(fn, { pageSize: 1, signal: controller.signal })) {
        pages.push(page);
      }
    }).rejects.toThrow('cancelled');
    expect(pages).toEqual([['row-0']]);
  });

  test('fetcher arguments validate as finite integers', async () => {
    const fn = vi.fn(async () => []);

    await expect(fetchAll(fn, { pageSize: 0 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { pageSize: 1.5 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { pageSize: Number.NaN } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { first: -1 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { first: 1.5 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { maxPages: 0 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { maxPages: 1.5 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { maxItems: -1 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { maxItems: 1.5 } as never)).rejects.toThrow(RangeError);
    expect(fn).not.toHaveBeenCalled();
  });

  test('abort signal already aborted before the first call throws synchronously', async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn(async () => []);

    await expect(fetchAll(fn, { pageSize: 10, signal: controller.signal })).rejects.toBeDefined();
    expect(fn).not.toHaveBeenCalled();
  });

  test('preserves the existing single-fetcher array contract (no options works as before)', async () => {
    const { fn, calls } = pageFetcher([Array.from({ length: 50 }, (_, i) => `row-${i}`)]);

    await expect(fetchAll(fn)).resolves.toHaveLength(50);
    expect(calls).toEqual([
      { first: 0, max: 100 },
      { first: 50, max: 100 },
    ]);
  });
});
