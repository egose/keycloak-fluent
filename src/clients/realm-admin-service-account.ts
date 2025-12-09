import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import RealmHandle from '../realm';
import ClientHandle from './client';
import ServiceAccountHandle, { type ServiceAccountInputData } from './service-account';

export type RealmAdminServiceAccountInputData = ServiceAccountInputData;

export default class RealmAdminServiceAccountHandle extends ServiceAccountHandle {
  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, clientId: string) {
    super(core, realmHandle, clientId);
  }

  public async create(data: RealmAdminServiceAccountInputData) {
    const svc = await super.create(data);
    await this.addRealmManagementMappings();
    return svc;
  }

  public async update(data: RealmAdminServiceAccountInputData) {
    const svc = await super.update(data);
    await this.addRealmManagementMappings();
    return svc;
  }

  public async ensure(data: RealmAdminServiceAccountInputData) {
    await super.ensure(data);
    await this.addRealmManagementMappings();
    return this;
  }

  protected async addRealmManagementMappings() {
    if (!this.client) return;

    let realmManagementClientId = '';
    let realmManagementRoleName = '';

    if (this.realmName === 'master') {
      realmManagementClientId = 'master-realm';
      realmManagementRoleName = 'manage-realm';
    } else {
      realmManagementClientId = 'realm-management';
      realmManagementRoleName = 'realm-admin';
    }

    const realmManagementClient = await ClientHandle.getByClientId(this.core, this.realmName, realmManagementClientId);
    if (!realmManagementClient) {
      throw new Error(`Realm Management Client "${realmManagementClientId}" not found in realm "${this.realmName}"`);
    }

    const [realmAdminRole, serviceAccountUser] = await Promise.all([
      this.core.clients.findRole({
        realm: this.realmName,
        id: realmManagementClient.id!,
        roleName: realmManagementRoleName,
      }),
      this.getUser(),
    ]);

    if (!realmAdminRole) {
      throw new Error(`Realm Management Role "${realmManagementRoleName}" not found in realm "${this.realmName}"`);
    }

    if (!serviceAccountUser) {
      throw new Error(`Service Account User "${this.client.clientId}" not found in realm "${this.realmName}"`);
    }

    await this.core.users.addClientRoleMappings({
      realm: this.realmName,
      id: serviceAccountUser.id as string,
      clientUniqueId: realmManagementClient?.id as string,
      roles: [realmAdminRole as RoleMappingPayload],
    });

    return this.client;
  }
}
