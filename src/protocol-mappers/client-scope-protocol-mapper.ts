import { mergeUpdateData } from '../utils/merge-update-data';
import KeycloakAdminClient, {
  type ClientScopeRepresentation,
  type ProtocolMapperRepresentation,
} from '../keycloak-admin-client';
import ClientScopeHandle from '../client-scope';
import { defaultProtocolMapperData, type ProtocolMapperInputData } from './protocol-mapper';

function getClientScopeProtocolMapperUpdateData(
  mapper: ProtocolMapperRepresentation,
  data: ProtocolMapperInputData,
  mapperName: string,
) {
  return mergeUpdateData(mapper, data, { name: mapperName });
}

export default class ClientScopeProtocolMapperHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmName: string;
  public readonly clientScopeHandle: ClientScopeHandle;
  private _mapperName: string;
  private _clientScopeProtocolMapper?: ProtocolMapperRepresentation | null;

  constructor(core: KeycloakAdminClient, clientScopeHandle: ClientScopeHandle, mapperName: string) {
    this.core = core;
    this.clientScopeHandle = clientScopeHandle;
    this.realmName = clientScopeHandle.realmName;
    this._mapperName = mapperName;
  }

  public get mapperName(): string {
    return this._mapperName;
  }

  public get clientScopeProtocolMapper(): ProtocolMapperRepresentation | null | undefined {
    return this._clientScopeProtocolMapper;
  }

  /**
   * Re-targets this mapper handle to a different mapper-name identity and
   * clears the cached representation. Returns `this` for chaining.
   */
  public rebind(newMapperName: string): this {
    this._mapperName = newMapperName;
    this._clientScopeProtocolMapper = undefined;
    return this;
  }

  public get scopeName(): string {
    return this.clientScopeHandle.clientScope?.name ?? this.clientScopeHandle.scopeName;
  }

  public get clientScope(): ClientScopeRepresentation | null {
    return this.clientScopeHandle.clientScope ?? null;
  }

  private getCurrentScopeName() {
    return this.clientScopeHandle.clientScope?.name ?? this.clientScopeHandle.scopeName;
  }

  private getQuery(clientScope: ClientScopeRepresentation, mapperId: string) {
    return {
      realm: this.realmName,
      id: clientScope.id!,
      mapperId,
    };
  }

  private async resolveClientScope() {
    if (this.clientScopeHandle.clientScope?.id) {
      return this.clientScopeHandle.clientScope;
    }

    const clientScope = this.clientScopeHandle.clientScope ?? (await this.clientScopeHandle.get());
    const scopeName = this.getCurrentScopeName();
    if (!clientScope?.id) {
      throw new Error(`Client Scope "${scopeName}" not found in realm "${this.realmName}"`);
    }

    this.clientScopeHandle._setResolvedClientScope(clientScope, clientScope.name ?? this.clientScopeHandle.scopeName);
    return clientScope;
  }

  public async getById(id: string) {
    const clientScope = await this.resolveClientScope();
    const one = await this.core.clientScopes.findProtocolMapper({
      realm: this.realmName,
      id: clientScope.id!,
      mapperId: id,
    });
    this._clientScopeProtocolMapper = one ?? null;

    if (this._clientScopeProtocolMapper) {
      this._mapperName = this._clientScopeProtocolMapper.name!;
    }

    return this.clientScopeProtocolMapper ?? null;
  }

  public async get(): Promise<ProtocolMapperRepresentation | null> {
    const clientScope = await this.resolveClientScope();
    const one = await this.core.clientScopes.findProtocolMapperByName({
      realm: this.realmName,
      id: clientScope.id!,
      name: this.mapperName,
    });
    this._clientScopeProtocolMapper = one ?? null;

    if (this._clientScopeProtocolMapper) {
      this._mapperName = this._clientScopeProtocolMapper.name!;
    }

    return this.clientScopeProtocolMapper ?? null;
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
      ...getClientScopeProtocolMapperUpdateData(one, data, this.mapperName),
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
    this._clientScopeProtocolMapper = null;
    return this.mapperName;
  }

  public async ensure(data: ProtocolMapperInputData) {
    const clientScope = await this.resolveClientScope();

    const one = await this.get();

    if (one?.id) {
      await this.core.clientScopes.updateProtocolMapper(this.getQuery(clientScope, one.id), {
        ...getClientScopeProtocolMapperUpdateData(one, data, this.mapperName),
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
      this._clientScopeProtocolMapper = null;
    }

    return this.mapperName;
  }
}
