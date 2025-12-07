import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from './realm';
import ClientHandle, { type ClientInputData } from './client';

export type ServiceAccountInputData = Omit<
  ClientInputData,
  | 'protocol'
  | 'publicClient'
  | 'standardFlowEnabled'
  | 'directAccessGrantsEnabled'
  | 'implicitFlowEnabled'
  | 'serviceAccountsEnabled'
  | 'redirectUris'
>;

export default class ServiceAccountHandle extends ClientHandle {
  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, clientId: string) {
    super(core, realmHandle, clientId);
  }

  public async create(data: ServiceAccountInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: ServiceAccountInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: ServiceAccountInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  public async getUser() {
    if (!this.client) return null;

    const user = await this.core.clients.getServiceAccountUser({
      realm: this.realmName,
      id: this.client.id!,
    });

    return user ?? null;
  }

  private decorateInputData(data: ServiceAccountInputData) {
    return {
      ...data,
      ...{
        protocol: 'openid-connect',
        publicClient: false, // confidential
        standardFlowEnabled: false, // browser login
        directAccessGrantsEnabled: false,
        implicitFlowEnabled: false,
        serviceAccountsEnabled: true,
      },
    };
  }
}
