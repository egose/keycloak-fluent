import { beforeEach, describe, expect, expectTypeOf, test, vi } from 'vitest';
import RealmHandle from '../src/realm';

/**
 * These tests exercise the CI-01 cleanup contract of `tests/test-utils.ts`:
 *   1. A failing test body's primary error stays the surfaced error, even if
 *      realm cleanup (`discard()`) also fails (the previous code masked the
 *      primary error by letting the `finally`-thrown cleanup error replace
 *      it).
 *   2. Realm deletion (`realms.del`) is skipped when realm creation never
 *      happened (`get()` returns null), so teardown is a no-op rather than a
 *      failure-producing round-trip.
 *   3. When only cleanup fails (no primary failure), a
 *      `TestRealmCleanupError` is surfaced carrying the cleanup error as
 *      `cause`.
 *
 * The live integration sandbox is not available here, so `KeycloakAdminClient`'s
 * network-dependent core is swapped for an in-memory `fakeCore` whose
 * `realms.findOne`/`create`/`del` mocks the realm existence and deletion calls
 * that `RealmHandle` would issue. `simpleAuth()` is mocked on the fake fluent
 * so the OAuth token call never runs. `RealmHandle` itself is NOT mocked, so the
 * real `get()`/`discard()` (the SK-01 cleanup boundary) is exercised end-to-end
 * against the fake core.
 */

const fakeCore = {
  realms: {
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    del: vi.fn(),
  },
};

vi.mock('../src/index', async () => {
  const { default: RealmHandle } = await import('../src/realm');
  class FakeKCACF {
    // `core` is a fake admin-client exposing only the `realms.*` surface needed
    // by `RealmHandle`. The `as any` mirrors the existing implementation-test
    // pattern (`new KeycloakAdminClientFluent() as any; fluent.core = {...}`)
    // so the strict `KeycloakAdminClient` structural signature does not have to
    // be mirrored in this isolated in-memory test rig.
    public core: typeof fakeCore;
    public realmName: string;
    public constructor(opts: { realmName: string }) {
      this.core = fakeCore;
      this.realmName = opts?.realmName ?? 'master';
    }
    public async simpleAuth() {
      // No-op: simulated sandbox auth; tests do not exercise the real OAuth path.
    }
    public realm(name: string) {
      // Cast through `unknown` so `RealmHandle`'s `KeycloakAdminClient`
      // parameter is satisfied without mirroring the full upstream type.
      return new RealmHandle(this.core as unknown as never, name);
    }
  }
  return { default: FakeKCACF };
});

const { withMasterRealm, withEnsuredMasterRealm } = await import('./test-utils');

/**
 * Default in-memory realm model: starts "not created", and `create`/`del`
 * toggle existence so that subsequent `findOne` calls return the right
 * representation. Tests can override `findOne` per-call to inject failures
 * AFTER re-establishing the default with {@link resetFakeCore}.
 */
function resetFakeCore() {
  fakeCore.realms.findOne.mockReset();
  fakeCore.realms.create.mockReset();
  fakeCore.realms.update.mockReset();
  fakeCore.realms.del.mockReset();

  let exists = false;
  fakeCore.realms.findOne.mockImplementation(async () => (exists ? { realm: 'r-created', id: 'r-1' } : null));
  const originalCreate = vi.fn(async () => {
    exists = true;
    return undefined;
  });
  fakeCore.realms.create.mockImplementation(originalCreate);
  fakeCore.realms.update.mockResolvedValue(undefined);
  fakeCore.realms.del.mockImplementation(async () => {
    exists = false;
    return undefined;
  });
}

beforeEach(() => {
  resetFakeCore();
});

