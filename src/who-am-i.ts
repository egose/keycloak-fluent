import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type WhoAmIRepresentation from '@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation';

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

export default class WhoAmIHandle {
  public core: KeycloakAdminClient;
  public currentRealm: string;
  public realmName?: string;

  constructor(core: KeycloakAdminClient, currentRealm: string, realmName?: string) {
    this.core = core;
    this.currentRealm = currentRealm;
    this.realmName = realmName;
  }

  public async get(): Promise<WhoAmIRepresentation> {
    return retryTransientAdminError(() =>
      this.core.whoAmI.find({
        currentRealm: this.currentRealm,
        realm: this.realmName,
      }),
    );
  }
}
