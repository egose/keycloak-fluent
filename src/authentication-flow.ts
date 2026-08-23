import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, {
  type AuthenticationExecutionInfoRepresentation,
  type AuthenticationFlowRepresentation,
  type AuthenticationProviderRepresentation,
  type AuthenticatorConfigInfoRepresentation,
  type AuthenticatorConfigRepresentation,
  type RequiredActionConfigInfoRepresentation,
  type RequiredActionConfigRepresentation,
  type RequiredActionProviderRepresentation,
} from './keycloak-admin-client';
import RealmHandle from './realm';
import { retryTransientAdminError, retryTransientAdminReadError } from './utils/retry';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';

export const defaultAuthenticationFlowData = Object.freeze({
  description: '',
  providerId: 'basic-flow',
  topLevel: true,
  builtIn: false,
});

export type AuthenticationFlowInputData = Omit<AuthenticationFlowRepresentation, 'id' | 'alias'>;
export type AuthenticationSubFlowInputData = {
  alias: string;
  type?: string;
  provider?: string;
  description?: string;
};
export type AuthenticationExecutionsQuery = {
  flowAlias?: string;
};

/**
 * Raised by {@link AuthenticationFlowHandle.updateExecution} when the
 * `flowAlias` query target cannot be resolved in the realm before mutation.
 * Carrying `realmName` and `alias` lets callers distinguish a not-found
 * target from a transient HTTP error without string-matching the message.
 *
 * The handle still uses {@link requireFlow} (which throws a generic `Error`
 * with a stable message) for the handle's own alias; this typed error is
 * dedicated to the cross-flow `updateExecution(execution, { flowAlias })`
 * path that the FLOW-01 finding flagged.
 */
export class AuthenticationFlowNotFoundError extends Error {
  public readonly realmName: string;
  public readonly alias: string;

  constructor(realmName: string, alias: string) {
    super(`Authentication Flow "${alias}" not found in realm "${realmName}"`);
    this.name = 'AuthenticationFlowNotFoundError';
    this.realmName = realmName;
    this.alias = alias;
    Object.setPrototypeOf(this, AuthenticationFlowNotFoundError.prototype);
  }
}

function getAuthenticationFlowUpdateData(
  flow: AuthenticationFlowRepresentation,
  data: AuthenticationFlowInputData,
  alias: string,
) {
  return mergeUpdateData(flow, data, { alias });
}

