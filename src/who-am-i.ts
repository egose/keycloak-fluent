import KeycloakAdminClient, { type WhoAmIRepresentation } from './keycloak-admin-client';
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
