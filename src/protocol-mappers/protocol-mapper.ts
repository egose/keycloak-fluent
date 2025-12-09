import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import ProtocolMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation';
import ClientHandle from '../clients/client';

export type ProtocolMapperProtocol = 'openid-connect' | 'saml';

export const defaultProtocolMapperData = Object.freeze({
  protocol: 'openid-connect',
  protocolMapper: '',
  config: {},
});

export interface ProtocolMapperRepresentationExt extends ProtocolMapperRepresentation {
  protocol?: ProtocolMapperProtocol;
}
export type ProtocolMapperInputData = Omit<ProtocolMapperRepresentationExt, 'name | id'>;

export default class ProtocolMapperHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public clientHandle: ClientHandle;
  public clientId: string;
  public client: ClientRepresentation;
  public mapperName: string;
  public clientProtocolMapper?: ProtocolMapperRepresentation | null;
  public clientProtocolMapperData?: Omit<ProtocolMapperRepresentation, 'name | id'>;

  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, mapperName: string) {
    this.core = core;
    this.clientHandle = clientHandle;
    this.clientId = clientHandle.clientId;
    this.client = clientHandle.client!;
    this.realmName = clientHandle.realmName;
    this.mapperName = mapperName;
  }

  private get query() {
    return {
      realm: this.realmName,
      id: this.client.id!,
      mapperId: this.clientProtocolMapper?.id!,
    };
  }

  public async getById(id: string) {
    const one = await this.core.clients.findProtocolMapperById({
      realm: this.realmName,
      id: this.client.id!,
      mapperId: id,
    });
    this.clientProtocolMapper = one ?? null;

    if (this.clientProtocolMapper) {
      this.mapperName = this.clientProtocolMapper.name!;
    }

    return this.clientProtocolMapper;
  }

  public async get(): Promise<ProtocolMapperRepresentation | null> {
    const one = await this.core.clients.findProtocolMapperByName({
      realm: this.realmName,
      id: this.client.id!,
      name: this.mapperName,
    });
    this.clientProtocolMapper = one ?? null;

    if (this.clientProtocolMapper) {
      this.mapperName = this.clientProtocolMapper.name!;
    }

    return this.clientProtocolMapper;
  }

  public async create(data: ProtocolMapperInputData) {
    if (await this.get()) {
      throw new Error(`Protocol Mapper "${this.mapperName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.clients.addProtocolMapper(
      { realm: this.realmName, id: this.client.id! },
      { ...defaultProtocolMapperData, ...data, name: this.mapperName },
    );
    return this.get();
  }

  public async update(data: ProtocolMapperInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Protocol Mapper "${this.mapperName}" not found in realm "${this.realmName}"`);
    }

    await this.core.clients.updateProtocolMapper(this.query, {
      ...data,
      id: this.clientProtocolMapper?.id,
      name: this.mapperName,
    });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Protocol Mapper "${this.mapperName}" not found in realm "${this.realmName}"`);
    }

    await this.core.clients.delProtocolMapper(this.query);
    this.clientProtocolMapper = null;
    return this.mapperName;
  }

  public async ensure(data: ProtocolMapperInputData) {
    this.clientProtocolMapperData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.clients.updateProtocolMapper(this.query, {
        ...data,
        id: this.clientProtocolMapper?.id,
        name: this.mapperName,
      });
    } else {
      await this.core.clients.addProtocolMapper(
        { realm: this.realmName, id: this.client.id! },
        { ...defaultProtocolMapperData, ...data, name: this.mapperName },
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.clients.delProtocolMapper(this.query);
      this.clientProtocolMapper = null;
    }

    return this.mapperName;
  }
}
