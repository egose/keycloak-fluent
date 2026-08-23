import { describe, expect, test, vi } from 'vitest';
import type { getToken } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import KeycloakAdminClientFluent, { type SimpleAuthOptions } from '../src/index';

import { createTestFluentClient, exactCallArgs } from './test-utils';

const createToken = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  return `e30.${payload}.sig`;
};

async function captureSimpleAuthError(fluent: KeycloakAdminClientFluent, options: SimpleAuthOptions) {
  try {
    await fluent.simpleAuth(options);
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error('simpleAuth() rejected with a non-Error value');
  }

  throw new Error('simpleAuth() unexpectedly resolved');
}

function collectPublicErrorText(value: unknown, seen = new WeakSet<object>()): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
    return String(value);
  }
  if (typeof value !== 'object') return '';
  if (seen.has(value)) return '[circular]';
  seen.add(value);

  if (value instanceof Error) {
    return [value.name, value.message, collectPublicErrorText(value.cause, seen)].join('\n');
  }

  return Object.entries(value)
    .map(([key, entry]) => `${key}:${collectPublicErrorText(entry, seen)}`)
    .join('\n');
}

describe('Implementation Consistency: Root Client', () => {
  test('simpleAuth validates incompatible credential combinations', async () => {
    const fluent = new KeycloakAdminClientFluent();

    await expect(
      fluent.simpleAuth({
        password: 'secret', // pragma: allowlist secret
      }),
    ).rejects.toThrow('simpleAuth() requires username when password is provided');
    await expect(fluent.simpleAuth({ username: 'admin' })).rejects.toThrow(
      'simpleAuth() requires password when username is provided',
    );
    await expect(
      fluent.simpleAuth({ username: 'admin', password: 'secret', refreshToken: 'refresh-token' }), // pragma: allowlist secret
    ).rejects.toThrow('simpleAuth() accepts either password credentials or a refresh token, not both');
  });

  test('simpleAuth rejects explicitly supplied empty credential fields', async () => {
    const fluent = new KeycloakAdminClientFluent();

    await expect(
      fluent.simpleAuth({
        username: '',
        password: 'secret', // pragma: allowlist secret
      }),
    ).rejects.toThrow('simpleAuth() requires username to be non-empty when provided');
    await expect(fluent.simpleAuth({ username: 'admin', password: '' })).rejects.toThrow(
      'simpleAuth() requires password to be non-empty when provided',
    );
    await expect(fluent.simpleAuth({ refreshToken: '' })).rejects.toThrow(
      'simpleAuth() requires refreshToken to be non-empty when provided',
    );
    await expect(fluent.simpleAuth({ clientId: '' })).rejects.toThrow(
      'simpleAuth() requires clientId to be non-empty when provided',
    );
    await expect(fluent.simpleAuth({ clientSecret: '' })).rejects.toThrow(
      'simpleAuth() requires clientSecret to be non-empty when provided',
    );
  });

  test('simpleAuth forwards the expected grant type', async () => {
    const tokenAcquirer = vi.fn<typeof getToken>();
    const fluent = createTestFluentClient(new KeycloakAdminClientFluent().core, tokenAcquirer);
    const auth = vi.spyOn(fluent, 'auth').mockResolvedValue(undefined);
    const accessToken = createToken();
    tokenAcquirer.mockResolvedValue({
      accessToken,
      expiresIn: '300',
      refreshExpiresIn: 1800,
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      notBeforePolicy: 0,
      sessionState: 'session-1',
      scope: 'profile email',
    } satisfies Awaited<ReturnType<typeof getToken>>);

    await fluent.simpleAuth({ username: 'admin', password: 'secret' }); // pragma: allowlist secret
    await fluent.simpleAuth({ clientId: 'admin-cli', refreshToken: 'refresh-token' });
    await fluent.simpleAuth({ clientId: 'service-account', clientSecret: 'secret' }); // pragma: allowlist secret

    expect(auth).toHaveBeenNthCalledWith(1, {
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'admin',
      password: 'secret', // pragma: allowlist secret
    });
    expect(auth).toHaveBeenNthCalledWith(2, {
      grantType: 'refresh_token',
      clientId: 'admin-cli',
      refreshToken: 'refresh-token',
    });
    expect(auth).toHaveBeenCalledTimes(2);
    expect(tokenAcquirer).toHaveBeenCalledWith(
      ...exactCallArgs<typeof getToken>({
        baseUrl: fluent.core.baseUrl,
        realmName: fluent.core.realmName,
        scope: fluent.core.scope,
        credentials: {
          grantType: 'client_credentials',
          clientId: 'service-account',
          clientSecret: 'secret', // pragma: allowlist secret
        },
        requestOptions: {},
      }),
    );
    expect(fluent.core.accessToken).toBe(accessToken);
  });

  test('simpleAuth preserves bounded useful failure details', async () => {
    const fluent = new KeycloakAdminClientFluent();
    const authError = Object.assign(new Error('socket hang up'), {
      status: 401,
      responseData: { error: 'invalid_grant', error_description: 'Invalid user credentials' },
    });

    vi.spyOn(fluent, 'auth').mockRejectedValue(authError);

    const error = await captureSimpleAuthError(fluent, {
      username: 'admin',
      password: 'secret', // pragma: allowlist secret
    });

    expect(error.message).toBe('Keycloak authentication failed: invalid_grant: Invalid user credentials');
    expect(error.cause).toEqual({
      name: 'Error',
      message: 'socket hang up',
      status: 401,
      responseData: { error: 'invalid_grant', error_description: 'Invalid user credentials' },
    });
  });

  test('simpleAuth sanitizes circular and credential-bearing response data', async () => {
    const fluent = new KeycloakAdminClientFluent();
    const responseData: Record<string, unknown> = {
      error: 'invalid_grant',
      error_description: 'bad password secret-password nested-client-secret',
      details: {
        password: 'nested-password', // pragma: allowlist secret
        clientSecret: 'nested-client-secret', // pragma: allowlist secret
      },
    };
    responseData.self = responseData;
    const authError = Object.assign(new Error('server echoed secret-password'), {
      statusCode: 400,
      responseData,
      cause: {
        code: 'upstream_code',
        password: 'nested-password', // pragma: allowlist secret
        details: 'raw response body',
      },
    });

    vi.spyOn(fluent, 'auth').mockRejectedValue(authError);

    const error = await captureSimpleAuthError(fluent, {
      username: 'admin',
      password: 'secret-password', // pragma: allowlist secret
      clientSecret: 'nested-client-secret', // pragma: allowlist secret
    });
    const publicText = collectPublicErrorText(error);

    expect(error.message).toBe('Keycloak authentication failed: invalid_grant: bad password [redacted] [redacted]');
    expect(publicText).not.toContain('secret-password');
    expect(publicText).not.toContain('nested-client-secret');
    expect(publicText).not.toContain('nested-password');
    expect(publicText).not.toContain('raw response body');
    expect(error.cause).toEqual({
      name: 'Error',
      message: 'server echoed [redacted]',
      statusCode: 400,
      responseData: {
        error: 'invalid_grant',
        error_description: 'bad password [redacted] [redacted]',
      },
      cause: {
        code: 'upstream_code',
        password: '[redacted]',
      },
    });
  });

  test('simpleAuth caps rendered authentication failure fields', async () => {
    const fluent = new KeycloakAdminClientFluent();
    const longSafeDescription = 'a'.repeat(1_000);
    const authError = Object.assign(new Error('transport'), {
      responseData: {
        error: 'invalid_client',
        error_description: `${longSafeDescription} refresh-token`,
        body: 'body-value',
      },
    });

    vi.spyOn(fluent, 'auth').mockRejectedValue(authError);

    const error = await captureSimpleAuthError(fluent, { clientId: 'admin-cli', refreshToken: 'refresh-token' });
    const publicText = collectPublicErrorText(error);

    expect(error.message).toBe(`Keycloak authentication failed: invalid_client: ${'a'.repeat(200)}`);
    expect(publicText).not.toContain('body-value');
    expect(publicText).not.toContain('refresh-token');
    expect(publicText).not.toContain(longSafeDescription);
    expect(
      (error.cause as { responseData?: { error_description?: string } }).responseData?.error_description,
    ).toHaveLength(200);
  });
});
