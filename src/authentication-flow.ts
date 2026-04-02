import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type AuthenticationExecutionInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationExecutionInfoRepresentation';
import type AuthenticatorConfigInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation';
import type AuthenticatorConfigRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation';
import type { AuthenticationProviderRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation';
import type AuthenticationFlowRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation';
import type RequiredActionConfigInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigInfoRepresentation';
import type RequiredActionConfigRepresentation from '@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigRepresentation';
import type RequiredActionProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
import RealmHandle from './realm';
import { retryTransientAdminError } from './utils/retry';

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

function getAuthenticationFlowUpdateData(
  flow: AuthenticationFlowRepresentation,
  data: AuthenticationFlowInputData,
  alias: string,
) {
  return _merge({}, flow, data, { alias });
}

export default class AuthenticationFlowHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public alias: string;
  public flow?: AuthenticationFlowRepresentation | null;
  public flowData?: AuthenticationFlowInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, alias: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.alias = alias;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminError(() => core.authenticationManagement.getFlow({ realm, flowId: id }));
    return one ?? null;
  }

  static async getByAlias(core: KeycloakAdminClient, realm: string, alias: string) {
    const flows = await retryTransientAdminError(() => core.authenticationManagement.getFlows({ realm }));
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
    this.flow = await AuthenticationFlowHandle.getById(this.core, this.realmName, id);

    if (this.flow?.alias) {
      this.alias = this.flow.alias;
    }

    return this.flow;
  }

  public async get(): Promise<AuthenticationFlowRepresentation | null> {
    this.flow = await AuthenticationFlowHandle.getByAlias(this.core, this.realmName, this.alias);

    if (this.flow?.alias) {
      this.alias = this.flow.alias;
    }

    return this.flow;
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

    this.flow = null;
    return this.alias;
  }

  public async ensure(data: AuthenticationFlowInputData) {
    this.flowData = data;

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
      this.flow = null;
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

  public async listExecutions(): Promise<AuthenticationExecutionInfoRepresentation[]> {
    const flow = await this.requireFlow();
    const flowAlias = flow.alias;

    return retryTransientAdminError(() =>
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
    const flowAlias = query?.flowAlias ?? this.alias;

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateExecution(
        {
          realm: this.realmName,
          flow: flowAlias,
        },
        execution,
      ),
    );

    return this.listExecutions();
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
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getClientAuthenticatorProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async listAuthenticatorProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getAuthenticatorProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async listFormActionProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getFormActionProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async listFormProviders(): Promise<AuthenticationProviderRepresentation[]> {
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getFormProviders({
        realm: this.realmName,
      } as any),
    );
  }

  public async getConfigDescription(providerId: string): Promise<AuthenticatorConfigInfoRepresentation> {
    return retryTransientAdminError(() =>
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
    return retryTransientAdminError(() =>
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
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getRequiredActions({
        realm: this.realmName,
      } as any),
    );
  }

  public async getRequiredAction(alias: string): Promise<RequiredActionProviderRepresentation> {
    return retryTransientAdminError(() =>
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
    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getRequiredActionConfigDescription({
        realm: this.realmName,
        alias,
      }),
    );
  }

  public async getRequiredActionConfig(alias: string): Promise<RequiredActionConfigRepresentation> {
    return retryTransientAdminError(() =>
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
