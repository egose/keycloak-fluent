import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import GroupHandle from './group';
import NestedChildGroupHandle from './nested-child-group';
import { AbstractGroupHandle } from './abstract-group';

export type ChildGroupInputData = Omit<GroupRepresentation, 'name | id'>;

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
    const group = await GroupHandle.getByName(core, realm, parentGroupName);
    if (!group) return null;

    const subGroups = await core.groups.listSubGroups({ realm, parentId: group.id! });
    const subgroup = subGroups.find((v) => v.name === groupName);
    return subgroup ?? null;
  }

  public async getById(id: string) {
    this.group = await GroupHandle.getById(this.core, this.realmName, id);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    this.group = await ChildGroupHandle.getByName(this.core, this.realmName, this.parentGroupName, this.groupName);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async create(data: ChildGroupInputData) {
    if (await this.get()) {
      throw new Error(`Child Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    const group = this.parentGroupHandle.group ?? (await this.parentGroupHandle.get());
    if (!group) {
      throw new Error(`Group "${this.parentGroupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.createChildGroup(
      { realm: this.realmName, id: group.id! },
      {
        ...data,
        name: this.groupName,
      },
    );

    return this.get();
  }

  public async update(data: ChildGroupInputData) {
    const group = this.parentGroupHandle.group ?? (await this.parentGroupHandle.get());
    if (!group) {
      throw new Error(`Group "${this.parentGroupName}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Child Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.updateChildGroup(
      { realm: this.realmName, id: group.id! },
      { ...data, id: one.id!, name: this.groupName },
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

    const group = this.parentGroupHandle.group ?? (await this.parentGroupHandle.get());
    if (!group) {
      throw new Error(`Group "${this.parentGroupName}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (one?.id) {
      await this.core.groups.updateChildGroup(
        { realm: this.realmName, id: group.id! },
        { ...data, id: one.id!, name: this.groupName },
      );
    } else {
      await this.core.groups.createChildGroup(
        { realm: this.realmName, id: group.id! },
        {
          ...data,
          name: this.groupName,
        },
      );
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
