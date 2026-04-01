import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type WhoAmIRepresentation from '@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation';
import { retryTransientAdminError } from './utils/retry';

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
