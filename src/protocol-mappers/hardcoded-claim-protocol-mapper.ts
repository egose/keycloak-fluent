import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ProtocolMapperHandle, { type ProtocolMapperInputData } from './protocol-mapper';
import ClientHandle from '../clients/client';
import _merge from 'lodash-es/merge';

export interface HardcodedClaimProtocolMapperInputData extends ProtocolMapperInputData {
  claimName: string;
  claimValue: string;
}

export default class HardcodedClaimProtocolMapperHandle extends ProtocolMapperHandle {
  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, mapperName: string) {
    super(core, clientHandle, mapperName);
  }

  public async create(data: HardcodedClaimProtocolMapperInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: HardcodedClaimProtocolMapperInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: HardcodedClaimProtocolMapperInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: HardcodedClaimProtocolMapperInputData) {
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
