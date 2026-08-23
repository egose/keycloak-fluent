import { randomUUID } from 'node:crypto';
import type { getToken } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import KeycloakAdminClientFluent from '../src/index';
import type KeycloakAdminClient from '../src/keycloak-admin-client';
import type RealmHandle from '../src/realm';

export type MockAdminResource<
  ResourceName extends keyof KeycloakAdminClient,
  MethodName extends keyof KeycloakAdminClient[ResourceName],
> = Pick<KeycloakAdminClient[ResourceName], MethodName>;

type MockAdminClientInput = {
  [ResourceName in keyof KeycloakAdminClient]?: KeycloakAdminClient[ResourceName] extends object
    ? Partial<KeycloakAdminClient[ResourceName]>
    : KeycloakAdminClient[ResourceName];
};

export function createMockAdminClient<const T extends MockAdminClientInput>(resources: T): T & KeycloakAdminClient {
  return resources as T & KeycloakAdminClient;
}

export function createTestFluentClient(adminClient: KeycloakAdminClient, tokenAcquirer?: typeof getToken) {
  return new KeycloakAdminClientFluent(undefined, { adminClient, tokenAcquirer });
}

export function exactCallArgs<Fn extends (...args: never[]) => unknown>(...args: Parameters<Fn>): Parameters<Fn> {
  return args;
}

type MasterRealmContext = {
  kcMaster: KeycloakAdminClientFluent;
  realm: string;
};

type EnsuredMasterRealmContext = MasterRealmContext & {
  realmHandle: RealmHandle;
};

function createTestRealmName(prefix: string) {
  return `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

/**
 * Integration sandbox connection configuration.
 *
 * Tests default to the local sandbox (`http://localhost:8080`) and the
 * `master` realm with the documented Docker credentials (`admin`/`password`).
 * Override any of these with the corresponding environment variable to target
 * a non-default Keycloak endpoint without editing the test sources:
 *
 * - `KEYCLOAK_BASE_URL`     -> base URL of the Keycloak admin API.
 * - `KEYCLOAK_MASTER_REALM` -> master realm name to authenticate against.
 * - `KEYCLOAK_USERNAME`     -> admin username for `simpleAuth()`.
 * - `KEYCLOAK_PASSWORD`      -> admin password for `simpleAuth()`.
 */
const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL ?? 'http://localhost:8080';
const KEYCLOAK_MASTER_REALM = process.env.KEYCLOAK_MASTER_REALM ?? 'master';
const KEYCLOAK_USERNAME = process.env.KEYCLOAK_USERNAME ?? 'admin';
const KEYCLOAK_PASSWORD = process.env.KEYCLOAK_PASSWORD ?? 'password'; // pragma: allowlist secret

/**
 * Error thrown when the test realm cleanup itself failed and there was no
 * primary test failure to preserve. When the test body also failed, this error
 * is attached to the primary error's `cause` instead of being thrown directly,
 * so the test reporter surfaces the original failure rather than the cleanup.
 */
class TestRealmCleanupError extends Error {
  public readonly realm: string;

  public constructor(message: string, params: { realm: string; cause?: unknown }) {
    super(message, params.cause !== undefined ? { cause: params.cause } : undefined);
    this.name = 'TestRealmCleanupError';
    this.realm = params.realm;
  }
}

/**
 * Tears down a test realm while preserving the primary test error.
 *
 * Realm deletion is gated on {@link shouldDiscard}; the existing callers pass
 * `true` unconditionally because `RealmHandle.discard()` itself skips the
 * `realms.del` call when `get()` returns null — i.e. the deletion step is
 * already skipped whenever creation never happened, satisfying that
 * requirement at the cheapest safe boundary without a caller having to track
 * which step failed. The `shouldDiscard` parameter is retained so a future
 * caller that can prove no realm could have been created (e.g., never reached
 * `ensure()`) can opt out even of the existence probe.
 *
 * Any cleanup failure is preserved:
 * - if {@link primaryError} is set, it is rethrown with the cleanup failure
 *   attached as the primary error's `cause` so the test reporter surfaces the
 *   original failure (not the cleanup failure that masked it before);
 * - if there was no primary failure, a {@link TestRealmCleanupError} is thrown
 *   carrying the cleanup error as its `cause`.
 */
async function discardTestRealm(
  kcMaster: KeycloakAdminClientFluent,
  realm: string,
  shouldDiscard: boolean,
  primaryError: unknown,
): Promise<void> {
  if (!shouldDiscard) {
    if (primaryError !== undefined) {
      throw primaryError;
    }
    return;
  }

  let cleanupError: unknown;
  try {
    await kcMaster.realm(realm).discard();
  } catch (error) {
    cleanupError = error;
  }

  if (cleanupError === undefined) {
    if (primaryError !== undefined) {
      throw primaryError;
    }
    return;
  }

  const wrappedCleanup = new TestRealmCleanupError(`Cleanup of test realm "${realm}" failed.`, {
    realm,
    cause: cleanupError,
  });

  if (primaryError === undefined) {
    throw wrappedCleanup;
  }

  // Both failed: surface the primary error, with the cleanup error attached as
  // its `cause` so the cleanup failure is recorded rather than masked. We do
  // NOT rethrow the wrapped cleanup here because that would mask the primary
  // test failure — the exact problem this helper exists to prevent.
  if (primaryError instanceof Error) {
    (primaryError as Error & { cause?: unknown }).cause = wrappedCleanup;
  }
  throw primaryError;
}

// Shared setup for both helpers: build the master client from the configured
// sandbox connection, authenticate, and run the callback with it. Teardown is
// the responsibility of the caller via `discardTestRealm` so that each helper
// tears down its test realm exactly once rather than `withEnsuredMasterRealm`
// inheriting `withMasterRealm`'s teardown and discarding twice.
async function runAuthenticated(callback: (kcMaster: KeycloakAdminClientFluent) => Promise<void>) {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: KEYCLOAK_BASE_URL, realmName: KEYCLOAK_MASTER_REALM });

  await kcMaster.simpleAuth({
    username: KEYCLOAK_USERNAME,
    password: KEYCLOAK_PASSWORD, // pragma: allowlist secret
  });

  await callback(kcMaster);
}

