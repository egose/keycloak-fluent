import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ProtocolMapperHandle, { type ProtocolMapperInputData } from './protocol-mapper';
import ClientHandle from '../clients/client';
import _merge from 'lodash-es/merge.js';

export interface UserAttributeProtocolMapperInputData extends ProtocolMapperInputData {
  userAttribute: string;
  claimName: string;
}

export default class UserAttributeProtocolMapperHandle extends ProtocolMapperHandle {
  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, mapperName: string) {
    super(core, clientHandle, mapperName);
  }

  public async create(data: UserAttributeProtocolMapperInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: UserAttributeProtocolMapperInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: UserAttributeProtocolMapperInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: UserAttributeProtocolMapperInputData) {
    const { userAttribute, claimName, ...rest } = data;
    return _merge(
      {
        config: {
          'claim.name': claimName,
          'user.attribute': userAttribute,
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
        protocolMapper: 'oidc-usermodel-attribute-mapper',
      },
    );
  }
}
