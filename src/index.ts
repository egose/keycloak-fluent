import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { ConnectionConfig, TokenProvider } from '@keycloak/keycloak-admin-client/lib/client';
import { defaultBaseUrl, defaultRealm } from '@keycloak/keycloak-admin-client/lib/utils/constants';
import { RequestArgs } from '@keycloak/keycloak-admin-client/lib/resources/agent';
import { getToken, Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import { GrantTypes } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import RealmHandle from './realm';

export default class KeycloakAdminClientFluent {
  public core: KeycloakAdminClient;

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
  }: {
    username?: string;
    password?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
  }) {
    const grantType: GrantTypes = password ? 'password' : refreshToken ? 'refresh_token' : 'client_credentials';

    try {
      await this.auth({
        grantType,
        clientId,
        clientSecret,
        username,
        password,
        refreshToken,
      });
    } catch (error: any) {
      throw Error(JSON.stringify(error.responseData));
    }
  }

  realm(name: string) {
    return new RealmHandle(this.core, name);
  }
}
