import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import type GroupHandle from './group';
import NestedChildGroupHandle from './nested-child-group';
import { AbstractGroupHandle } from './abstract-group';
import { getChildGroupByName, getGroupById, getGroupByName, listSubGroups } from './group-lookup';

export type ChildGroupInputData = Omit<GroupRepresentation, 'name' | 'id'>;

function getChildGroupUpdateData(group: GroupRepresentation, data: ChildGroupInputData, groupName: string) {
  return _merge({}, group, data, { name: groupName });
}

export default class ChildGroupHandle extends AbstractGroupHandle {
  public parentGroupHandle: GroupHandle;
  public parentGroupName: string;
  public groupData?: ChildGroupInputData;

  constructor(core: KeycloakAdminClient, parentGroupHandle: GroupHandle, groupName: string) {
    super(core, parentGroupHandle.realmName, groupName);
    this.parentGroupHandle = parentGroupHandle;
    this.parentGroupName = parentGroupHandle.groupName;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, parentGroupName: string, groupName: string) {
    return getChildGroupByName(core, realm, parentGroupName, groupName);
  }

  private getCurrentParentGroupName() {
    return this.parentGroupHandle.group?.name ?? this.parentGroupHandle.groupName;
  }

  public async getById(id: string) {
    this.group = await getGroupById(this.core, this.realmName, id);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    const parentGroupName = this.getCurrentParentGroupName();
    this.parentGroupName = parentGroupName;
    this.group = await ChildGroupHandle.getByName(this.core, this.realmName, parentGroupName, this.groupName);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async create(data: ChildGroupInputData) {
    if (await this.get()) {
      throw new Error(`Child Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    const parentGroupName = this.getCurrentParentGroupName();
    this.parentGroupName = parentGroupName;
    const group = this.parentGroupHandle.group ?? (await getGroupByName(this.core, this.realmName, parentGroupName));
    if (!group) {
      throw new Error(`Group "${parentGroupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.createChildGroup(
      { realm: this.realmName, id: group.id! },
      {
        ...data,
        name: this.groupName,
      },
    );

    return this.getWithRetry();
  }

  public async update(data: ChildGroupInputData) {
    const parentGroupName = this.getCurrentParentGroupName();
    this.parentGroupName = parentGroupName;
    const group = this.parentGroupHandle.group ?? (await getGroupByName(this.core, this.realmName, parentGroupName));
    if (!group) {
      throw new Error(`Group "${parentGroupName}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Child Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.updateChildGroup(
      { realm: this.realmName, id: group.id! },
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

    this.group = null;
    return this.groupName;
  }

  public async ensure(data: ChildGroupInputData) {
    this.groupData = data;

    const parentGroupName = this.getCurrentParentGroupName();
    this.parentGroupName = parentGroupName;
    const group = this.parentGroupHandle.group ?? (await getGroupByName(this.core, this.realmName, parentGroupName));
    if (!group) {
      throw new Error(`Group "${parentGroupName}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (one?.id) {
      await this.core.groups.updateChildGroup(
        { realm: this.realmName, id: group.id! },
        getChildGroupUpdateData(one, data, this.groupName),
      );
    } else {
      await this.core.groups.createChildGroup(
        { realm: this.realmName, id: group.id! },
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
      this.group = null;
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
