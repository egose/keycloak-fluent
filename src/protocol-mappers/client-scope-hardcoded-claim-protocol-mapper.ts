import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import _merge from 'lodash-es/merge.js';
import type ClientScopeHandle from '../client-scope';
import ClientScopeProtocolMapperHandle from './client-scope-protocol-mapper';
import { type ProtocolMapperInputData } from './protocol-mapper';

export interface ClientScopeHardcodedClaimProtocolMapperInputData extends ProtocolMapperInputData {
  claimName: string;
  claimValue: string;
}

export default class ClientScopeHardcodedClaimProtocolMapperHandle extends ClientScopeProtocolMapperHandle {
  constructor(core: KeycloakAdminClient, clientScopeHandle: ClientScopeHandle, mapperName: string) {
    super(core, clientScopeHandle, mapperName);
  }

  public async create(data: ClientScopeHardcodedClaimProtocolMapperInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: ClientScopeHardcodedClaimProtocolMapperInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: ClientScopeHardcodedClaimProtocolMapperInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: ClientScopeHardcodedClaimProtocolMapperInputData) {
    const { claimValue, claimName, ...rest } = data;
    return _merge(
      {
        config: {
          'claim.name': claimName,
          'claim.value': claimValue,
          'jsonType.label': 'String',
          'id.token.claim': 'true',
          'userinfo.token.claim': 'true',
          'access.token.claim': 'true',
          'introspection.token.claim': 'true',
          'lightweight.claim': 'false',
          multivalued: 'false',
          'aggregate.attrs': 'false',
        },
      },
      rest,
      {
        protocol: 'openid-connect',
        protocolMapper: 'oidc-hardcoded-claim-mapper',
      },
    );
  }
}