describe('CI-01: test-utils realm cleanup preserves the primary test error', () => {
  test('withEnsuredMasterRealm surfaces the failing-test-body error when cleanup succeeds', async () => {
    const primaryTestError = new Error('integration assertion X failed');

    await expect(
      withEnsuredMasterRealm('cleanup-test', async () => {
        throw primaryTestError;
      }),
    ).rejects.toBe(primaryTestError);

    // The realm was created (findOne -> null -> create -> findOne returns the
    // new realm -> del invoked during teardown).
    expect(fakeCore.realms.create).toHaveBeenCalledTimes(1);
    expect(fakeCore.realms.del).toHaveBeenCalledTimes(1);
  });

  test('withEnsuredMasterRealm surfaces the primary error and attaches cleanup error as cause (does not mask)', async () => {
    const primaryTestError = new Error('integration assertion Y failed');
    const cleanupFailure = new Error('Keycloak admin HTTP 500 during discard');

    // Make the single `discard()` admin failure unit reject; otherwise the
    // state-model mocks stand (ensure creates the realm, the body throws, and
    // discard attempts to delete it).
    fakeCore.realms.del.mockRejectedValueOnce(cleanupFailure);

    let caught: unknown;
    try {
      await withEnsuredMasterRealm('cleanup-test-mask', async () => {
        // Simulate a test-body assertion failure AFTER ensure succeeded.
        throw primaryTestError;
      });
    } catch (error) {
      caught = error;
    }

    // The propagated error MUST be the primary test error, not the cleanup error.
    expect(caught).toBe(primaryTestError);

    // The cleanup error is recorded as the cause chain, not silently dropped.
    expectTypeOf(primaryTestError).toMatchTypeOf<Error & { cause?: unknown }>();
    expect((primaryTestError as Error & { cause?: unknown }).cause).toBeInstanceOf(Error);
    expect(
      (
        (primaryTestError as Error & { cause?: unknown }).cause as Error & {
          realm?: string;
          cause?: unknown;
        }
      ).cause,
    ).toBe(cleanupFailure);

    expect(fakeCore.realms.del).toHaveBeenCalledTimes(1);
  });

  test('withEnsuredMasterRealm surfaces a TestRealmCleanupError when ONLY cleanup fails (no primary test failure)', async () => {
    const cleanupFailure = new Error('discard TransientError');

    // ensure succeeds (default state model) and the body succeeds; only the
    // single `discard()` admin failure unit rejects.
    fakeCore.realms.del.mockRejectedValueOnce(cleanupFailure);

    let caught: unknown;
    try {
      await withEnsuredMasterRealm('cleanup-test-only-cleanup', async () => {
        // Body succeeded; no primary error.
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).name).toBe('TestRealmCleanupError');
    expect((caught as Error & { cause?: unknown }).cause).toBe(cleanupFailure);
    expect(fakeCore.realms.del).toHaveBeenCalledTimes(1);
  });

  test('withEnsuredMasterRealm skips realm deletion when ensure() threw before any create', async () => {
    // Simulate `ensure()` failing on its existence probe (`findOne` rejects on
    // its first call) before any realm is created. The state-model `findOne`
    // afterward returns null (no realm created → discard is a no-op), so `del`
    // is never invoked. The primary `ensureFailure` is the surfaced error.
    const ensureFailure = new Error('admin HTTP 503 during existence probe');
    fakeCore.realms.findOne.mockRejectedValueOnce(ensureFailure);

    await expect(
      withEnsuredMasterRealm('cleanup-test-no-create', async () => {
        // Should never reach here because ensure() rejects first.
        throw new Error('callback unexpectedly ran past ensure() failure');
      }),
    ).rejects.toBe(ensureFailure);

    // Realm was never created, so the cleanup probe (discard's get) returns
    // null (state-model default after the once-reject drained) and `del` is
    // never called.
    expect(fakeCore.realms.create).not.toHaveBeenCalled();
    expect(fakeCore.realms.del).not.toHaveBeenCalled();
  });
});

describe('CI-01: withMasterRealm (callback owns creation path)', () => {
  test('skips realm deletion when the body never created the realm', async () => {
    // Body fails before calling `kcMaster.realm(realm).ensure(...)`; the
    // state-model `findOne` returns null (no realm exists), so `discard()`'s
    // `get()` short-circuits and `del` is never invoked.
    const primaryTestError = new Error('body failed before create');

    await expect(
      withMasterRealm('master-test', async () => {
        throw primaryTestError;
      }),
    ).rejects.toBe(primaryTestError);

    expect(fakeCore.realms.create).not.toHaveBeenCalled();
    expect(fakeCore.realms.del).not.toHaveBeenCalled();
  });

  test('preserves the primary error when the body failed after it created the realm AND discard also fails', async () => {
    const primaryTestError = new Error('body failed mid-test');

    // The body calls `kcMaster.realm(realm).ensure({})` (state model:
    // findOne -> null -> create -> findOne returns the realm), then throws.
    // `discard()` then calls `del`, which we make fail with an HTTP-simulated
    // cleanup error.
    const cleanupFailure = new Error('discard HTTP 500');
    fakeCore.realms.del.mockRejectedValueOnce(cleanupFailure);

    await expect(
      withMasterRealm('master-test-mask', async ({ kcMaster, realm }) => {
        await kcMaster.realm(realm).ensure({});
        throw primaryTestError;
      }),
    ).rejects.toBe(primaryTestError);

    // The cleanup failure is recorded as `cause`, not masked over the primary
    // error.
    expect((primaryTestError as Error & { cause?: unknown }).cause).toBeInstanceOf(Error);
    expect(((primaryTestError as Error & { cause?: unknown }).cause as Error & { cause?: unknown }).cause).toBe(
      cleanupFailure,
    );
    expect(fakeCore.realms.del).toHaveBeenCalledTimes(1);
  });
});
