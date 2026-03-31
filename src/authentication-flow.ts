import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type AuthenticationExecutionInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationExecutionInfoRepresentation';
import type AuthenticationFlowRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation';
import RealmHandle from './realm';

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

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.updateFlow(
        { realm: this.realmName, flowId: flow.id },
        {
          ...defaultAuthenticationFlowData,
          ...data,
          id: flow.id,
          alias: this.alias,
        },
      ),
    );

    return this.get();
  }

  public async delete() {
    const flow = await this.requireFlow();

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.deleteFlow({
        realm: this.realmName,
        flowId: flow.id,
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
          {
            ...defaultAuthenticationFlowData,
            ...data,
            id: existingFlow.id,
            alias: this.alias,
          },
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

    await retryTransientAdminError(() =>
      this.core.authenticationManagement.copyFlow({
        realm: this.realmName,
        flow: flow.alias,
        newName: newAlias,
      }),
    );

    return this.realmHandle.authenticationFlow(newAlias).get();
  }

  public async listExecutions(): Promise<AuthenticationExecutionInfoRepresentation[]> {
    const flow = await this.requireFlow();

    return retryTransientAdminError(() =>
      this.core.authenticationManagement.getExecutions({
        realm: this.realmName,
        flow: flow.alias,
      }),
    );
  }

  public async addExecution(provider: string) {
    const flow = await this.requireFlow();

    return retryTransientAdminError(() =>
      this.core.authenticationManagement.addExecutionToFlow({
        realm: this.realmName,
        flow: flow.alias,
        provider,
      }),
    );
  }

  public async addSubFlow(data: AuthenticationSubFlowInputData) {
    const flow = await this.requireFlow();

    return retryTransientAdminError(() =>
      this.core.authenticationManagement.addFlowToFlow({
        realm: this.realmName,
        flow: flow.alias,
        alias: data.alias,
        type: data.type ?? 'basic-flow',
        provider: data.provider ?? 'basic-flow',
        description: data.description ?? '',
      }),
    );
  }
}
