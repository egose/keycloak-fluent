import { mergeUpdateData } from '../utils/merge-update-data';
import KeycloakAdminClient, { type GroupRepresentation } from '../keycloak-admin-client';
import type GroupHandle from './group';
import NestedChildGroupHandle from './nested-child-group';
import { AbstractGroupHandle } from './abstract-group';
import { getChildGroupByName, getChildGroupByParentId, getGroupById } from './group-lookup';

export type ChildGroupInputData = Omit<GroupRepresentation, 'name' | 'id'>;

function getChildGroupUpdateData(group: GroupRepresentation, data: ChildGroupInputData, groupName: string) {
  return mergeUpdateData(group, data, { name: groupName });
}

export default class ChildGroupHandle extends AbstractGroupHandle {
  public readonly parentGroupHandle: GroupHandle;
  private _parentGroupName: string;

  constructor(core: KeycloakAdminClient, parentGroupHandle: GroupHandle, groupName: string) {
    super(core, parentGroupHandle.realmName, groupName);
    this.parentGroupHandle = parentGroupHandle;
    this._parentGroupName = parentGroupHandle.groupName;
  }

  public get parentGroupName(): string {
    return this._parentGroupName;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, parentGroupName: string, groupName: string) {
    return getChildGroupByName(core, realm, parentGroupName, groupName);
  }

  private async resolveParentGroup() {
    const parentGroup = this.parentGroupHandle.group ?? (await this.parentGroupHandle.get());
    if (!parentGroup?.name) {
      return null;
    }

    this._parentGroupName = parentGroup.name;
    return parentGroup as GroupRepresentation & { id: string; name: string };
  }

  public async getById(id: string) {
    const group = await getGroupById(this.core, this.realmName, id);
    this._setResolvedGroup(group, group?.name);

    return this.group ?? null;
  }

  public async get(): Promise<GroupRepresentation | null> {
    const parentGroup = await this.resolveParentGroup();
    if (!parentGroup?.id) {
      this._setResolvedGroup(null);
      return this.group ?? null;
    }

    const group = await getChildGroupByParentId(this.core, this.realmName, parentGroup.id, this.groupName);
    this._setResolvedGroup(group, group?.name);

    return this.group ?? null;
  }

  public async create(data: ChildGroupInputData) {
    if (await this.get()) {
      throw new Error(`Child Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    const parentGroup = await this.resolveParentGroup();
    if (!parentGroup?.id) {
      throw new Error(`Group "${this.parentGroupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.createChildGroup(
      { realm: this.realmName, id: parentGroup.id },
      {
        ...data,
        name: this.groupName,
      },
    );

    return this.getWithRetry();
  }

  public async update(data: ChildGroupInputData) {
    const parentGroup = await this.resolveParentGroup();
    if (!parentGroup?.id) {
      throw new Error(`Group "${this.parentGroupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Child Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.updateChildGroup(
      { realm: this.realmName, id: parentGroup.id },
      getChildGroupUpdateData(one, data, this.groupName),
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

  public async ensure(data: ChildGroupInputData) {
    const parentGroup = await this.resolveParentGroup();
    if (!parentGroup?.id) {
      throw new Error(`Group "${this.parentGroupHandle.groupName}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (one?.id) {
      await this.core.groups.updateChildGroup(
        { realm: this.realmName, id: parentGroup.id },
        getChildGroupUpdateData(one, data, this.groupName),
      );
    } else {
      await this.core.groups.createChildGroup(
        { realm: this.realmName, id: parentGroup.id },
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
    return new NestedChildGroupHandle(
      this.core,
      this.realmName,
      `/${this.parentGroupName}/${this.groupName}`,
      groupName,
    );
  }
}
