import type KeycloakAdminClientFluent from './index';
import type { ConnectionConfig } from './keycloak-admin-client';

export type ManagedKeycloakCredential = string | (() => string | Promise<string>);

type ManagedKeycloakClientBaseOptions = {
  /** Keycloak server URL. */
  baseUrl: string;
  /** Realm used to obtain the admin access token. Defaults to `master`. */
  authRealm?: string;
  /** OAuth client used for authentication. */
  clientId: string;
  /** Timeout in milliseconds for Keycloak requests, including authentication. */
  timeout?: number;
};

export type ManagedKeycloakClientCredentialsOptions = ManagedKeycloakClientBaseOptions & {
  /** Service-account authentication. This is the default mode. */
  authMode?: 'client_credentials';
  clientSecret: ManagedKeycloakCredential;
};

export type ManagedKeycloakUserCredentialsOptions = ManagedKeycloakClientBaseOptions & {
  /** Direct Access Grants authentication using a Keycloak user's credentials. */
  authMode: 'user_credentials';
  username: ManagedKeycloakCredential;
  password: ManagedKeycloakCredential;
  /** Optional secret when the OAuth client is confidential. */
  clientSecret?: ManagedKeycloakCredential;
};

export type ManagedKeycloakClientOptions =
  | ManagedKeycloakClientCredentialsOptions
  | ManagedKeycloakUserCredentialsOptions;

function requiredString(value: unknown, name: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`createManagedKeycloakClient requires a non-empty ${name}`);
  }

  return value.trim();
}

function validateCredential(value: unknown, name: string) {
  if (typeof value !== 'string' && typeof value !== 'function') {
    throw new Error(`createManagedKeycloakClient requires ${name} to be a string or function`);
  }
  if (typeof value === 'string' && !value) {
    throw new Error(`createManagedKeycloakClient requires a non-empty ${name}`);
  }
}

async function resolveCredential(value: ManagedKeycloakCredential, name: string) {
  const resolved = typeof value === 'function' ? await value() : value;
  if (typeof resolved !== 'string' || !resolved) {
    throw new Error(`createManagedKeycloakClient ${name} resolver returned an empty value`);
  }

  return resolved;
}

/**
 * Creates a client that authenticates lazily and refreshes expired access tokens
 * without timers. Concurrent requests share one authentication attempt.
 */
export function createManagedKeycloakClientWith(
  FluentClient: new (connectionConfig?: ConnectionConfig) => KeycloakAdminClientFluent,
  options: ManagedKeycloakClientOptions,
): KeycloakAdminClientFluent {
  if (!options) throw new Error('createManagedKeycloakClient requires options');
  const baseUrl = requiredString(options.baseUrl, 'baseUrl');
  const authRealm = options.authRealm === undefined ? 'master' : requiredString(options.authRealm, 'authRealm');
  const clientId = requiredString(options.clientId, 'clientId');
  if (
    options.authMode !== undefined &&
    options.authMode !== 'client_credentials' &&
    options.authMode !== 'user_credentials'
  ) {
    throw new Error('createManagedKeycloakClient authMode must be client_credentials or user_credentials');
  }

  if (options.authMode === 'user_credentials') {
    validateCredential(options.username, 'username');
    validateCredential(options.password, 'password');
    if (options.clientSecret !== undefined) validateCredential(options.clientSecret, 'clientSecret');
  } else {
    validateCredential(options.clientSecret, 'clientSecret');
  }

  const client = new FluentClient({ baseUrl, realmName: authRealm, timeout: options.timeout });
  let authentication: Promise<void> | undefined;

  const authenticate = () => {
    authentication ??= (async () => {
      if (options.authMode === 'user_credentials') {
        const [username, password, clientSecret] = await Promise.all([
          resolveCredential(options.username, 'username'),
          resolveCredential(options.password, 'password'),
          options.clientSecret === undefined ? undefined : resolveCredential(options.clientSecret, 'clientSecret'),
        ]);
        await client.simpleAuth({ clientId, clientSecret, username, password });
      } else {
        const clientSecret = await resolveCredential(options.clientSecret, 'clientSecret');
        await client.simpleAuth({ clientId, clientSecret });
      }
    })().finally(() => {
      authentication = undefined;
    });

    return authentication;
  };

  client.core.registerTokenProvider({
    async getAccessToken() {
      if (!client.core.accessToken || client.core.isTokenExpired()) await authenticate();
      return client.core.accessToken;
    },
  });

  return client;
}
