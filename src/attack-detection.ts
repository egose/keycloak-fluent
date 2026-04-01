import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from './realm';
import { retryTransientAdminError } from './utils/retry';

export default class AttackDetectionHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public userId?: string;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, userId?: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.userId = userId;
  }

  private requireUserId(userId?: string) {
    const resolvedUserId = userId ?? this.userId;
    if (!resolvedUserId) {
      throw new Error(`Attack detection user id is required in realm "${this.realmName}"`);
    }

    return resolvedUserId;
  }

  public forUser(userId: string) {
    return new AttackDetectionHandle(this.core, this.realmHandle, userId);
  }

  public async get(userId?: string) {
    const resolvedUserId = this.requireUserId(userId);

    return retryTransientAdminError(() =>
      this.core.attackDetection.findOne({
        realm: this.realmName,
        id: resolvedUserId,
      }),
    );
  }

  public async clear(userId?: string) {
    const resolvedUserId = this.requireUserId(userId);

    await retryTransientAdminError(() =>
      this.core.attackDetection.del({
        realm: this.realmName,
        id: resolvedUserId,
      }),
    );
  }

  public async clearAll() {
    await retryTransientAdminError(() => this.core.attackDetection.delAll({ realm: this.realmName }));
  }
}
