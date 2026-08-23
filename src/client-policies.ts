import KeycloakAdminClient, {
  type ClientPoliciesRepresentation,
  type ClientProfilesRepresentation,
} from './keycloak-admin-client';
import RealmHandle from './realm';
import { retry, type RetryOptions } from './utils/retry';

/**
 * Reads are side-effect-free and inherently replay-safe.
 */
const readRetryOptions: RetryOptions = { idempotent: true };

export default class ClientPoliciesHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle) {
    this.core = core;
    this.realmHandle = realmHandle;
  }

  public get realmName(): string {
    return this.realmHandle.realmName;
  }

  public async getProfiles(includeGlobalProfiles?: boolean): Promise<ClientProfilesRepresentation> {
    return retry(
      () =>
        this.core.clientPolicies.listProfiles({
          realm: this.realmName,
          includeGlobalProfiles,
        }),
      readRetryOptions,
    );
  }

  /**
   * Profile updates are read-modify-write mutations that are NOT replay-safe:
   * the supplied representation replaces server state in full. Retrying after
   * an ambiguous response could replay a stale update against a now-different
   * resource, so these mutations run a single attempt only.
   */
  public async updateProfiles(data: ClientProfilesRepresentation) {
    const mutationOptions: RetryOptions = { idempotent: false };
    await retry(
      () =>
        this.core.clientPolicies.createProfiles({
          realm: this.realmName,
          ...data,
        }),
      mutationOptions,
    );

    return this.getProfiles();
  }

  public async getPolicies(includeGlobalPolicies?: boolean): Promise<ClientPoliciesRepresentation> {
    return retry(
      () =>
        this.core.clientPolicies.listPolicies({
          realm: this.realmName,
          includeGlobalPolicies,
        }),
      readRetryOptions,
    );
  }

  /**
   * Policy updates are NOT replay-safe for the same reason as profile updates;
   * see {@link updateProfiles}.
   */
  public async updatePolicies(data: ClientPoliciesRepresentation) {
    const mutationOptions: RetryOptions = { idempotent: false };
    await retry(
      () =>
        this.core.clientPolicies.updatePolicy({
          realm: this.realmName,
          ...data,
        }),
      mutationOptions,
    );

    return this.getPolicies();
  }
}
