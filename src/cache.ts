import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from './realm';
import { retryTransientAdminError } from './utils/retry';

export default class CacheHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
  }

  public async clearUserCache() {
    await retryTransientAdminError(() => this.core.cache.clearUserCache({ realm: this.realmName }));
  }

  public async clearKeysCache() {
    await retryTransientAdminError(() => this.core.cache.clearKeysCache({ realm: this.realmName }));
  }

  public async clearCrlCache() {
    await retryTransientAdminError(() => this.core.cache.clearCrlCache({ realm: this.realmName }));
  }

  public async clearRealmCache() {
    await retryTransientAdminError(() => this.core.cache.clearRealmCache({ realm: this.realmName }));
  }
}
