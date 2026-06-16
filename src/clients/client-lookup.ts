import type { default as KeycloakAdminClient, ClientRepresentation } from '../keycloak-admin-client';
import { retryTransientAdminError } from '../utils/retry';

export async function getClientById(core: KeycloakAdminClient, realm: string, id: string) {
  const one = await retryTransientAdminError(() => core.clients.findOne({ realm, id }));
  return one ?? null;
}

export async function getClientByClientId(
  core: KeycloakAdminClient,
  realm: string,
  clientId: string,
): Promise<ClientRepresentation | null> {
  const ones = await retryTransientAdminError(() => core.clients.find({ realm, clientId }));
  return ones.find((v) => v.clientId === clientId) ?? null;
}