export default class AuthenticationFlowHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  private _alias: string;
  private _flow?: AuthenticationFlowRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, alias: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this._alias = alias;
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._flow = undefined))) {
      this._identityGeneration++;
    }
  }

  public get realmName(): string {
    return this.realmHandle.realmName;
  }

  public get identityVersion(): string {
    this.invalidateParentCache();
    return makeHandleIdentityVersion(this._identityGeneration, this.realmHandle);
  }

  public get alias(): string {
    return this._alias;
  }

  public get flow(): AuthenticationFlowRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._flow;
  }

  /**
   * Re-targets this handle to a different flow alias and clears the cached
   * representation. Returns `this` for chaining.
   */
  public rebind(newAlias: string): this {
    if (newAlias === this._alias) return this;
    this._alias = newAlias;
    this._flow = undefined;
    this._identityGeneration++;
    return this;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminReadError(() => core.authenticationManagement.getFlow({ realm, flowId: id }));
    return one ?? null;
  }

  static async getByAlias(core: KeycloakAdminClient, realm: string, alias: string) {
    const flows = await retryTransientAdminReadError(() => core.authenticationManagement.getFlows({ realm }));
    return flows.find((flow) => flow.alias === alias) ?? null;
  }

  private async requireFlow(): Promise<AuthenticationFlowRepresentation & { id: string; alias: string }> {
    const flow = this.flow ?? (await this.get());
    if (!flow?.id || !flow.alias) {
      throw new Error(`Authentication Flow "${this.alias}" not found in realm "${this.realmName}"`);
    }

    return flow as AuthenticationFlowRepresentation & { id: string; alias: string };
  }

  public async getById(id: string) {
    this.invalidateParentCache();
    this._flow = await AuthenticationFlowHandle.getById(this.core, this.realmName, id);

    if (this._flow?.alias) {
      if (this._alias !== this._flow.alias) this._identityGeneration++;
      this._alias = this._flow.alias;
    }

    return this.flow ?? null;
  }

  public async get(): Promise<AuthenticationFlowRepresentation | null> {
    this.invalidateParentCache();
    this._flow = await AuthenticationFlowHandle.getByAlias(this.core, this.realmName, this.alias);

    if (this._flow?.alias) {
      if (this._alias !== this._flow.alias) this._identityGeneration++;
      this._alias = this._flow.alias;
    }

    return this.flow ?? null;
  }

  public async create(data: AuthenticationFlowInputData) {
    if (await this.get()) {
      throw new Error(`Authentication Flow "${this.alias}" already exists in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.createFlow({
        ...defaultAuthenticationFlowData,
        ...data,
        realm: this.realmName,
        alias: this.alias,
      }),
    );

    return this.get();
  }

  public async update(data: AuthenticationFlowInputData) {
    const flow = await this.requireFlow();
    const flowId = flow.id;

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateFlow(
        { realm: this.realmName, flowId },
        getAuthenticationFlowUpdateData(flow, data, this.alias),
      ),
    );

    return this.get();
  }

  public async delete() {
    const flow = await this.requireFlow();
    const flowId = flow.id;

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.deleteFlow({
        realm: this.realmName,
        flowId,
      }),
    );

    this._flow = null;
    return this.alias;
  }

  public async ensure(data: AuthenticationFlowInputData) {
    const flow = await this.get();
    if (flow?.id) {
      const existingFlow = flow as AuthenticationFlowRepresentation & { id: string };

      await retryTransientAdminError(() =>
        this.core.authenticationManagement.updateFlow(
          { realm: this.realmName, flowId: existingFlow.id },
          getAuthenticationFlowUpdateData(existingFlow, data, this.alias),
        ),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.authenticationManagement.createFlow({
          ...defaultAuthenticationFlowData,
          ...data,
          realm: this.realmName,
          alias: this.alias,
        }),
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const flow = await this.get();
    if (flow?.id) {
      const existingFlow = flow as AuthenticationFlowRepresentation & { id: string };

      await retryTransientAdminError(() =>
        this.core.authenticationManagement.deleteFlow({
          realm: this.realmName,
          flowId: existingFlow.id,
        }),
      );
      this._flow = null;
    }

    return this.alias;
  }

  public async copy(newAlias: string) {
    const flow = await this.requireFlow();
    const flowAlias = flow.alias;

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.copyFlow({
        realm: this.realmName,
        flow: flowAlias,
        newName: newAlias,
      }),
    );

    return this.realmHandle.authenticationFlow(newAlias).get();
  }

  public async listExecutions(flowAliasOverride?: string): Promise<AuthenticationExecutionInfoRepresentation[]> {
    const flow = await this.requireFlow();
    const flowAlias = flowAliasOverride ?? flow.alias;

    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getExecutions({
        realm: this.realmName,
        flow: flowAlias,
      }),
    );
  }

  public async addExecution(provider: string) {
    const flow = await this.requireFlow();
    const flowAlias = flow.alias;

    return retryTransientAdminError(() =>
      this.core.authenticationManagement.addExecutionToFlow({
        realm: this.realmName,
        flow: flowAlias,
        provider,
      }),
    );
  }

  public async addSubFlow(data: AuthenticationSubFlowInputData) {
    const flow = await this.requireFlow();
    const flowAlias = flow.alias;

    return retryTransientAdminError(() =>
      this.core.authenticationManagement.addFlowToFlow({
        realm: this.realmName,
        flow: flowAlias,
        alias: data.alias,
        type: data.type ?? 'basic-flow',
        provider: data.provider ?? 'basic-flow',
        description: data.description ?? '',
      }),
    );
  }

  public async updateExecution(
    execution: AuthenticationExecutionInfoRepresentation,
    query?: AuthenticationExecutionsQuery,
  ) {
    const targetAlias = query?.flowAlias ?? this.alias;

    const target =
      targetAlias === this.alias
        ? await this.requireFlow()
        : await AuthenticationFlowHandle.getByAlias(this.core, this.realmName, targetAlias);

    if (!target?.alias) {
      throw new AuthenticationFlowNotFoundError(this.realmName, targetAlias);
    }

    const resolvedAlias = target.alias;

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateExecution(
        {
          realm: this.realmName,
          flow: resolvedAlias,
        },
        execution,
      ),
    );

    return this.listExecutions(resolvedAlias);
  }

  public async deleteExecution(id: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.delExecution({
        realm: this.realmName,
        id,
      }),
    );
  }

  public async raiseExecutionPriority(id: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.raisePriorityExecution({
        realm: this.realmName,
        id,
      }),
    );
  }

  public async lowerExecutionPriority(id: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.lowerPriorityExecution({
        realm: this.realmName,
        id,
      }),
    );
  }

  public async listClientAuthenticatorProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getClientAuthenticatorProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async listAuthenticatorProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getAuthenticatorProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async listFormActionProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getFormActionProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async listFormProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getFormProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async getConfigDescription(providerId: string): Promise<AuthenticatorConfigInfoRepresentation> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getConfigDescription({
        realm: this.realmName,
        providerId,
      }),
    );
  }

  public async createConfig(data: AuthenticatorConfigRepresentation): Promise<AuthenticatorConfigRepresentation> {
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.createConfig({
        realm: this.realmName,
        ...data,
      }),
    );
  }

  public async getConfig(id: string): Promise<AuthenticatorConfigRepresentation> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getConfig({
        realm: this.realmName,
        id,
      }),
    );
  }

  public async updateConfig(data: AuthenticatorConfigRepresentation) {
    if (!data.id) {
      throw new Error('Authentication config id is required');
    }

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateConfig({
        realm: this.realmName,
        ...data,
      }),
    );

    return this.getConfig(data.id);
  }

  public async deleteConfig(id: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.delConfig({
        realm: this.realmName,
        id,
      }),
    );
  }

  public async listRequiredActions(): Promise<RequiredActionProviderRepresentation[]> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getRequiredActions({
        realm: this.realmName,
      } as any),
    );
  }

  public async getRequiredAction(alias: string): Promise<RequiredActionProviderRepresentation> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getRequiredActionForAlias({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async updateRequiredAction(alias: string, data: RequiredActionProviderRepresentation) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateRequiredAction(
        {
          realm: this.realmName,
          alias,
        },
        data,
      ),
    );

    return this.getRequiredAction(alias);
  }

  public async deleteRequiredAction(alias: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.deleteRequiredAction({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async raiseRequiredActionPriority(alias: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.raiseRequiredActionPriority({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async lowerRequiredActionPriority(alias: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.lowerRequiredActionPriority({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async getRequiredActionConfigDescription(alias: string): Promise<RequiredActionConfigInfoRepresentation> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getRequiredActionConfigDescription({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async getRequiredActionConfig(alias: string): Promise<RequiredActionConfigRepresentation> {
    return retryTransientAdminReadError(() =>
      this.core.authenticationManagement.getRequiredActionConfig({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async updateRequiredActionConfig(alias: string, data: RequiredActionConfigRepresentation) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateRequiredActionConfig(
        {
          realm: this.realmName,
          alias,
        },
        data,
      ),
    );

    return this.getRequiredActionConfig(alias);
  }

  public async removeRequiredActionConfig(alias: string) {
    await retryTransientAdminError(() =>
      this.core.authenticationManagement.removeRequiredActionConfig({
        realm: this.realmName,
        alias,
      }),
    );
  }
}
