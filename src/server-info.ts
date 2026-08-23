import KeycloakAdminClient, {
  type EffectiveMessageBundleRepresentation,
  type ServerInfoRepresentation,
} from './keycloak-admin-client';
import { retryTransientAdminReadError } from './utils/retry';

export type EffectiveMessageBundleQuery = {
  realm: string;
  theme?: string;
  themeType?: string;
  locale?: string;
  source?: boolean;
};

export default class ServerInfoHandle {
  public core: KeycloakAdminClient;

  constructor(core: KeycloakAdminClient) {
    this.core = core;
  }

  public async get(): Promise<ServerInfoRepresentation> {
    return retryTransientAdminReadError(() => this.core.serverInfo.find({}));
  }

  public async getEffectiveMessageBundles(
    query: EffectiveMessageBundleQuery,
  ): Promise<EffectiveMessageBundleRepresentation[]> {
    return retryTransientAdminReadError(() => this.core.serverInfo.findEffectiveMessageBundles(query));
  }
}
