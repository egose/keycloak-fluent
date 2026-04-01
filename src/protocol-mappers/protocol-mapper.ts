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
  public client?: ClientRepresentation | null;
  public mapperName: string;
  public clientProtocolMapper?: ProtocolMapperRepresentation | null;
  public clientProtocolMapperData?: Omit<ProtocolMapperRepresentation, 'name | id'>;

  constructor(core: KeycloakAdminClient, clientHandle: ClientHandle, mapperName: string) {
    this.core = core;
    this.clientHandle = clientHandle;
    this.clientId = clientHandle.clientId;
    this.client = clientHandle.client ?? null;
    this.realmName = clientHandle.realmName;
    this.mapperName = mapperName;
  }

  private getQuery(client: ClientRepresentation, mapperId: string) {
    return {
      realm: this.realmName,
      id: client.id!,
      mapperId,
    };
  }

  private async resolveClient() {
    if (this.client?.id) {
      return this.client;
    }

    const client = await ClientHandle.getByClientId(this.core, this.realmName, this.clientId);
    if (!client) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    this.client = client;
    return client;
  }

  public async getById(id: string) {
    const client = await this.resolveClient();
    const one = await this.core.clients.findProtocolMapperById({
      realm: this.realmName,
      id: client.id!,
      mapperId: id,
    });
    this.clientProtocolMapper = one ?? null;

    if (this.clientProtocolMapper) {
      this.mapperName = this.clientProtocolMapper.name!;
    }

    return this.clientProtocolMapper;
  }

  public async get(): Promise<ProtocolMapperRepresentation | null> {
    const client = await this.resolveClient();
    const one = await this.core.clients.findProtocolMapperByName({
      realm: this.realmName,
      id: client.id!,
      name: this.mapperName,
    });
    this.clientProtocolMapper = one ?? null;

    if (this.clientProtocolMapper) {
      this.mapperName = this.clientProtocolMapper.name!;
    }

    return this.clientProtocolMapper;
  }

  public async create(data: ProtocolMapperInputData) {
    const client = await this.resolveClient();

    if (await this.get()) {
      throw new Error(`Protocol Mapper "${this.mapperName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.clients.addProtocolMapper(
      { realm: this.realmName, id: client.id! },
      { ...defaultProtocolMapperData, ...data, name: this.mapperName },
    );
    return this.get();
  }

  public async update(data: ProtocolMapperInputData) {
    const client = await this.resolveClient();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Protocol Mapper "${this.mapperName}" not found in realm "${this.realmName}"`);
    }

    await this.core.clients.updateProtocolMapper(this.getQuery(client, one.id), {
      ...data,
      id: one.id,
      name: this.mapperName,
    });

    return this.get();
  }

  public async delete() {
    const client = await this.resolveClient();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Protocol Mapper "${this.mapperName}" not found in realm "${this.realmName}"`);
    }

    await this.core.clients.delProtocolMapper(this.getQuery(client, one.id));
    this.clientProtocolMapper = null;
    return this.mapperName;
  }

  public async ensure(data: ProtocolMapperInputData) {
    this.clientProtocolMapperData = data;
    const client = await this.resolveClient();

    const one = await this.get();

    if (one?.id) {
      await this.core.clients.updateProtocolMapper(this.getQuery(client, one.id), {
        ...data,
        id: one.id,
        name: this.mapperName,
      });
    } else {
      await this.core.clients.addProtocolMapper(
        { realm: this.realmName, id: client.id! },
        { ...defaultProtocolMapperData, ...data, name: this.mapperName },
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const client = await this.resolveClient();
    const one = await this.get();
    if (one?.id) {
      await this.core.clients.delProtocolMapper(this.getQuery(client, one.id));
      this.clientProtocolMapper = null;
    }

    return this.mapperName;
  }
}
