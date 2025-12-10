import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

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

  public async listAssignedUsers() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    const result = await this.core.groups.listMembers({
      realm: this.realmName,
      id: one.id!,
      first: 0,
      max: 1000,
      briefRepresentation: false,
    });

    return result;
  }
}
