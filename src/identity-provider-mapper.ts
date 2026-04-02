import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import IdentityProviderMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation';
import IdentityProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation';
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
  return _merge({}, mapper, data, { name: mapperName, identityProviderAlias });
}

export default class IdentityProviderMapperHandle {
  public core: KeycloakAdminClient;
  public identityProviderHandle: IdentityProviderHandle;
  public realmName: string;
  public alias: string;
  public identityProvider?: IdentityProviderRepresentation | null;
  public mapperName: string;
  public identityProviderMapper?: IdentityProviderMapperRepresentation | null;
  public identityProviderMapperData?: IdentityProviderMapperInputData;

  constructor(core: KeycloakAdminClient, identityProviderHandle: IdentityProviderHandle, mapperName: string) {
    this.core = core;
    this.identityProviderHandle = identityProviderHandle;
    this.realmName = identityProviderHandle.realmName;
    this.alias = identityProviderHandle.alias;
    this.identityProvider = identityProviderHandle.identityProvider ?? null;
    this.mapperName = mapperName;
  }

  private getCurrentAlias() {
    return this.identityProviderHandle.identityProvider?.alias ?? this.identityProviderHandle.alias;
  }

  private async resolveIdentityProvider() {
    const identityProvider = this.identityProviderHandle.identityProvider ?? (await this.identityProviderHandle.get());
    this.alias = this.getCurrentAlias();
    if (!identityProvider?.alias) {
      throw new Error(`Identity Provider "${this.alias}" not found in realm "${this.realmName}"`);
    }

    this.identityProvider = identityProvider;
    this.alias = identityProvider.alias;
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
    this.identityProviderMapper = one ?? null;

    if (this.identityProviderMapper?.name) {
      this.mapperName = this.identityProviderMapper.name;
    }

    return this.identityProviderMapper;
  }

  public async get(): Promise<IdentityProviderMapperRepresentation | null> {
    const identityProvider = await this.resolveIdentityProvider();
    const mappers = await this.core.identityProviders.findMappers({
      realm: this.realmName,
      alias: identityProvider.alias,
    });
    this.identityProviderMapper = mappers.find((mapper) => mapper.name === this.mapperName) ?? null;

    if (this.identityProviderMapper?.name) {
      this.mapperName = this.identityProviderMapper.name;
    }

    return this.identityProviderMapper;
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

    this.identityProviderMapper = null;
    return this.mapperName;
  }

  public async ensure(data: IdentityProviderMapperInputData) {
    this.identityProviderMapperData = data;
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
      this.identityProviderMapper = null;
    }

    return this.mapperName;
  }
}
