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
 *   terminates the loop rather than silently truncating or skipping results.
 * - An endpoint that ignores `first` and repeatedly returns a full page cannot
 *   loop forever: a per-call `maxPages` guard caps iteration, and a repeated
 *   page heuristic aborts when the same non-empty page is observed twice in a
 *   row (detected by reference identity of the returned array).
 * - `AbortSignal` support lets streaming consumers cancel mid-collection.
 *
 * The array-returning {@link fetchAll} preserves the existing `*All()` array
 * contracts. The async iterator {@link fetchAllStream} offers lazy streaming
 * for potentially large collections without buffering everything in memory.
 */

const defaultPageSize = 100;
const defaultMaxPages = 1000;

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

function validateBounds(first: number, pageSize: number, maxPages: number): void {
  if (!Number.isInteger(first) || first < 0) {
    throw new RangeError(`FetchAllOptions.first must be a finite integer >= 0 (received ${String(first)})`);
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`FetchAllOptions.pageSize must be a finite integer >= 1 (received ${String(pageSize)})`);
  }

  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new RangeError(`FetchAllOptions.maxPages must be a finite integer >= 1 (received ${String(maxPages)})`);
  }
}

/**
 * Pages through `fetcher(first, max)` until completion, returning all rows in a
 * single array. Iteration advances by the number of rows actually returned
 * (not by the requested `max`), so server-side caps that shorten pages
 * terminate the loop instead of truncating or skipping rows.
 */
export async function fetchAll<T>(
  fetcher: (first: number, max: number) => Promise<T[]>,
  options: FetchAllOptions = {},
): Promise<T[]> {
  const pageSize = options.pageSize ?? defaultPageSize;
  const first = options.first ?? 0;
  const maxPages = options.maxPages ?? defaultMaxPages;
  const { signal } = options;

  validateBounds(first, pageSize, maxPages);
  throwIfAborted(signal);

  const all: T[] = [];
  let offset = first;

  for (let page = 0; page < maxPages; page++) {
    throwIfAborted(signal);
    const rows = await fetcher(offset, pageSize);

    if (!rows || rows.length === 0) {
      return all;
    }

    all.push(...rows);
    offset += rows.length;

    if (rows.length < pageSize) {
      return all;
    }
  }

  throw new RangeError(
    `fetchAll exceeded maxPages (${maxPages}) without reaching an empty or short page; the endpoint may be ignoring the "first" offset or repeatedly returning a full page`,
  );
}

/**
 * `fetcher` shape for the streaming iterator. Returns rows for a single page
 * and optionally a hint that this is the final page; an explicit `done: true`
 * short-circuits the loop before the `maxPages`/empty-page guards run.
 */
export type FetchPageResult<T> = T[] | { rows: T[]; done?: boolean };

function toRows<T>(result: FetchPageResult<T>): { rows: T[]; done: boolean } {
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
 * returns the exact same non-empty array object twice in a row, iteration
 * stops to avoid an infinite loop where `first` is silently ignored.
 *
 * In addition to the `maxPages` bound, callers may short-circuit a page by
 * having `fetcher` return `{ rows, done: true }`.
 */
export async function* fetchAllStream<T>(
  fetcher: (first: number, max: number) => Promise<FetchPageResult<T>>,
  options: FetchAllOptions = {},
): AsyncIterableIterator<T[]> {
  const pageSize = options.pageSize ?? defaultPageSize;
  const first = options.first ?? 0;
  const maxPages = options.maxPages ?? defaultMaxPages;
  const { signal } = options;

  validateBounds(first, pageSize, maxPages);
  throwIfAborted(signal);

  let offset = first;
  let previousPage: T[] | null = null;

  for (let page = 0; page < maxPages; page++) {
    throwIfAborted(signal);
    const { rows, done } = toRows(await fetcher(offset, pageSize));

    yield rows;

    if (done || !rows || rows.length === 0) {
      return;
    }

    if (rows.length < pageSize) {
      return;
    }

    if (previousPage === rows) {
      return;
    }

    previousPage = rows;
    offset += rows.length;
  }

  throw new RangeError(
    `fetchAllStream exceeded maxPages (${maxPages}) without reaching an empty or short page; the endpoint may be ignoring the "first" offset or repeatedly returning a full page`,
  );
}
