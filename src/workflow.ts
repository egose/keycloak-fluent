import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, { type WorkflowRepresentation } from './keycloak-admin-client';
import RealmHandle from './realm';
import {
  getErrorStatus,
  getResponseErrorMessage,
  retryTransientAdminError,
  retryTransientAdminReadError,
} from './utils/retry';
import { fetchAll, fetchAllStream, type FetchAllOptions } from './utils/fetch-all';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';
import { toSinglePageQuery } from './utils/single-page-query';

export type WorkflowInputData = Omit<WorkflowRepresentation, 'id' | 'name'>;

function getWorkflowUpdateData(workflow: WorkflowRepresentation, data: WorkflowInputData, workflowName: string) {
  return mergeUpdateData(workflow, data, { name: workflowName });
}

/**
 * Raised by {@link WorkflowHandle.requireWorkflow} / mutating methods when the
 * named workflow cannot be resolved in the target realm. Carrying `realmName`
 * and `workflowName` lets callers distinguish this from a transient HTTP error
 * without string-matching the message.
 */
export class WorkflowNotFoundError extends Error {
  public readonly realmName: string;
  public readonly workflowName: string;

  constructor(realmName: string, workflowName: string) {
    super(`Workflow "${workflowName}" not found in realm "${realmName}"`);
    this.name = 'WorkflowNotFoundError';
    this.realmName = realmName;
    this.workflowName = workflowName;
    Object.setPrototypeOf(this, WorkflowNotFoundError.prototype);
  }
}

/**
 * Raised by name lookup ({@link WorkflowHandle.get} and the static
 * {@link WorkflowHandle.getByName}) when Keycloak returns more than one
 * workflow matching the exact name. The previous fluent implementation
 * silently selected the first match; doing so would let a duplicate-name
 * collision masquerade as a successful single-workflow provision, so the
 * boundary now fails loudly. Callers that intentionally want all matches can
 * use {@link WorkflowHandle.list} / {@link WorkflowHandle.listAll}.
 */
export class DuplicateWorkflowNameError extends Error {
  public readonly realmName: string;
  public readonly workflowName: string;
  public readonly matchCount: number;

  constructor(realmName: string, workflowName: string, matchCount: number) {
    super(
      `Workflow name "${workflowName}" matched ${matchCount} workflows in realm "${realmName}"; expected exactly one`,
    );
    this.name = 'DuplicateWorkflowNameError';
    this.realmName = realmName;
    this.workflowName = workflowName;
    this.matchCount = matchCount;
    Object.setPrototypeOf(this, DuplicateWorkflowNameError.prototype);
  }
}

/**
 * Pagination/slicing options accepted by {@link WorkflowHandle.list}.
 *
 * As with the other handles, callers may use either `page`/`pageSize`
 * (1-indexed) or raw `first`/`max` offset/limit values. Supplying both styles
 * is invalid because precedence would be ambiguous. `list()` requests exactly
 * one page from the Keycloak workflows endpoint (admin
 * `/admin/realms/{realm}/workflows` accepts `first` and `max` query parameters)
 * and returns the page the server produced without re-slicing it. Use
 * {@link WorkflowHandle.listAll} / {@link WorkflowHandle.listAllStream} to
 * iterate the full collection.
 */
export type WorkflowListOptions = {
  page?: number;
  pageSize?: number;
  first?: number;
  max?: number;
};

/**
 * Full-collection iteration options. Inherits PAGE-01 validation and bounds
 * (`pageSize`, `first`, `maxPages`, `maxItems`, `signal`) from {@link FetchAllOptions}.
 */
export type WorkflowListAllOptions = FetchAllOptions;

