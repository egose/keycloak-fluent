import KeycloakAdminClient, { type ConnectionConfig, type Credentials, type GrantTypes } from './keycloak-admin-client';
import { getToken } from '@keycloak/keycloak-admin-client/lib/utils/auth.js';
import RealmHandle from './realm';
import ServerInfoHandle from './server-info';
import WhoAmIHandle from './who-am-i';
import { createManagedKeycloakClientWith, type ManagedKeycloakClientOptions } from './managed-client';

type SimpleAuthOptions = {
  username?: string;
  password?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
};

function getSimpleAuthGrantType({
  password,
  refreshToken,
}: Pick<SimpleAuthOptions, 'password' | 'refreshToken'>): GrantTypes {
  if (password) return 'password';
  if (refreshToken) return 'refresh_token';

  return 'client_credentials';
}

function validateSimpleAuthOptions({ username, password, refreshToken }: SimpleAuthOptions) {
  if (password && refreshToken) {
    throw new Error('simpleAuth() accepts either password credentials or a refresh token, not both');
  }

  if (password && !username) {
    throw new Error('simpleAuth() requires username when password is provided');
  }

  if (username && !password) {
    throw new Error('simpleAuth() requires password when username is provided');
  }
}

function getSimpleAuthErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'responseData' in error) {
    const responseData = (error as { responseData?: unknown }).responseData;
    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (responseData !== undefined) {
      try {
        return JSON.stringify(responseData);
      } catch {
        return String(responseData);
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'unknown authentication error';
}

export default class KeycloakAdminClientFluent {
  public readonly core: KeycloakAdminClient;

  constructor(connectionConfig?: ConnectionConfig) {
    this.core = new KeycloakAdminClient(connectionConfig);
  }

  public async auth(credentials: Credentials) {
    return this.core.auth(credentials);
  }

  public async simpleAuth({
    username,
    password,
    refreshToken,
    clientId = 'admin-cli',
    clientSecret,
  }: SimpleAuthOptions) {
    validateSimpleAuthOptions({ username, password, refreshToken, clientId, clientSecret });
    const grantType = getSimpleAuthGrantType({ password, refreshToken });

    try {
      const credentials: Credentials = {
        grantType,
        clientId,
      };

      if (clientSecret !== undefined) credentials.clientSecret = clientSecret;
      if (username !== undefined) credentials.username = username;
      if (password !== undefined) credentials.password = password;
      if (refreshToken !== undefined) credentials.refreshToken = refreshToken;

      if (grantType === 'client_credentials') {
        const { accessToken } = await getToken({
          baseUrl: this.core.baseUrl,
          realmName: this.core.realmName,
          scope: this.core.scope,
          credentials,
          requestOptions: {
            ...this.core.getRequestOptions(),
            ...(this.core.timeout ? { signal: AbortSignal.timeout(this.core.timeout) } : {}),
          },
        });
        this.core.setAccessToken(accessToken);
        return;
      }

      await this.auth(credentials);
    } catch (error) {
      throw new Error(`Keycloak authentication failed: ${getSimpleAuthErrorMessage(error)}`, {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  realm(name: string) {
    return new RealmHandle(this.core, name);
  }

  public serverInfo() {
    return new ServerInfoHandle(this.core);
  }

  public whoAmI(currentRealm: string, realmName?: string) {
    return new WhoAmIHandle(this.core, currentRealm, realmName);
  }

  public async searchRealms(keyword: string) {
    const result = await this.core.realms.find({
      briefRepresentation: false,
    });

    const lowerkeyword = keyword.toLocaleLowerCase();

    return result.filter((item) => {
      if (!item.realm) return false;

      return item.realm.toLocaleLowerCase().includes(lowerkeyword);
    });
  }
}

export function createManagedKeycloakClient(options: ManagedKeycloakClientOptions): KeycloakAdminClientFluent {
  return createManagedKeycloakClientWith(KeycloakAdminClientFluent, options);
}

export type {
  ManagedKeycloakClientCredentialsOptions,
  ManagedKeycloakClientOptions,
  ManagedKeycloakCredential,
  ManagedKeycloakUserCredentialsOptions,
} from './managed-client';

export type { ReconcileRealmRolesOptions, ReconcileUserAttributesOptions, UserInputData } from './user';
