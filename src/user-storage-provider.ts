import KeycloakAdminClient, { type SynchronizationResultRepresentation } from './keycloak-admin-client';
import RealmHandle from './realm';
import { retryTransientAdminError, retryTransientAdminReadError } from './utils/retry';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';

export type UserStorageSyncAction = 'triggerFullSync' | 'triggerChangedUsersSync';
export type UserStorageMapperSyncDirection = 'fedToKeycloak' | 'keycloakToFed';
export type UserStorageProviderNameResponse = {
  id: string;
  name: string;
};

export default class UserStorageProviderHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  public readonly providerId: string;
  private _providerName?: string;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, providerId: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.providerId = providerId;
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._providerName = undefined))) {
      this._identityGeneration++;
    }
  }

  public get realmName(): string {
    return this.realmHandle.realmName;
  }

  public get identityVersion(): string {
    this.invalidateParentCache();
    return makeHandleIdentityVersion(this._identityGeneration, this.realmHandle);
  }

  public get providerName(): string | undefined {
    this.invalidateParentCache();
    return this._providerName;
  }

  public async getName(): Promise<UserStorageProviderNameResponse> {
    this.invalidateParentCache();
    const result = await retryTransientAdminReadError(() =>
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