export default class WorkflowHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  private _workflowName: string;
  private _workflow?: WorkflowRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, workflowName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this._workflowName = workflowName;
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._workflow = undefined))) {
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

  public get workflowName(): string {
    return this._workflowName;
  }

  public get workflow(): WorkflowRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._workflow;
  }

  /**
   * Re-targets this handle to a different workflow name and clears the
   * cached representation. Returns `this` for chaining.
   */
  public rebind(newWorkflowName: string): this {
    if (newWorkflowName === this._workflowName) return this;
    this._workflowName = newWorkflowName;
    this._workflow = undefined;
    this._identityGeneration++;
    return this;
  }

  /**
   * Lists workflows on the server, supporting server-side pagination.
   *
   * Forwards `first`/`max` to `GET /admin/realms/{realm}/workflows` (the
   * endpoint documents `first` and `max` query parameters) and returns the
   * page the server produced. Unlike the previous implementation, this DOES
   * NOT fetch every workflow and slice the array in memory.
   *
   * To iterate the full collection without losing rows past the first page,
   * use {@link WorkflowHandle.listAll} / {@link WorkflowHandle.listAllStream}.
   */
  static async list(
    core: KeycloakAdminClient,
    realm: string,
    options?: WorkflowListOptions,
  ): Promise<WorkflowRepresentation[]> {
    const { first, max } = toSinglePageQuery(options, 'WorkflowHandle.list');
    return retryTransientAdminReadError(
      () => core.workflows.find({ realm, first, max }) as Promise<WorkflowRepresentation[]>,
    );
  }

  /**
   * Resolves a workflow by its internal id via `GET /admin/realms/{realm}/workflows/{id}`.
   * A missing id resolves to `null`. Unlike other Keycloak resources, this
   * endpoint never returns 404 for an unknown id: on Keycloak 26.6.x it
   * returns HTTP 400 `Not a valid workflow resource: <id>` (the OpenAPI spec
   * documents only 200 and 400 for this route, no 404). The upstream `findOne`
   * route's `catchNotFound: true` only catches 404, so the 400 is intercepted
   * here and coerced to `null` when the server message identifies it as the
   * unknown-workflow-resource not-found signal. Any other 400 (e.g. a future
   * validation error) is rethrown so genuine client errors are not masked as
   * not-found. This terminates as soon as the unique match is known and never
   * loads the full list.
   */
  static async getById(core: KeycloakAdminClient, realm: string, id: string): Promise<WorkflowRepresentation | null> {
    try {
      const workflow = await retryTransientAdminReadError(
        () => core.workflows.findOne({ id, realm, includeId: true }) as Promise<WorkflowRepresentation | undefined>,
      );
      return workflow ?? null;
    } catch (error) {
      if (getErrorStatus(error) === 400) {
        const message = getResponseErrorMessage(error);
        if (message !== undefined && /^Not a valid workflow resource:/.test(message)) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Resolves a workflow by exact name match using the server-side `search` +
   * `exact:true` query parameters documented at
   * `GET /admin/realms/{realm}/workflows`. Terminates as soon as the unique
   * match is known; never loads every workflow.
   *
   * Duplicate-name behavior is explicit: if Keycloak returns more than one
   * workflow matching the exact name, a {@link DuplicateWorkflowNameError} is
   * raised. The previous implementation silently selected the first match,
   * which let a duplicate collision masquerade as a successful single-workflow
   * provision; failing loudly is safer for `ensure()`/`create()` callers.
   */
  static async getByName(
    core: KeycloakAdminClient,
    realm: string,
    workflowName: string,
  ): Promise<WorkflowRepresentation | null> {
    const workflows = (await retryTransientAdminReadError(
      () =>
        core.workflows.find({
          realm,
          search: workflowName,
          exact: true,
        }) as Promise<WorkflowRepresentation[]>,
    )) as WorkflowRepresentation[];

    if (!workflows || workflows.length === 0) {
      return null;
    }

    if (workflows.length > 1) {
      throw new DuplicateWorkflowNameError(realm, workflowName, workflows.length);
    }

    return workflows[0] ?? null;
  }

  private async requireWorkflow(): Promise<WorkflowRepresentation & { id: string; name: string }> {
    const workflow = this.workflow ?? (await this.get());
    if (!workflow?.id || !workflow.name) {
      throw new WorkflowNotFoundError(this.realmName, this.workflowName);
    }

    return workflow as WorkflowRepresentation & { id: string; name: string };
  }

  public async getById(id: string): Promise<WorkflowRepresentation | null> {
    this.invalidateParentCache();
    this._workflow = await WorkflowHandle.getById(this.core, this.realmName, id);

    if (this._workflow?.name) {
      if (this._workflowName !== this._workflow.name) this._identityGeneration++;
      this._workflowName = this._workflow.name;
    }

    return this.workflow ?? null;
  }

  public async get(): Promise<WorkflowRepresentation | null> {
    this.invalidateParentCache();
    if (this.workflow?.id) {
      return this.workflow;
    }

    this._workflow = await WorkflowHandle.getByName(this.core, this.realmName, this.workflowName);

    if (this._workflow?.name) {
      if (this._workflowName !== this._workflow.name) this._identityGeneration++;
      this._workflowName = this._workflow.name;
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

  public async update(data: WorkflowInputData) {
    const workflow = await this.requireWorkflow();
    const workflowId = workflow.id;

    await retryTransientAdminError(() =>
      this.core.workflows.update(
        {
          realm: this.realmName,
          id: workflowId,
        },
        getWorkflowUpdateData(workflow, data, this.workflowName),
      ),
    );

    return this.get();
  }

  public async ensure(data: WorkflowInputData) {
    const workflow = await this.get();

    if (workflow?.id) {
      const workflowId = workflow.id;

      await retryTransientAdminError(() =>
        this.core.workflows.update(
          {
            realm: this.realmName,
            id: workflowId,
          },
          getWorkflowUpdateData(workflow, data, this.workflowName),
        ),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.workflows.create({
          realm: this.realmName,
          name: this.workflowName,
          ...data,
        }),
      );
    }

    await this.get();

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

    this._workflow = null;
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
      this._workflow = null;
    }

    return this.workflowName;
  }

  /**
   * Lists workflows via server-side pagination.
   *
   * Forwards `page`/`pageSize` (or `first`/`max`) to the Keycloak workflows
   * endpoint and returns exactly the page the server produced; this method
   * does not slice the result further. To iterate every workflow in the
   * realm, use {@link WorkflowHandle.listAll} (eager array) or
   * {@link WorkflowHandle.listAllStream} (async iterator).
   */
  public async list(options?: WorkflowListOptions): Promise<WorkflowRepresentation[]> {
    return WorkflowHandle.list(this.core, this.realmName, options);
  }

  /**
   * Iterates every workflow in the realm using {@link fetchAll}, advancing by
   * the page length Keycloak actually returns. Validates `first`/`pageSize`/
   * `maxPages`, aborts runaway loops with `RangeError`, and supports an
   * {@link AbortSignal}. Returned array preserves the order returned by the
   * server.
   */
  public async listAll(options?: WorkflowListAllOptions): Promise<WorkflowRepresentation[]> {
    const opts = options ?? {};
    return fetchAll<WorkflowRepresentation>(
      (first, max) =>
        retryTransientAdminReadError(
          () => this.core.workflows.find({ realm: this.realmName, first, max }) as Promise<WorkflowRepresentation[]>,
        ),
      opts,
    );
  }

  /**
   * Async iterator yielding one workflow page at a time from the server. Same
   * bounded-loop guarantees as {@link fetchAllStream}, plus reference-identity
   * repeated-page protection against endpoints that ignore `first`.
   */
  public async *listAllStream(options?: WorkflowListAllOptions): AsyncIterableIterator<WorkflowRepresentation[]> {
    const opts = options ?? {};
    yield* fetchAllStream<WorkflowRepresentation>(
      (first, max) =>
        retryTransientAdminReadError(
          () => this.core.workflows.find({ realm: this.realmName, first, max }) as Promise<WorkflowRepresentation[]>,
        ),
      opts,
    );
  }
}
