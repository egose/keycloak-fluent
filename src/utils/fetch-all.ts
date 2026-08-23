/**
 * Bounded pagination utilities for Keycloak admin "list-all" queries.
 *
 * Keycloak admin endpoints accept `first` (offset) and `max` (page size) but
 * do not return a total count, so callers must infer completion from the
 * returned page shape. This module centralizes that inference with explicit
 * validation and safety bounds:
 *
 * - Offsets and page sizes are validated as finite integers (>= 0 / >= 1).
 * - Iteration advances by the *endpoint's actual* contract: the next offset
 *   is `previous offset + returned page length`, never `previous offset +
 *   requested max`. A server-side cap below the requested page size therefore
 *   keeps paging without silently truncating or skipping results.
 * - An endpoint that ignores `first` and repeatedly returns a page cannot loop
 *   forever: per-call `maxPages`/`maxItems` guards cap iteration, and a
 *   repeated page heuristic aborts when the same non-empty page is observed
 *   twice in a row.
 * - `AbortSignal` support lets streaming consumers cancel mid-collection.
 *
 * The array-returning {@link fetchAll} preserves the existing `*All()` array
 * contracts. The async iterator {@link fetchAllStream} offers lazy streaming
 * for potentially large collections without buffering everything in memory.
 */

const defaultPageSize = 100;
const defaultMaxPages = 1000;
const defaultMaxItems = 100000;

export type FetchAllOptions = {
  /** Requested page size. Must be a finite integer >= 1. Defaults to 100. */
  pageSize?: number;
  /**
   * Starting offset passed to the endpoint. Must be a finite integer >= 0.
   * Defaults to 0.
   */
  first?: number;
  /**
   * Upper bound on the number of pages fetched before the loop aborts with a
   * `RangeError`. Must be a finite integer >= 1. Defaults to 1000. This guard
   * prevents infinite loops when an endpoint ignores `first` and repeatedly
   * returns a full page.
   */
  maxPages?: number;
  /**
   * Upper bound on buffered or yielded rows before the loop aborts with a
   * `RangeError`. Must be a finite integer >= 0. Defaults to 100000.
   */
  maxItems?: number;
  /**
   * When provided, iteration aborts as soon as the signal is aborted. The
   * rethrown `AbortError` carries the abort reason on `cause`.
   */
  signal?: AbortSignal;
};

function getAbortError(signal: AbortSignal): unknown {
  const reason = signal.reason;
  return reason instanceof Error ? reason : new Error('fetchAll aborted', { cause: { aborted: true, reason } });
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw getAbortError(signal);
  }
}

function validateBounds(first: number, pageSize: number, maxPages: number, maxItems: number): void {
  if (!Number.isInteger(first) || first < 0) {
    throw new RangeError(`FetchAllOptions.first must be a finite integer >= 0 (received ${String(first)})`);
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`FetchAllOptions.pageSize must be a finite integer >= 1 (received ${String(pageSize)})`);
  }

  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new RangeError(`FetchAllOptions.maxPages must be a finite integer >= 1 (received ${String(maxPages)})`);
  }

  if (!Number.isInteger(maxItems) || maxItems < 0) {
    throw new RangeError(`FetchAllOptions.maxItems must be a finite integer >= 0 (received ${String(maxItems)})`);
  }
}

function getRepeatedPageError(kind: 'fetchAll' | 'fetchAllStream'): RangeError {
  return new RangeError(
    `${kind} received the same non-empty page twice in a row; the endpoint may be ignoring the "first" offset`,
  );
}

function getMaxItemsError(kind: 'fetchAll' | 'fetchAllStream', maxItems: number): RangeError {
  return new RangeError(
    `${kind} exceeded maxItems (${maxItems}) before reaching an empty page or explicit completion signal`,
  );
}

function getPageSignature<T>(rows: T[]): string | undefined {
  try {
    return JSON.stringify(rows);
  } catch {
    return undefined;
  }
}

function isRepeatedPage<T>(rows: T[], previousRows: T[] | null, previousSignature: string | undefined): boolean {
  if (!previousRows || rows.length === 0) {
    return false;
  }

  if (previousRows === rows) {
    return true;
  }

  const signature = getPageSignature(rows);
  return signature !== undefined && signature === previousSignature;
}

/**
 * Pages through `fetcher(first, max)` until completion, returning all rows in a
 * single array. Iteration advances by the number of rows actually returned
 * (not by the requested `max`), so server-side caps that shorten pages do not
 * truncate or skip rows.
 */
