import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type EffectiveMessageBundleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/effectiveMessageBundleRepresentation';
import type { ServerInfoRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation';

function isTransientAdminError(error: unknown) {
  return error instanceof Error && error.message.includes('unknown_error');
}

async function retryTransientAdminError<T>(operation: () => Promise<T>, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientAdminError(error) || attempt === attempts - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }

  throw new Error('Unreachable');
}

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
