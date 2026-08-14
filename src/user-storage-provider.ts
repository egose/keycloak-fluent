import KeycloakAdminClient, { type SynchronizationResultRepresentation } from './keycloak-admin-client';
import RealmHandle from './realm';
import { retryTransientAdminError } from './utils/retry';

export type UserStorageSyncAction = 'triggerFullSync' | 'triggerChangedUsersSync';
export type UserStorageMapperSyncDirection = 'fedToKeycloak' | 'keycloakToFed';
export type UserStorageProviderNameResponse = {
  id: string;
  name: string;
};

export default class UserStorageProviderHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  public readonly realmName: string;
  public readonly providerId: string;
  private _providerName?: string;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, providerId: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.providerId = providerId;
  }

  public get providerName(): string | undefined {
    return this._providerName;
  }

  public async getName(): Promise<UserStorageProviderNameResponse> {
    const result = await retryTransientAdminError(() =>
      this.core.userStorageProvider.name({
        realm: this.realmName,
        id: this.providerId,
      }),
    );

    this._providerName = result.name;
    return result;
  }

  public async removeImportedUsers() {
    await retryTransientAdminError(() =>
      this.core.userStorageProvider.removeImportedUsers({
        realm: this.realmName,
        id: this.providerId,
      }),
    );
  }

  public async sync(action?: UserStorageSyncAction): Promise<SynchronizationResultRepresentation> {
    return retryTransientAdminError(() =>
      this.core.userStorageProvider.sync({
        realm: this.realmName,
        id: this.providerId,
        action,
      }),
    );
  }

  public async unlinkUsers() {
    await retryTransientAdminError(() =>
      this.core.userStorageProvider.unlinkUsers({
        realm: this.realmName,
        id: this.providerId,
      }),
    );
  }

  public async syncMappers(
    parentId: string,
    direction?: UserStorageMapperSyncDirection,
  ): Promise<SynchronizationResultRepresentation> {
    return retryTransientAdminError(() =>
      this.core.userStorageProvider.mappersSync({
        realm: this.realmName,
        id: this.providerId,
        parentId,
        direction,
      }),
    );
  }
}