export async function withMasterRealm(prefix: string, callback: (context: MasterRealmContext) => Promise<void>) {
  const realm = createTestRealmName(prefix);

  // The callback owns realm creation (it may call `kcMaster.realm(realm).ensure(...)`
  // directly, or not at all on the failure paths). `RealmHandle.discard()` skips
  // the deletion when `get()` returns null, so passing `shouldDiscard=true`
  // unconditionally is safe and means a callback that never created the realm
  // pays only one existence-probe round-trip rather than risking a partial
  // creation leak. `discardTestRealm` rethrows the primary error (if any) so the
  // test reporter surfaces the original test failure rather than a cleanup
  // failure that masked it.
  await runAuthenticated(async (kcMaster) => {
    let primaryError: unknown;
    try {
      await callback({ kcMaster, realm });
    } catch (error) {
      primaryError = error;
    }
    await discardTestRealm(kcMaster, realm, true, primaryError);
  });
}

export async function withEnsuredMasterRealm(
  prefix: string,
  callback: (context: EnsuredMasterRealmContext) => Promise<void>,
) {
  const realm = createTestRealmName(prefix);

  // `withEnsuredMasterRealm` owns the create-if-not-exists step via
  // `ensure({})`. The realm does not exist before that call resolves, so a
  // failure before `ensure()` returns cannot have created a realm unless
  // `ensure()` itself committed partial state. `RealmHandle.discard()`
  // internally skips the `realms.del` call when `get()` returns null, so it
  // implements the "skip deletion when creation never happened" requirement at
  // the cheapest safe boundary: a failure before `ensure()` round-trips a null
  // `get()` (cheap, no deletion); a partial `ensure()` failure gets cleaned
  // up rather than leaked. The rethrown primary error (if any) still surfaces
  // through `discardTestRealm`, with any cleanup failure attached as `cause`
  // instead of masking it.
  //
  // Teardown is local to this helper (it does not nest through
  // `withMasterRealm`) so the test realm is discarded exactly once.
  await runAuthenticated(async (kcMaster) => {
    let realmHandle: RealmHandle | undefined;
    let primaryError: unknown;
    try {
      realmHandle = await kcMaster.realm(realm).ensure({});
      await callback({ kcMaster, realm, realmHandle });
    } catch (error) {
      primaryError = error;
    }
    await discardTestRealm(kcMaster, realm, true, primaryError);
  });
}

export async function createAuthenticatedRealmClient(realm: string, clientId: string, clientSecret: string) {
  const kcCustom = new KeycloakAdminClientFluent({ baseUrl: KEYCLOAK_BASE_URL, realmName: realm });

  await kcCustom.simpleAuth({
    clientId,
    clientSecret,
  });

  return kcCustom;
}
