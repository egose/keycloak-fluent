import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type WorkflowRepresentation from '@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation';
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

function getPaginationBounds(options?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 100);

  return {
    start: (page - 1) * pageSize,
    end: page * pageSize,
  };
}

export type WorkflowInputData = Omit<WorkflowRepresentation, 'id' | 'name'>;

export default class WorkflowHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public workflowName: string;
  public workflow?: WorkflowRepresentation | null;
  public workflowData?: WorkflowInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, workflowName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.workflowName = workflowName;
  }

  static async list(core: KeycloakAdminClient, realm: string): Promise<WorkflowRepresentation[]> {
    return retryTransientAdminError(() => core.workflows.find({ realm }) as Promise<WorkflowRepresentation[]>);
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const workflows = await WorkflowHandle.list(core, realm);
    return workflows.find((workflow) => workflow.id === id) ?? null;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, workflowName: string) {
    const workflows = await WorkflowHandle.list(core, realm);
    return workflows.find((workflow) => workflow.name === workflowName) ?? null;
  }

  private async requireWorkflow(): Promise<WorkflowRepresentation & { id: string; name: string }> {
    const workflow = this.workflow ?? (await this.get());
    if (!workflow?.id || !workflow.name) {
      throw new Error(`Workflow "${this.workflowName}" not found in realm "${this.realmName}"`);
    }

    return workflow as WorkflowRepresentation & { id: string; name: string };
  }

  public async getById(id: string) {
    this.workflow = await WorkflowHandle.getById(this.core, this.realmName, id);

    if (this.workflow?.name) {
      this.workflowName = this.workflow.name;
    }

    return this.workflow;
  }

  public async get(): Promise<WorkflowRepresentation | null> {
    this.workflow = await WorkflowHandle.getByName(this.core, this.realmName, this.workflowName);

    if (this.workflow?.name) {
      this.workflowName = this.workflow.name;
    }

    return this.workflow ?? null;
  }

  public async create(data: WorkflowInputData) {
    if (await this.get()) {
      throw new Error(`Workflow "${this.workflowName}" already exists in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.workflows.create({
        realm: this.realmName,
        name: this.workflowName,
        ...data,
      }),
    );

    return this.get();
  }

  public async ensure(data: WorkflowInputData) {
    this.workflowData = data;

    if (!(await this.get())) {
      await retryTransientAdminError(() =>
        this.core.workflows.create({
          realm: this.realmName,
          name: this.workflowName,
          ...data,
        }),
      );

      await this.get();
    }

    return this;
  }

  public async delete() {
    const workflow = await this.requireWorkflow();
    const workflowId = workflow.id;

    await retryTransientAdminError(() =>
      this.core.workflows.delById({
        realm: this.realmName,
        id: workflowId,
      }),
    );

    this.workflow = null;
    return this.workflowName;
  }

  public async discard() {
    const workflow = await this.get();
    if (workflow?.id) {
      const workflowId = workflow.id;

      await retryTransientAdminError(() =>
        this.core.workflows.delById({
          realm: this.realmName,
          id: workflowId,
        }),
      );
      this.workflow = null;
    }

    return this.workflowName;
  }

  public async list(options?: { page?: number; pageSize?: number }) {
    const workflows = await WorkflowHandle.list(this.core, this.realmName);
    const { start, end } = getPaginationBounds(options);

    return workflows.slice(start, end);
  }
}
