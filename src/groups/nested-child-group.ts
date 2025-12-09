import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import GroupHandle from './group';
import { AbstractGroupHandle } from './abstract-group';

export type NestedChildGroupInputData = Omit<GroupRepresentation, 'name | id'>;

export default class NestedChildGroupHandle extends AbstractGroupHandle {
  public parentGroupPath: string;
  public groupData?: NestedChildGroupInputData;

  constructor(core: KeycloakAdminClient, realmName: string, parentGroupPath: string, groupName: string) {
    super(core, realmName, groupName);
    this.core = core;
    this.parentGroupPath = parentGroupPath;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, parentGroupPath: string, groupName: string) {
    const group = await GroupHandle.getByPath(core, realm, `${parentGroupPath}/${groupName}`);
    return group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    this.group = await NestedChildGroupHandle.getByName(
      this.core,
      this.realmName,
      this.parentGroupPath,
      this.groupName,
    );

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async create(data: NestedChildGroupInputData) {
    if (await this.get()) {
      throw new Error(`Child Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    const parentGroup = await GroupHandle.getByPath(this.core, this.realmName, this.parentGroupPath);
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

    return this.get();
  }

  public async update(data: NestedChildGroupInputData) {
    const parentGroup = await GroupHandle.getByPath(this.core, this.realmName, this.parentGroupPath);
    if (!parentGroup) {
      throw new Error(`Parent Group Path "${this.parentGroupPath}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Child Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.updateChildGroup(
      { realm: this.realmName, id: parentGroup.id! },
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

  public async ensure(data: NestedChildGroupInputData) {
    this.groupData = data;

    const parentGroup = await GroupHandle.getByPath(this.core, this.realmName, this.parentGroupPath);
    if (!parentGroup) {
      throw new Error(`Parent Group Path "${this.parentGroupPath}" not found in realm "${this.realmName}"`);
    }

    const one = await this.get();
    if (one?.id) {
      await this.core.groups.updateChildGroup(
        { realm: this.realmName, id: parentGroup.id! },
        { ...data, id: one.id!, name: this.groupName },
      );
    } else {
      await this.core.groups.createChildGroup(
        { realm: this.realmName, id: parentGroup.id! },
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
      `${this.parentGroupPath}/${this.groupName}`,
      groupName,
    );
  }
}
