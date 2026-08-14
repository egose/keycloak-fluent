import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, {
  type IdentityProviderMapperRepresentation,
  type IdentityProviderRepresentation,
} from './keycloak-admin-client';
import IdentityProviderHandle from './identity-provider';

export type IdentityProviderMapperInputData = Omit<
  IdentityProviderMapperRepresentation,
  'id' | 'name' | 'identityProviderAlias'
>;

function getIdentityProviderMapperUpdateData(
  mapper: IdentityProviderMapperRepresentation,
  data: IdentityProviderMapperInputData,
  mapperName: string,
  identityProviderAlias: string,
) {
  return mergeUpdateData(mapper, data, { name: mapperName, identityProviderAlias });
}

export default class IdentityProviderMapperHandle {
  public readonly core: KeycloakAdminClient;
  public readonly identityProviderHandle: IdentityProviderHandle;
  public readonly realmName: string;
  private _alias: string;
  private _identityProvider?: IdentityProviderRepresentation | null;
  private _mapperName: string;
  private _identityProviderMapper?: IdentityProviderMapperRepresentation | null;

  constructor(core: KeycloakAdminClient, identityProviderHandle: IdentityProviderHandle, mapperName: string) {
    this.core = core;
    this.identityProviderHandle = identityProviderHandle;
    this.realmName = identityProviderHandle.realmName;
    this._alias = identityProviderHandle.alias;
    this._identityProvider = identityProviderHandle.identityProvider ?? null;
    this._mapperName = mapperName;
  }

  public get alias(): string {
    return this._alias;
  }

  public get identityProvider(): IdentityProviderRepresentation | null | undefined {
    return this._identityProvider;
  }

  public get mapperName(): string {
    return this._mapperName;
  }

  public get identityProviderMapper(): IdentityProviderMapperRepresentation | null | undefined {
    return this._identityProviderMapper;
  }

  /**
   * Re-targets this mapper handle to a different mapper-name identity and
   * clears the cached mapper representation. Returns `this` for chaining.
   */
  public rebind(newMapperName: string): this {
    this._mapperName = newMapperName;
    this._identityProviderMapper = undefined;
    return this;
  }

  private getCurrentAlias() {
    return this.identityProviderHandle.identityProvider?.alias ?? this.identityProviderHandle.alias;
  }

  private async resolveIdentityProvider() {
    const identityProvider = this.identityProviderHandle.identityProvider ?? (await this.identityProviderHandle.get());
    this._alias = this.getCurrentAlias();
    if (!identityProvider?.alias) {
      throw new Error(`Identity Provider "${this.alias}" not found in realm "${this.realmName}"`);
    }

    this._identityProvider = identityProvider;
    this._alias = identityProvider.alias;
    return identityProvider as IdentityProviderRepresentation & { alias: string };
  }

  private toPayload(data: IdentityProviderMapperInputData, id?: string): IdentityProviderMapperRepresentation {
    const alias = this.getCurrentAlias();

    return {
      ...data,
      ...(id ? { id } : {}),
      name: this.mapperName,
      identityProviderAlias: alias,
    };
  }

  private getUpdatePayload(mapper: IdentityProviderMapperRepresentation, data: IdentityProviderMapperInputData) {
    return getIdentityProviderMapperUpdateData(mapper, data, this.mapperName, this.getCurrentAlias());
  }

  public async getById(id: string) {
    const identityProvider = await this.resolveIdentityProvider();
    const one = await this.core.identityProviders.findOneMapper({
      realm: this.realmName,
      alias: identityProvider.alias,
      id,
    });
    this._identityProviderMapper = one ?? null;

    if (this._identityProviderMapper?.name) {
      this._mapperName = this._identityProviderMapper.name;
    }

    return this.identityProviderMapper ?? null;
  }

  public async get(): Promise<IdentityProviderMapperRepresentation | null> {
    const identityProvider = await this.resolveIdentityProvider();
    const mappers = await this.core.identityProviders.findMappers({
      realm: this.realmName,
      alias: identityProvider.alias,
    });
    this._identityProviderMapper = mappers.find((mapper) => mapper.name === this.mapperName) ?? null;

    if (this._identityProviderMapper?.name) {
      this._mapperName = this._identityProviderMapper.name;
    }

    return this.identityProviderMapper ?? null;
  }

  public async create(data: IdentityProviderMapperInputData) {
    const identityProvider = await this.resolveIdentityProvider();

    if (await this.get()) {
      throw new Error(
        `Identity Provider Mapper "${this.mapperName}" already exists on identity provider "${identityProvider.alias}"`,
      );
    }

    await this.core.identityProviders.createMapper({
      realm: this.realmName,
      alias: identityProvider.alias,
      identityProviderMapper: this.toPayload(data),
    });

    return this.get();
  }

  public async update(data: IdentityProviderMapperInputData) {
    const identityProvider = await this.resolveIdentityProvider();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(
        `Identity Provider Mapper "${this.mapperName}" not found on identity provider "${identityProvider.alias}"`,
      );
    }

    await this.core.identityProviders.updateMapper(
      {
        realm: this.realmName,
        alias: identityProvider.alias,
        id: one.id,
      },
      this.getUpdatePayload(one, data),
    );

    return this.get();
  }

  public async delete() {
    const identityProvider = await this.resolveIdentityProvider();
    const one = await this.get();
    if (!one?.id) {
      throw new Error(
        `Identity Provider Mapper "${this.mapperName}" not found on identity provider "${identityProvider.alias}"`,
      );
    }

    await this.core.identityProviders.delMapper({
      realm: this.realmName,
      alias: identityProvider.alias,
      id: one.id,
    });

    this._identityProviderMapper = null;
    return this.mapperName;
  }

  public async ensure(data: IdentityProviderMapperInputData) {
    const identityProvider = await this.resolveIdentityProvider();
    const one = await this.get();

    if (one?.id) {
      await this.core.identityProviders.updateMapper(
        {
          realm: this.realmName,
          alias: identityProvider.alias,
          id: one.id,
        },
        this.getUpdatePayload(one, data),
      );
    } else {
      await this.core.identityProviders.createMapper({
        realm: this.realmName,
        alias: identityProvider.alias,
        identityProviderMapper: this.toPayload(data),
      });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const identityProvider = await this.resolveIdentityProvider();
    const one = await this.get();
    if (one?.id) {
      await this.core.identityProviders.delMapper({
        realm: this.realmName,
        alias: identityProvider.alias,
        id: one.id,
      });
      this._identityProviderMapper = null;
    }

    return this.mapperName;
  }
}
