import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type ClientPoliciesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientPoliciesRepresentation';
import type ClientProfilesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientProfilesRepresentation';
import RealmHandle from './realm';
import { retryTransientAdminError } from './utils/retry';

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
