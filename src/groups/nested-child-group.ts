import { mergeUpdateData } from '../utils/merge-update-data';
import KeycloakAdminClient, { type GroupRepresentation } from '../keycloak-admin-client';
import { AbstractGroupHandle } from './abstract-group';
import { getGroupByPath } from './group-lookup';

export type NestedChildGroupInputData = Omit<GroupRepresentation, 'name' | 'id'>;

function getNestedChildGroupUpdateData(group: GroupRepresentation, data: NestedChildGroupInputData, groupName: string) {
  return mergeUpdateData(group, data, { name: groupName });
}

export default class NestedChildGroupHandle extends AbstractGroupHandle {
  private readonly fallbackParentGroupPath: string;
  private readonly parentGroupHandle?: AbstractGroupHandle;

  constructor(
    core: KeycloakAdminClient,
    realmName: string,
    parentGroupPath: string,
    groupName: string,
    parentGroupHandle?: AbstractGroupHandle,
  ) {
    super(core, parentGroupHandle ? () => parentGroupHandle.realmName : realmName, groupName, parentGroupHandle);
    this.fallbackParentGroupPath = parentGroupPath;
    this.parentGroupHandle = parentGroupHandle;
  }

  public get parentGroupPath(): string {
    return this.parentGroupHandle?.groupPath ?? this.fallbackParentGroupPath;
  }

  public override get groupPath(): string {
    return `${this.parentGroupPath}/${this.groupName}`;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, parentGroupPath: string, groupName: string) {
    const group = await getGroupByPath(core, realm, `${parentGroupPath}/${groupName}`);
    return group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    const group = await NestedChildGroupHandle.getByName(
      this.core,
      this.realmName,
      this.parentGroupPath,
      this.groupName,
    );
    this._setResolvedGroup(group, group?.name);

    return this.group ?? null;
  }

  public async create(data: NestedChildGroupInputData) {
    if (await this.get()) {
      throw new Error(`Child Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    const parentGroup = await getGroupByPath(this.core, this.realmName, this.parentGroupPath);
    if (!parentGroup) {
      throw new Error(`Parent Group Path "${this.parentGroupPath}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.createChildGroup(
      { realm: this.realmName, id: parentGroup.id! },
      {
        ...data,
        name: this.groupName,
      },
    );

    return this.getWithRetry();
  }

  public async update(data: NestedChildGroupInputData) {
    const parentGroup = await getGroupByPath(this.core, this.realmName, this.parentGroupPath);
    if (!parentGroup) {
      throw new Error(`Parent Group Path "${this.parentGroupPath}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Child Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.updateChildGroup(
      { realm: this.realmName, id: parentGroup.id! },
      getNestedChildGroupUpdateData(one, data, this.groupName),
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Child Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.del({ realm: this.realmName, id: one.id });

    this._setResolvedGroup(null);
    return this.groupName;
  }

  public async ensure(data: NestedChildGroupInputData) {
    const parentGroup = await getGroupByPath(this.core, this.realmName, this.parentGroupPath);
    if (!parentGroup) {
      throw new Error(`Parent Group Path "${this.parentGroupPath}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (one?.id) {
      await this.core.groups.updateChildGroup(
        { realm: this.realmName, id: parentGroup.id! },
        getNestedChildGroupUpdateData(one, data, this.groupName),
      );
    } else {
      await this.core.groups.createChildGroup(
        { realm: this.realmName, id: parentGroup.id! },
        {
          ...data,
          name: this.groupName,
        },
      );

      await this.getWithRetry();
      return this;
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.groups.del({ realm: this.realmName, id: one.id });
      this._setResolvedGroup(null);
    }

    return this.groupName;
  }

  public childGroup(groupName: string) {
    return new NestedChildGroupHandle(this.core, this.realmName, this.groupPath, groupName, this);
  }
}
