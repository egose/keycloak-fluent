import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from './realm';

function isTransientAdminError(error: unknown) {
  return error instanceof Error && error.message.includes('unknown_error');
}

async function retryTransientAdminError<T>(operation: () => Promise<T>, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientAdminError(error) || attempt === attempts - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }

  throw new Error('Unreachable');
}

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
