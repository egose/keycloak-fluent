import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmHandle from '../realm';
import ClientHandle, { type ClientInputData } from './client';

export type PublicBrowserLoginClientInputData = Omit<
  ClientInputData,
  | 'protocol'
  | 'publicClient'
  | 'standardFlowEnabled'
  | 'directAccessGrantsEnabled'
  | 'implicitFlowEnabled'
  | 'serviceAccountsEnabled'
  | 'secret'
>;

export default class PublicBrowserLoginClientHandle extends ClientHandle {
  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, clientId: string) {
    super(core, realmHandle, clientId);
  }

  public async create(data: PublicBrowserLoginClientInputData) {
    return super.create(this.decorateCreateInputData(data));
  }

  public async update(data: PublicBrowserLoginClientInputData) {
    return super.update(this.decorateUpdateInputData(data));
  }

  public async ensure(data: PublicBrowserLoginClientInputData) {
    if (await this.get()) {
      return super.ensure(this.decorateUpdateInputData(data));
    }

    return super.ensure(this.decorateCreateInputData(data));
  }

  private decorateCreateInputData(data: PublicBrowserLoginClientInputData) {
    return this.decorateUpdateInputData({
      ...data,
      redirectUris: data.redirectUris?.length ? data.redirectUris : ['*'],
    });
  }

  private decorateUpdateInputData(data: PublicBrowserLoginClientInputData) {
    return {
      ...data,
      ...{
        protocol: 'openid-connect',
        publicClient: true, // public
        standardFlowEnabled: true, // browser login
        directAccessGrantsEnabled: false,
        implicitFlowEnabled: false,
        serviceAccountsEnabled: false,
        secret: '',
      },
    };
  }
}
