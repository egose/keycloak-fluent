import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import RealmHandle from './realm';

export type RoleInputData = Omit<RoleRepresentation, 'name | id'>;

export default class RoleHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public roleName: string;
  public role?: RoleRepresentation | null;
  public roleData?: RoleInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, roleName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.roleName = roleName;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await core.roles.findOneById({ realm, id });
    return one ?? null;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, roleName: string) {
    const one = await core.roles.findOneByName({ realm, name: roleName });
    return one ?? null;
  }

  public async getById(id: string) {
    this.role = await RoleHandle.getById(this.core, this.realmName, id);

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role;
  }

  public async get(): Promise<RoleRepresentation | null> {
    this.role = await RoleHandle.getByName(this.core, this.realmName, this.roleName);

    if (this.role) {
      this.roleName = this.role.name!;
    }

    return this.role;
  }

  public async create(data: RoleInputData) {
    if (await this.get()) {
      throw new Error(`Role "${this.roleName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.roles.create({ ...data, realm: this.realmName, name: this.roleName });
    return this.get();
  }

  public async update(data: RoleInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.roles.updateById({ realm: this.realmName, id: one.id }, { ...data, name: this.roleName });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Role "${this.roleName}" not found in realm "${this.realmName}"`);
    }

    await this.core.roles.delById({ realm: this.realmName, id: one.id });

    this.role = null;
    return this.roleName;
  }

  public async ensure(data: RoleInputData) {
    this.roleData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.roles.updateById({ realm: this.realmName, id: one.id }, { ...data, name: this.roleName });
    } else {
      await this.core.roles.create({ ...data, realm: this.realmName, name: this.roleName });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.roles.delById({ realm: this.realmName, id: one.id });
      this.role = null;
    }

    return this.roleName;
  }
}
