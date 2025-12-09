import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ProtocolMapperHandle, { type ProtocolMapperInputData } from './protocol-mapper';
import ClientHandle from '../clients/client';
import _merge from 'lodash-es/merge';

export interface AudienceProtocolMapperInputData extends ProtocolMapperInputData {
  audience: string;
}

export default class AudienceProtocolMapperHandle extends ProtocolMapperHandle {
  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, mapperName: string) {
    super(core, clientHandle, mapperName);
  }

  public async create(data: AudienceProtocolMapperInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: AudienceProtocolMapperInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: AudienceProtocolMapperInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: AudienceProtocolMapperInputData) {
    const { audience, ...rest } = data;
    return _merge(
      {
        config: {
          'included.client.audience': '',
          'included.custom.audience': audience,
          'id.token.claim': 'false',
          'access.token.claim': 'true',
          'introspection.token.claim': 'true',
          'lightweight.claim': 'false',
        },
      },
      rest,
      {
        protocol: 'openid-connect',
        protocolMapper: 'oidc-audience-mapper',
      },
    );
  }
}
