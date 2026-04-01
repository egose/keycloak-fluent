import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import _merge from 'lodash-es/merge.js';
import type ClientScopeHandle from '../client-scope';
import ClientScopeProtocolMapperHandle from './client-scope-protocol-mapper';
import { type ProtocolMapperInputData } from './protocol-mapper';

export interface ClientScopeUserAttributeProtocolMapperInputData extends ProtocolMapperInputData {
  userAttribute: string;
  claimName: string;
}

export default class ClientScopeUserAttributeProtocolMapperHandle extends ClientScopeProtocolMapperHandle {
  constructor(core: KeycloakAdminClient, clientScopeHandle: ClientScopeHandle, mapperName: string) {
    super(core, clientScopeHandle, mapperName);
  }

  public async create(data: ClientScopeUserAttributeProtocolMapperInputData) {
    return super.create(this.decorateInputData(data));
  }

  public async update(data: ClientScopeUserAttributeProtocolMapperInputData) {
    return super.update(this.decorateInputData(data));
  }

  public async ensure(data: ClientScopeUserAttributeProtocolMapperInputData) {
    return super.ensure(this.decorateInputData(data));
  }

  private decorateInputData(data: ClientScopeUserAttributeProtocolMapperInputData) {
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
