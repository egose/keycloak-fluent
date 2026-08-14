import { describe, expect, test, vi } from 'vitest';
import { fetchAll, fetchAllStream } from '../src/utils/fetch-all';

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

describe('Implementation Pagination: fetchAll', () => {
  test('advances by returned length and a short server page terminates the loop (Keycloak contract)', async () => {
    const requested = 100;
    // Server caps each page at 30 even though we asked for 100. Under the
    // Keycloak admin contract, a page shorter than `max` is the last page, so
    // a single 30-row page ends iteration after one fetch.
    const { fn, calls } = pageFetcher([Array.from({ length: 30 }, (_, i) => `row-${i}`)]);

    const result = await fetchAll(fn, { pageSize: requested });

    expect(result).toHaveLength(30);
    expect(calls).toEqual([{ first: 0, max: 100 }]);
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
    expect(calls).toEqual([{ first: 20, max: 10 }]);
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
    // The server honors the requested page size and returns full pages until
    // the final short page. The loop must keep fetching until the short
    // terminator arrives instead of stopping at the first full page.
    const pages = [
      Array.from({ length: 5 }, (_, i) => `row-${i}`), // full page relative to requested 5
      Array.from({ length: 5 }, (_, i) => `row-${5 + i}`), // full page again
      Array.from({ length: 3 }, (_, i) => `row-${10 + i}`), // short terminator
    ];
    const { fn, calls } = pageFetcher(pages);

    await expect(fetchAll(fn, { pageSize: 5, maxPages: 100 })).resolves.toHaveLength(13);

    expect(calls).toEqual([
      { first: 0, max: 5 },
      { first: 5, max: 5 },
      { first: 10, max: 5 },
    ]);
  });

  test('repeated-page protection: stream stops when the same array object is returned twice', async () => {
    const repeated = Array.from({ length: 5 }, (_, i) => `row-${i}`);
    let index = 0;
    const fn = vi.fn(async (first: number, max: number) => {
      // First page: fresh small array. Second page: return same array object again.
      index += 1;
      void first;
      void max;
      return repeated;
    });

    const pages: string[][] = [];
    for await (const page of fetchAllStream(fn, { pageSize: 5, maxPages: 100 })) {
      pages.push(page);
    }

    // Two iterations, then we observed the same array reference so we stopped.
    expect(pages).toHaveLength(2);
    expect(pages[0]).toBe(repeated);
    // Both yielded pages are the same reference, confirming the loop did not continue indefinitely.
    expect(pages[0]).toBe(pages[1]);
  });

  test('maxPages guard prevents infinite loops when the endpoint ignores first', async () => {
    const dupe = Array.from({ length: 10 }, (_, i) => `row-${i}`);
    const fn = vi.fn(async () => [...dupe]); // always full, always fresh array

    await expect(fetchAll(fn, { pageSize: 10, maxPages: 3 })).rejects.toThrow(/maxPages \(3\)/);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('stream maxPages guard forwards the bounded-page error', async () => {
    const fn = vi.fn(async () => Array.from({ length: 5 }, (_, i) => `row-${i}`)); // always full, fresh arrays

    const iterator = fetchAllStream(fn, { pageSize: 5, maxPages: 2 });
    await iterator.next(); // page 0
    await iterator.next(); // page 1

    await expect(iterator.next()).rejects.toThrow(/maxPages \(2\)/);
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

  test('fetcher arguments validate as finite integers', async () => {
    const fn = vi.fn(async () => []);

    await expect(fetchAll(fn, { pageSize: 0 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { pageSize: 1.5 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { pageSize: Number.NaN } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { first: -1 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { first: 1.5 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { maxPages: 0 } as never)).rejects.toThrow(RangeError);
    await expect(fetchAll(fn, { maxPages: 1.5 } as never)).rejects.toThrow(RangeError);
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
    expect(calls).toEqual([{ first: 0, max: 100 }]);
  });
});
