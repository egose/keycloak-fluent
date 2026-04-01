import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type ClientPoliciesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientPoliciesRepresentation';
import type ClientProfilesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientProfilesRepresentation';
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

export default class ClientPoliciesHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
  }

  public async getProfiles(includeGlobalProfiles?: boolean): Promise<ClientProfilesRepresentation> {
    return retryTransientAdminError(() =>
      this.core.clientPolicies.listProfiles({
        realm: this.realmName,
        includeGlobalProfiles,
      }),
    );
  }

  public async updateProfiles(data: ClientProfilesRepresentation) {
    await retryTransientAdminError(() =>
      this.core.clientPolicies.createProfiles({
        realm: this.realmName,
        ...data,
      }),
    );

    return this.getProfiles();
  }

  public async getPolicies(includeGlobalPolicies?: boolean): Promise<ClientPoliciesRepresentation> {
    return retryTransientAdminError(() =>
      this.core.clientPolicies.listPolicies({
        realm: this.realmName,
        includeGlobalPolicies,
      }),
    );
  }

  public async updatePolicies(data: ClientPoliciesRepresentation) {
    await retryTransientAdminError(() =>
      this.core.clientPolicies.updatePolicy({
        realm: this.realmName,
        ...data,
      }),
    );

    return this.getPolicies();
  }
}
