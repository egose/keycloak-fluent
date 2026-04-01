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
