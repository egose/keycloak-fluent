import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';

export abstract class AbstractGroupHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public groupName: string;
  public group?: GroupRepresentation | null;

  constructor(core: KeycloakAdminClient, realmName: string, groupName: string) {
    this.core = core;
    this.realmName = realmName;
    this.groupName = groupName;
    this.group = null;
  }

  public abstract get(): Promise<GroupRepresentation | null>;
}
