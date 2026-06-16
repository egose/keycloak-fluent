import KeycloakAdminClient, {
  type EffectiveMessageBundleRepresentation,
  type ServerInfoRepresentation,
} from './keycloak-admin-client';
import { retryTransientAdminError } from './utils/retry';

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
    return retryTransientAdminError(() => this.core.serverInfo.find({}));
  }

  public async getEffectiveMessageBundles(
    query: EffectiveMessageBundleQuery,
  ): Promise<EffectiveMessageBundleRepresentation[]> {
    return retryTransientAdminError(() => this.core.serverInfo.findEffectiveMessageBundles(query));
  }
}
