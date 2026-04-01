import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ProtocolMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import ClientScopeHandle from '../client-scope';
import { defaultProtocolMapperData, type ProtocolMapperInputData } from './protocol-mapper';

export default class ClientScopeProtocolMapperHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public clientScopeHandle: ClientScopeHandle;
  public scopeName: string;
  public clientScope?: ClientScopeRepresentation | null;
  public mapperName: string;
  public clientScopeProtocolMapper?: ProtocolMapperRepresentation | null;
  public clientScopeProtocolMapperData?: Omit<ProtocolMapperRepresentation, 'name | id'>;

  constructor(core: KeycloakAdminClient, clientScopeHandle: ClientScopeHandle, mapperName: string) {
    this.core = core;
    this.clientScopeHandle = clientScopeHandle;
    this.scopeName = clientScopeHandle.scopeName;
    this.clientScope = clientScopeHandle.clientScope ?? null;
    this.realmName = clientScopeHandle.realmName;
    this.mapperName = mapperName;
  }

  private getQuery(clientScope: ClientScopeRepresentation, mapperId: string) {
    return {
      realm: this.realmName,
      id: clientScope.id!,
      mapperId,
    };
  }

  private async resolveClientScope() {
    if (this.clientScope?.id) {
      return this.clientScope;
    }

    const clientScope = this.clientScopeHandle.clientScope ?? (await this.clientScopeHandle.get());
    if (!clientScope?.id) {
      throw new Error(`Client Scope "${this.scopeName}" not found in realm "${this.realmName}"`);
    }

    this.clientScope = clientScope;
    return clientScope;
  }

  public async getById(id: string) {
    const clientScope = await this.resolveClientScope();
    const one = await this.core.clientScopes.findProtocolMapper({
      realm: this.realmName,
      id: clientScope.id!,
      mapperId: id,
    });
    this.clientScopeProtocolMapper = one ?? null;

    if (this.clientScopeProtocolMapper) {
      this.mapperName = this.clientScopeProtocolMapper.name!;
    }

    return this.clientScopeProtocolMapper;
  }

  public async get(): Promise<ProtocolMapperRepresentation | null> {
    const clientScope = await this.resolveClientScope();
    const one = await this.core.clientScopes.findProtocolMapperByName({
      realm: this.realmName,
      id: clientScope.id!,
      name: this.mapperName,
    });
    this.clientScopeProtocolMapper = one ?? null;

    if (this.clientScopeProtocolMapper) {
      this.mapperName = this.clientScopeProtocolMapper.name!;
    }

    return this.clientScopeProtocolMapper;
  }

  public async create(data: ProtocolMapperInputData) {
    const clientScope = await this.resolveClientScope();

    if (await this.get()) {
      throw new Error(`Protocol Mapper "${this.mapperName}" already exists in client scope "${this.scopeName}"`);
    }

    await this.core.clientScopes.addProtocolMapper(
      { realm: this.realmName, id: clientScope.id! },
      { ...defaultProtocolMapperData, ...data, name: this.mapperName },
    );
    return this.get();
  }

  public async update(data: ProtocolMapperInputData) {
    const clientScope = await this.resolveClientScope();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Protocol Mapper "${this.mapperName}" not found in client scope "${this.scopeName}"`);
    }

    await this.core.clientScopes.updateProtocolMapper(this.getQuery(clientScope, one.id), {
      ...data,
      id: one.id,
      name: this.mapperName,
    });

    return this.get();
  }

  public async delete() {
    const clientScope = await this.resolveClientScope();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Protocol Mapper "${this.mapperName}" not found in client scope "${this.scopeName}"`);
    }

    await this.core.clientScopes.delProtocolMapper(this.getQuery(clientScope, one.id));
    this.clientScopeProtocolMapper = null;
    return this.mapperName;
  }

  public async ensure(data: ProtocolMapperInputData) {
    this.clientScopeProtocolMapperData = data;
    const clientScope = await this.resolveClientScope();

    const one = await this.get();

    if (one?.id) {
      await this.core.clientScopes.updateProtocolMapper(this.getQuery(clientScope, one.id), {
        ...data,
        id: one.id,
        name: this.mapperName,
      });
    } else {
      await this.core.clientScopes.addProtocolMapper(
        { realm: this.realmName, id: clientScope.id! },
        { ...defaultProtocolMapperData, ...data, name: this.mapperName },
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const clientScope = await this.resolveClientScope();
    const one = await this.get();
    if (one?.id) {
      await this.core.clientScopes.delProtocolMapper(this.getQuery(clientScope, one.id));
      this.clientScopeProtocolMapper = null;
    }

    return this.mapperName;
  }
}
