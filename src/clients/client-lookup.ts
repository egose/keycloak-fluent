import type { default as KeycloakAdminClient, ClientRepresentation } from '../keycloak-admin-client';
import { retryTransientAdminReadError } from '../utils/retry';

export async function getClientById(core: KeycloakAdminClient, realm: string, id: string) {
  const one = await retryTransientAdminReadError(() => core.clients.findOne({ realm, id }));
  return one ?? null;
}

export async function getClientByClientId(
  core: KeycloakAdminClient,
  realm: string,
  clientId: string,
): Promise<ClientRepresentation | null> {
  const ones = await retryTransientAdminReadError(() => core.clients.find({ realm, clientId }));
  return ones.find((v) => v.clientId === clientId) ?? null;
}
