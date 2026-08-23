import KeycloakAdminClient from './keycloak-admin-client';
import RealmHandle from './realm';
import { retry } from './utils/retry';

/**
 * Cache clearing operations are idempotent side effects: the target cache is
 * invalidated on the server regardless of how many times the request is
 * replayed, so a retry after an ambiguous response cannot corrupt state.
 */
const cacheClearRetryOptions = { idempotent: true };

export default class CacheHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle) {
    this.core = core;
    this.realmHandle = realmHandle;
  }

  public get realmName(): string {
    return this.realmHandle.realmName;
  }

  public async clearUserCache() {
    await retry(() => this.core.cache.clearUserCache({ realm: this.realmName }), cacheClearRetryOptions);
  }

  public async clearKeysCache() {
    await retry(() => this.core.cache.clearKeysCache({ realm: this.realmName }), cacheClearRetryOptions);
  }

  public async clearCrlCache() {
    await retry(() => this.core.cache.clearCrlCache({ realm: this.realmName }), cacheClearRetryOptions);
  }

  public async clearRealmCache() {
    await retry(() => this.core.cache.clearRealmCache({ realm: this.realmName }), cacheClearRetryOptions);
  }
}
