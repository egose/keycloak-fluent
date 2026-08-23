import { describe, expect, test, vi } from 'vitest';
import { getToken } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import KeycloakAdminClientFluent from '../src/index';

vi.mock('@keycloak/keycloak-admin-client/lib/utils/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@keycloak/keycloak-admin-client/lib/utils/auth')>();
  return {
    ...actual,
    getToken: vi.fn(),
  };
});

const createToken = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  return `e30.${payload}.sig`;
};

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

  test('simpleAuth forwards the expected grant type', async () => {
    const fluent = new KeycloakAdminClientFluent();
    const auth = vi.spyOn(fluent, 'auth').mockResolvedValue(undefined);
    const accessToken = createToken();
    vi.mocked(getToken).mockResolvedValue({ accessToken } as Awaited<ReturnType<typeof getToken>>);

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
    expect(getToken).toHaveBeenCalledWith({
      baseUrl: fluent.core.baseUrl,
      realmName: fluent.core.realmName,
      scope: fluent.core.scope,
      credentials: {
        grantType: 'client_credentials',
        clientId: 'service-account',
        clientSecret: 'secret', // pragma: allowlist secret
      },
      requestOptions: {},
    });
    expect(fluent.core.accessToken).toBe(accessToken);
  });

  test('simpleAuth preserves useful failure details', async () => {
    const fluent = new KeycloakAdminClientFluent();
    const authError = Object.assign(new Error('socket hang up'), {
      responseData: { error: 'invalid_grant' },
    });

    vi.spyOn(fluent, 'auth').mockRejectedValue(authError);

    await expect(
      fluent.simpleAuth({
        username: 'admin',
        password: 'secret', // pragma: allowlist secret
      }),
    ).rejects.toThrow('Keycloak authentication failed: {"error":"invalid_grant"}');
  });
});
