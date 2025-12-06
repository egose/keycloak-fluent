import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from './realm';
import ClientHandle, { type ClientInputData } from './client';

export type ConfidentialBrowserLoginClientInputData = Omit<
  ClientInputData,
  | 'protocol'
  | 'publicClient'
  | 'standardFlowEnabled'
  | 'directAccessGrantsEnabled'
  | 'implicitFlowEnabled'
  | 'serviceAccountsEnabled'
>;

export default class ConfidentialBrowserLoginClientHandle extends ClientHandle {
  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, clientId: string) {
    super(core, realmHandle, clientId);
  }

  public async create(data: ConfidentialBrowserLoginClientInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: ConfidentialBrowserLoginClientInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: ConfidentialBrowserLoginClientInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: ConfidentialBrowserLoginClientInputData) {
    const redirectUris = data.redirectUris ?? [];
    return {
      ...data,
      ...{
        protocol: 'openid-connect',
        publicClient: false, // confidential
        standardFlowEnabled: true, // browser login
        directAccessGrantsEnabled: false,
        implicitFlowEnabled: false,
        serviceAccountsEnabled: false,
        redirectUris: redirectUris.length === 0 ? ['*'] : redirectUris,
      },
    };
  }
}
