import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type SynchronizationResultRepresentation from '@keycloak/keycloak-admin-client/lib/defs/synchronizationResultRepresentation';
import RealmHandle from './realm';
import { retryTransientAdminError } from './utils/retry';

export type UserStorageSyncAction = 'triggerFullSync' | 'triggerChangedUsersSync';
export type UserStorageMapperSyncDirection = 'fedToKeycloak' | 'keycloakToFed';
export type UserStorageProviderNameResponse = {
  id: string;
  name: string;
};

export default class UserStorageProviderHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public providerId: string;
  public providerName?: string;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, providerId: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.providerId = providerId;
  }

  public async getName(): Promise<UserStorageProviderNameResponse> {
    const result = await retryTransientAdminError(() =>
      this.core.userStorageProvider.name({
        realm: this.realmName,
        id: this.providerId,
      }),
    );

    this.providerName = result.name;
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
