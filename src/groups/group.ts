import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RealmHandle from '../realm';
import ChildGroupHandle from './child-group';
import { AbstractGroupHandle } from './abstract-group';
import { getChildGroupByName, getGroupById, getGroupByName, getGroupByPath, listSubGroups } from './group-lookup';

export type GroupInputData = Omit<GroupRepresentation, 'name' | 'id'>;

function getGroupUpdateData(group: GroupRepresentation, data: GroupInputData, groupName: string) {
  return _merge({}, group, data, { name: groupName });
}

export default class GroupHandle extends AbstractGroupHandle {
  public realmHandle: RealmHandle;
  public groupData?: GroupInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, groupName: string) {
    super(core, realmHandle.realmName, groupName);
    this.realmHandle = realmHandle;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    return getGroupById(core, realm, id);
  }

  static async getByName(core: KeycloakAdminClient, realm: string, groupName: string, attempts = 3) {
    return getGroupByName(core, realm, groupName, attempts);
  }

  static async listSubGroups(core: KeycloakAdminClient, realm: string, parentId: string, attempts = 3) {
    return listSubGroups(core, realm, parentId, attempts);
  }

  static async getByPath(core: KeycloakAdminClient, realm: string, groupPath: string) {
    return getGroupByPath(core, realm, groupPath);
  }

  public async getById(id: string) {
    this.group = await GroupHandle.getById(this.core, this.realmName, id);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    this.group = await GroupHandle.getByName(this.core, this.realmName, this.groupName);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async create(data: GroupInputData) {
    if (await this.get()) {
      throw new Error(`Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.groups.create({ ...data, realm: this.realmName, name: this.groupName });
    return this.get();
  }

  public async update(data: GroupInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.update({ realm: this.realmName, id: one.id }, getGroupUpdateData(one, data, this.groupName));

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.del({ realm: this.realmName, id: one.id });

    this.group = null;
    return this.groupName;
  }

  public async ensure(data: GroupInputData) {
    this.groupData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.groups.update(
        { realm: this.realmName, id: one.id },
        getGroupUpdateData(one, data, this.groupName),
      );
    } else {
      await this.core.groups.create({ ...data, realm: this.realmName, name: this.groupName });
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

  public childGroup(childGroupName: string) {
    return new ChildGroupHandle(this.core, this, childGroupName);
  }
}
