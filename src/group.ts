import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RealmHandle from './realm';

export type RoleInputData = Omit<GroupRepresentation, 'name | id'>;

export default class RoleHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public groupName: string;
  public group?: GroupRepresentation | null;
  public groupData?: RoleInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, groupName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.groupName = groupName;
  }

  public async getById(id: string) {
    const one = await this.core.groups.findOne({ realm: this.realmName, id });
    this.group = one ?? null;

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    const ones = await this.core.groups.find({ realm: this.realmName, search: this.groupName, exact: true });
    this.group = ones.length > 0 ? ones[0] : null;

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async create(data: RoleInputData) {
    if (await this.get()) {
      throw new Error(`Role "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.groups.create({ ...data, realm: this.realmName, name: this.groupName });
    return this.get();
  }

  public async update(data: RoleInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.update({ realm: this.realmName, id: one.id }, { ...data, name: this.groupName });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.del({ realm: this.realmName, id: one.id });

    this.group = null;
    return this.groupName;
  }

  public async ensure(data: RoleInputData) {
    this.groupData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.groups.update({ realm: this.realmName, id: one.id }, { ...data, name: this.groupName });
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
}
