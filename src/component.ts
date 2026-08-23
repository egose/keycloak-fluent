import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, {
  type ComponentRepresentation,
  type ComponentTypeRepresentation,
} from './keycloak-admin-client';
import RealmHandle from './realm';
import { retryTransientAdminError, retryTransientAdminReadError } from './utils/retry';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';

export type ComponentLookupData = Pick<ComponentRepresentation, 'parentId' | 'providerId' | 'providerType' | 'subType'>;
export type ComponentInputData = Omit<ComponentRepresentation, 'id' | 'name'>;

function getComponentUpdateData(component: ComponentRepresentation, data: ComponentInputData, componentName: string) {
  return mergeUpdateData(component, data, { name: componentName });
}

function getComponentCreateData(componentLookup: ComponentLookupData, data: ComponentInputData, componentName: string) {
  return {
    ...componentLookup,
    ...data,
    name: componentName,
  };
}

export default class ComponentHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  private _componentName: string;
  public readonly componentLookup: ComponentLookupData;
  private _component?: ComponentRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(
    core: KeycloakAdminClient,
    realmHandle: RealmHandle,
    componentName: string,
    componentLookup?: ComponentLookupData,
  ) {
    this.core = core;
    this.realmHandle = realmHandle;
    this._componentName = componentName;
    this.componentLookup = componentLookup ?? {};
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._component = undefined))) {
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

  public get componentName(): string {
    return this._componentName;
  }

  public get component(): ComponentRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._component;
  }

  /**
   * Re-targets this handle to a different component-name identity and clears
   * the cached representation. Returns `this` for chaining.
   */
  public rebind(newComponentName: string): this {
    if (newComponentName === this._componentName) return this;
    this._componentName = newComponentName;
    this._component = undefined;
    this._identityGeneration++;
    return this;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminReadError(() => core.components.findOne({ realm, id }));
    return one ?? null;
  }

  private matchesLookup(component: ComponentRepresentation) {
    if (component.name !== this.componentName) return false;
    if (this.componentLookup.parentId !== undefined && component.parentId !== this.componentLookup.parentId)
      return false;
    if (this.componentLookup.providerId !== undefined && component.providerId !== this.componentLookup.providerId)
      return false;
    if (this.componentLookup.providerType !== undefined && component.providerType !== this.componentLookup.providerType)
      return false;
    if (this.componentLookup.subType !== undefined && component.subType !== this.componentLookup.subType) return false;

    return true;
  }

  private resolveUniqueComponent(components: ComponentRepresentation[]) {
    const matches = components.filter((component) => this.matchesLookup(component));

    if (matches.length > 1) {
      throw new Error(
        `Component "${this.componentName}" is ambiguous in realm "${this.realmName}". Refine the lookup with parentId, providerId, providerType, or subType.`,
      );
    }

    return matches[0] ?? null;
  }

  private ensureLookupCompatible(data: ComponentInputData) {
    for (const lookupKey of Object.keys(this.componentLookup) as (keyof ComponentLookupData)[]) {
      const lookupValue = this.componentLookup[lookupKey];
      const dataValue = data[lookupKey];

      if (lookupValue !== undefined && dataValue !== undefined && dataValue !== lookupValue) {
        throw new Error(
          `Component "${this.componentName}" input ${lookupKey} conflicts with the handle lookup in realm "${this.realmName}"`,
        );
      }
    }
  }

  private async requireComponent(): Promise<ComponentRepresentation & { id: string }> {
    const component = this.component ?? (await this.get());
    if (!component?.id) {
      throw new Error(`Component "${this.componentName}" not found in realm "${this.realmName}"`);
    }

    return component as ComponentRepresentation & { id: string };
  }

  public async getById(id: string) {
    this.invalidateParentCache();
    this._component = await ComponentHandle.getById(this.core, this.realmName, id);

    if (this._component?.name) {
      if (this._componentName !== this._component.name) this._identityGeneration++;
      this._componentName = this._component.name;
    }

    return this.component ?? null;
  }

  public async get(): Promise<ComponentRepresentation | null> {
    this.invalidateParentCache();
    const components = await retryTransientAdminReadError(() =>
      this.core.components.find({
        realm: this.realmName,
        name: this.componentName,
        parent: this.componentLookup.parentId,
        type: this.componentLookup.providerType,
      }),
    );

    this._component = this.resolveUniqueComponent(components);

    if (this._component?.name) {
      if (this._componentName !== this._component.name) this._identityGeneration++;
      this._componentName = this._component.name;
    }

    return this.component ?? null;
  }

  public async create(data: ComponentInputData) {
    if (await this.get()) {
      throw new Error(`Component "${this.componentName}" already exists in realm "${this.realmName}"`);
    }

    this.ensureLookupCompatible(data);

    await retryTransientAdminError(() =>
      this.core.components.create({
        ...getComponentCreateData(this.componentLookup, data, this.componentName),
        realm: this.realmName,
      }),
    );

    return this.get();
  }

  public async update(data: ComponentInputData) {
    this.ensureLookupCompatible(data);

    const component = await this.requireComponent();
    const componentId = component.id;

    await retryTransientAdminError(() =>
      this.core.components.update(
        { realm: this.realmName, id: componentId },
        getComponentUpdateData(component, data, this.componentName),
      ),
    );

    return this.get();
  }

  public async delete() {
    const component = await this.requireComponent();
    const componentId = component.id;

    await retryTransientAdminError(() => this.core.components.del({ realm: this.realmName, id: componentId }));

    this._component = null;
    return this.componentName;
  }

  public async ensure(data: ComponentInputData) {
    this.ensureLookupCompatible(data);

    const component = await this.get();
    if (component?.id) {
      const existingComponent = component as ComponentRepresentation & { id: string };

      await retryTransientAdminError(() =>
        this.core.components.update(
          { realm: this.realmName, id: existingComponent.id },
          getComponentUpdateData(existingComponent, data, this.componentName),
        ),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.components.create({
          ...getComponentCreateData(this.componentLookup, data, this.componentName),
          realm: this.realmName,
        }),
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const component = await this.get();
    if (component?.id) {
      const existingComponent = component as ComponentRepresentation & { id: string };

      await retryTransientAdminError(() =>
        this.core.components.del({ realm: this.realmName, id: existingComponent.id }),
      );
      this._component = null;
    }

    return this.componentName;
  }

  public async listSubComponents(type: string): Promise<ComponentTypeRepresentation[]> {
    const component = await this.requireComponent();
    const componentId = component.id;

    return retryTransientAdminReadError(() =>
      this.core.components.listSubComponents({
        realm: this.realmName,
        id: componentId,
        type,
      }),
    );
  }
}
