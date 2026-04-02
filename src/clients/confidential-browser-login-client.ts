import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from '../realm';
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
    return super.create(this.decorateCreateInputData(data));
  }

  public async update(data: ConfidentialBrowserLoginClientInputData) {
    return super.update(this.decorateUpdateInputData(data));
  }

  public async ensure(data: ConfidentialBrowserLoginClientInputData) {
    if (await this.get()) {
      return super.ensure(this.decorateUpdateInputData(data));
    }

    return super.ensure(this.decorateCreateInputData(data));
  }

  private decorateCreateInputData(data: ConfidentialBrowserLoginClientInputData) {
    return this.decorateUpdateInputData({
      ...data,
      redirectUris: data.redirectUris?.length ? data.redirectUris : ['*'],
    });
  }

  private decorateUpdateInputData(data: ConfidentialBrowserLoginClientInputData) {
    return {
      ...data,
      ...{
        protocol: 'openid-connect',
        publicClient: false, // confidential
        standardFlowEnabled: true, // browser login
        directAccessGrantsEnabled: false,
        implicitFlowEnabled: false,
        serviceAccountsEnabled: false,
      },
    };
  }
}
