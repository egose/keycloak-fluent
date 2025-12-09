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
    return super.create(this.decorateInputData(data));
  }

  public async update(data: PublicBrowserLoginClientInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: PublicBrowserLoginClientInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: PublicBrowserLoginClientInputData) {
    const redirectUris = data.redirectUris ?? [];
    return {
      ...data,
      ...{
        protocol: 'openid-connect',
        publicClient: true, // public
        standardFlowEnabled: true, // browser login
        directAccessGrantsEnabled: false,
        implicitFlowEnabled: false,
        serviceAccountsEnabled: false,
        redirectUris: redirectUris.length === 0 ? ['*'] : redirectUris,
        secret: '',
      },
    };
  }
}
