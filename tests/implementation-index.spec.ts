import { describe, expect, test, vi } from 'vitest';
import KeycloakAdminClientFluent from '../src/index';

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

    await fluent.simpleAuth({ username: 'admin', password: 'secret' }); // pragma: allowlist secret
    await fluent.simpleAuth({ clientId: 'admin-cli', refreshToken: 'refresh-token' });
    await fluent.simpleAuth({ clientId: 'service-account', clientSecret: 'secret' }); // pragma: allowlist secret

    expect(auth).toHaveBeenNthCalledWith(1, {
      grantType: 'password',
      clientId: 'admin-cli',
      clientSecret: undefined,
      username: 'admin',
      password: 'secret', // pragma: allowlist secret
      refreshToken: undefined,
    });
    expect(auth).toHaveBeenNthCalledWith(2, {
      grantType: 'refresh_token',
      clientId: 'admin-cli',
      clientSecret: undefined,
      username: undefined,
      password: undefined,
      refreshToken: 'refresh-token',
    });
    expect(auth).toHaveBeenNthCalledWith(3, {
      grantType: 'client_credentials',
      clientId: 'service-account',
      clientSecret: 'secret', // pragma: allowlist secret
      username: undefined,
      password: undefined,
      refreshToken: undefined,
    });
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
