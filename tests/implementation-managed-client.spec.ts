import { describe, expect, test, vi } from 'vitest';
import { createManagedKeycloakClient } from '../src/index';

describe('Managed Keycloak client', () => {
  test('authenticates client credentials lazily and reuses a valid token', async () => {
    const client = createManagedKeycloakClient({
      baseUrl: 'https://keycloak.example.com',
      clientId: 'user-sync',
      clientSecret: 'secret', // pragma: allowlist secret
    });
    const auth = vi.spyOn(client, 'simpleAuth').mockImplementation(async () => {
      client.core.accessToken = 'access-token';
    });
    vi.spyOn(client.core, 'isTokenExpired').mockReturnValue(false);

    await expect(client.core.getAccessToken()).resolves.toBe('access-token');
    await expect(client.core.getAccessToken()).resolves.toBe('access-token');

    expect(auth).toHaveBeenCalledOnce();
    expect(auth).toHaveBeenCalledWith({ clientId: 'user-sync', clientSecret: 'secret' }); // pragma: allowlist secret
  });

  test('resolves user credentials lazily and shares concurrent authentication', async () => {
    const username = vi.fn(async () => 'admin');
    const password = vi.fn(async () => 'rotated-password'); // pragma: allowlist secret
    const client = createManagedKeycloakClient({
      baseUrl: 'https://keycloak.example.com',
      authRealm: 'administration',
      authMode: 'user_credentials',
      clientId: 'admin-cli',
      username,
      password,
    });
    let finishAuthentication!: () => void;
    const blocked = new Promise<void>((resolve) => {
      finishAuthentication = resolve;
    });
    const auth = vi.spyOn(client, 'simpleAuth').mockImplementation(async () => {
      await blocked;
      client.core.accessToken = 'access-token';
    });

    const first = client.core.getAccessToken();
    const second = client.core.getAccessToken();
    await vi.waitFor(() => expect(auth).toHaveBeenCalledOnce());
    finishAuthentication();

    await expect(Promise.all([first, second])).resolves.toEqual(['access-token', 'access-token']);
    expect(username).toHaveBeenCalledOnce();
    expect(password).toHaveBeenCalledOnce();
    expect(auth).toHaveBeenCalledWith({
      clientId: 'admin-cli',
      clientSecret: undefined,
      username: 'admin',
      password: 'rotated-password', // pragma: allowlist secret
    });
    expect(client.core.realmName).toBe('administration');
  });

  test('validates credentials for the selected mode', () => {
    expect(() =>
      createManagedKeycloakClient({
        baseUrl: 'https://keycloak.example.com',
        authMode: 'user_credentials',
        clientId: 'admin-cli',
        username: '',
        password: 'secret', // pragma: allowlist secret
      }),
    ).toThrow('non-empty username');
  });
});
