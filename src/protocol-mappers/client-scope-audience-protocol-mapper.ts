import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import _merge from 'lodash-es/merge.js';
import type ClientScopeHandle from '../client-scope';
import ClientScopeProtocolMapperHandle from './client-scope-protocol-mapper';
import { type ProtocolMapperInputData } from './protocol-mapper';

export interface ClientScopeAudienceProtocolMapperInputData extends ProtocolMapperInputData {
  audience: string;
}

export default class ClientScopeAudienceProtocolMapperHandle extends ClientScopeProtocolMapperHandle {
  constructor(core: KeycloakAdminClient, clientScopeHandle: ClientScopeHandle, mapperName: string) {
    super(core, clientScopeHandle, mapperName);
  }

  public async create(data: ClientScopeAudienceProtocolMapperInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: ClientScopeAudienceProtocolMapperInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: ClientScopeAudienceProtocolMapperInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: ClientScopeAudienceProtocolMapperInputData) {
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