export async function fetchAll<T>(
  fetcher: (first: number, max: number) => Promise<FetchPageResult<T>>,
  options: FetchAllOptions = {},
): Promise<T[]> {
  const pageSize = options.pageSize ?? defaultPageSize;
  const first = options.first ?? 0;
  const maxPages = options.maxPages ?? defaultMaxPages;
  const maxItems = options.maxItems ?? defaultMaxItems;
  const { signal } = options;

  validateBounds(first, pageSize, maxPages, maxItems);
  throwIfAborted(signal);

  const all: T[] = [];
  let offset = first;
  let previousRows: T[] | null = null;
  let previousSignature: string | undefined;

  if (maxItems === 0) {
    return all;
  }

  for (let page = 0; page < maxPages; page++) {
    throwIfAborted(signal);
    const { rows, done } = toRows(await fetcher(offset, pageSize));
    throwIfAborted(signal);

    if (!rows || rows.length === 0) {
      return all;
    }

    if (isRepeatedPage(rows, previousRows, previousSignature)) {
      throw getRepeatedPageError('fetchAll');
    }

    if (all.length + rows.length > maxItems) {
      throw getMaxItemsError('fetchAll', maxItems);
    }

    all.push(...rows);

    if (done || all.length === maxItems) {
      return all;
    }

    previousRows = rows;
    previousSignature = getPageSignature(rows);
    offset += rows.length;
  }

  throw new RangeError(
    `fetchAll exceeded maxPages (${maxPages}) without reaching an empty page or explicit completion signal; the endpoint may be ignoring the "first" offset or repeatedly returning pages`,
  );
}

/**
 * `fetcher` shape for the streaming iterator. Returns rows for a single page
 * and optionally a hint that this is the final page; an explicit `done: true`
 * short-circuits the loop before the `maxPages`/empty-page guards run.
 */
export type FetchPageResult<T> = T[] | { rows: T[]; done?: boolean } | null | undefined;

function toRows<T>(result: FetchPageResult<T>): { rows: T[]; done: boolean } {
  if (!result) {
    return { rows: [], done: false };
  }

  if (Array.isArray(result)) {
    return { rows: result, done: false };
  }

  return { rows: result.rows ?? [], done: Boolean(result.done) };
}

/**
 * Async iterator that yields one page at a time from `fetcher(first, max)`.
 *
 * The same validation, advancing, and bounded-loop guarantees as
 * {@link fetchAll} apply, plus repeated-page protection: if the endpoint
 * returns the same non-empty page twice in a row, iteration throws to avoid
 * silently returning partial results where `first` is ignored.
 *
 * In addition to the `maxPages`/`maxItems` bounds, callers may short-circuit a
 * page by having `fetcher` return `{ rows, done: true }`.
 */
export async function* fetchAllStream<T>(
  fetcher: (first: number, max: number) => Promise<FetchPageResult<T>>,
  options: FetchAllOptions = {},
): AsyncIterableIterator<T[]> {
  const pageSize = options.pageSize ?? defaultPageSize;
  const first = options.first ?? 0;
  const maxPages = options.maxPages ?? defaultMaxPages;
  const maxItems = options.maxItems ?? defaultMaxItems;
  const { signal } = options;

  validateBounds(first, pageSize, maxPages, maxItems);
  throwIfAborted(signal);

  let offset = first;
  let previousPage: T[] | null = null;
  let previousSignature: string | undefined;
  let yieldedItems = 0;

  if (maxItems === 0) {
    return;
  }

  for (let page = 0; page < maxPages; page++) {
    throwIfAborted(signal);
    const { rows, done } = toRows(await fetcher(offset, pageSize));
    throwIfAborted(signal);

    if (!rows || rows.length === 0) {
      return;
    }

    if (isRepeatedPage(rows, previousPage, previousSignature)) {
      throw getRepeatedPageError('fetchAllStream');
    }

    if (yieldedItems + rows.length > maxItems) {
      throw getMaxItemsError('fetchAllStream', maxItems);
    }

    yield rows;
    yieldedItems += rows.length;

    if (done || yieldedItems === maxItems) {
      return;
    }

    previousPage = rows;
    previousSignature = getPageSignature(rows);
    offset += rows.length;
  }

  throw new RangeError(
    `fetchAllStream exceeded maxPages (${maxPages}) without reaching an empty page or explicit completion signal; the endpoint may be ignoring the "first" offset or repeatedly returning pages`,
  );
}
