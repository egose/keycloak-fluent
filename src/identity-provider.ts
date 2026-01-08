import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import IdentityProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation';
import RealmHandle from './realm';

export type IdentityProviderProviderId =
  | 'saml'
  | 'oauth2'
  | 'oidc'
  | 'keycloak-oidc'
  | 'google'
  | 'facebook'
  | 'twitter'
  | 'linkedin-openid-connect'
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'paypal'
  | 'openshift-v4'
  | 'microsoft'
  | 'stackoverflow';

export const defaultIdentityProviderData = Object.freeze({
  displayName: '',
  providerId: '',
  config: {
    metadataDescriptorUrl: '',
    authorizationUrl: '',
    tokenUrl: '',
    jwksUrl: '',
    logoutUrl: '',
    userInfoUrl: '',
    tokenIntrospectionUrl: '',
    issuer: '',
    clientAuthMethod: 'client_secret_post',
    clientId: '',
    clientSecret: '',
    clientAssertionSigningAlg: '',
    useJwksUrl: 'false',
    validateSignature: 'false',
    pkceEnabled: 'false',
    guiOrder: '',
  },
});

export interface IdentityProviderRepresentationExt extends IdentityProviderRepresentation {
  providerId?: IdentityProviderProviderId;
}

export type IdentityProviderInputData = Omit<IdentityProviderRepresentationExt, 'alias'>;

const getIdentityProviderDataDefaults = (data: Partial<IdentityProviderInputData>) => {
  const merged: IdentityProviderInputData = _merge({}, defaultIdentityProviderData, data);
  if (!merged.config) merged.config = {};

  if (merged.config.jwksUrl !== '') {
    merged.config.useJwksUrl = 'true';
  }

  return merged;
};

export default class IdentityProviderHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public alias: string;
  public identityProvider?: IdentityProviderRepresentation | null;
  public identityProviderData?: IdentityProviderInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, alias: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.alias = alias;
  }

  public async get(): Promise<IdentityProviderRepresentation | null> {
    const one = await this.core.identityProviders.findOne({ realm: this.realmName, alias: this.alias });
    this.identityProvider = one ?? null;

    if (this.identityProvider) {
      this.alias = this.identityProvider.alias!;
    }

    return this.identityProvider;
  }

  public async create(data: IdentityProviderInputData) {
    if (await this.get()) {
      throw new Error(`Identity Provider "${this.alias}" already exists in realm "${this.realmName}"`);
    }

    await this.core.identityProviders.create({
      ...getIdentityProviderDataDefaults(data),
      realm: this.realmName,
      alias: this.alias,
    });
    return this.get();
  }

  public async update(data: IdentityProviderInputData) {
    const one = await this.get();
    if (!one?.alias) {
      throw new Error(`Identity Provider "${this.alias}" not found in realm "${this.realmName}"`);
    }

    await this.core.identityProviders.update(
      { realm: this.realmName, alias: one.alias },
      { ...data, alias: this.alias },
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.alias) {
      throw new Error(`Identity Provider "${this.alias}" not found in realm "${this.realmName}"`);
    }

    await this.core.identityProviders.del({ realm: this.realmName, alias: one.alias });

    this.identityProvider = null;
    return this.alias;
  }

  public async ensure(data: IdentityProviderInputData) {
    this.identityProviderData = data;

    const one = await this.get();

    if (one?.alias) {
      await this.core.identityProviders.update(
        { realm: this.realmName, alias: one.alias },
        { ...data, alias: this.alias },
      );
    } else {
      await this.core.identityProviders.create({
        ...getIdentityProviderDataDefaults(data),
        realm: this.realmName,
        alias: this.alias,
      });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.alias) {
      await this.core.identityProviders.del({ realm: this.realmName, alias: one.alias });
      this.identityProvider = null;
    }

    return this.alias;
  }
}
