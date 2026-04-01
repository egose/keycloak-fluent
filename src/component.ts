import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ComponentRepresentation from '@keycloak/keycloak-admin-client/lib/defs/componentRepresentation';
import ComponentTypeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation';
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

export type ComponentLookupData = Pick<ComponentRepresentation, 'parentId' | 'providerId' | 'providerType' | 'subType'>;
export type ComponentInputData = Omit<ComponentRepresentation, 'id' | 'name'>;

export default class ComponentHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public componentName: string;
  public componentLookup: ComponentLookupData;
  public component?: ComponentRepresentation | null;
  public componentData?: ComponentInputData;

  constructor(
    core: KeycloakAdminClient,
    realmHandle: RealmHandle,
    componentName: string,
    componentLookup?: ComponentLookupData,
  ) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.componentName = componentName;
    this.componentLookup = componentLookup ?? {};
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminError(() => core.components.findOne({ realm, id }));
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

  private async requireComponent(): Promise<ComponentRepresentation & { id: string }> {
    const component = this.component ?? (await this.get());
    if (!component?.id) {
      throw new Error(`Component "${this.componentName}" not found in realm "${this.realmName}"`);
    }

    return component as ComponentRepresentation & { id: string };
  }

  public async getById(id: string) {
    this.component = await ComponentHandle.getById(this.core, this.realmName, id);

    if (this.component?.name) {
      this.componentName = this.component.name;
    }

    return this.component;
  }

  public async get(): Promise<ComponentRepresentation | null> {
    const components = await retryTransientAdminError(() =>
      this.core.components.find({
        realm: this.realmName,
        name: this.componentName,
        parent: this.componentLookup.parentId,
        type: this.componentLookup.providerType,
      }),
    );

    this.component = this.resolveUniqueComponent(components);

    if (this.component?.name) {
      this.componentName = this.component.name;
    }

    return this.component;
  }

  public async create(data: ComponentInputData) {
    if (await this.get()) {
      throw new Error(`Component "${this.componentName}" already exists in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.components.create({
        ...data,
        realm: this.realmName,
        name: this.componentName,
      }),
    );

    return this.get();
  }

  public async update(data: ComponentInputData) {
    const component = await this.requireComponent();

    await retryTransientAdminError(() =>
      this.core.components.update(
        { realm: this.realmName, id: component.id },
        {
          ...data,
          id: component.id,
          name: this.componentName,
        },
      ),
    );

    return this.get();
  }

  public async delete() {
    const component = await this.requireComponent();

    await retryTransientAdminError(() => this.core.components.del({ realm: this.realmName, id: component.id }));

    this.component = null;
    return this.componentName;
  }

  public async ensure(data: ComponentInputData) {
    this.componentData = data;

    const component = await this.get();
    if (component?.id) {
      const existingComponent = component as ComponentRepresentation & { id: string };

      await retryTransientAdminError(() =>
        this.core.components.update(
          { realm: this.realmName, id: existingComponent.id },
          {
            ...data,
            id: existingComponent.id,
            name: this.componentName,
          },
        ),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.components.create({
          ...data,
          realm: this.realmName,
          name: this.componentName,
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
      this.component = null;
    }

    return this.componentName;
  }

  public async listSubComponents(type: string): Promise<ComponentTypeRepresentation[]> {
    const component = await this.requireComponent();

    return retryTransientAdminError(() =>
      this.core.components.listSubComponents({
        realm: this.realmName,
        id: component.id,
        type,
      }),
    );
  }
}
