import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import ClientHandle from './client';

export default class RealmHandle {
  public core: KeycloakAdminClient;
  public realmName: string;
  public realm?: RealmRepresentation | null;
  public realmData?: Omit<RealmRepresentation, 'realm'>;

  constructor(core: KeycloakAdminClient, realmName: string) {
    this.core = core;
    this.realmName = realmName;
  }

  public async get(): Promise<RealmRepresentation | null> {
    const one = await this.core.realms.findOne({ realm: this.realmName });
    this.realm = one ?? null;

    if (this.realm?.realm) {
      this.realmName = this.realm.realm;
    }

    return this.realm;
  }

  public async create(data: Omit<RealmRepresentation, 'realm'>) {
    if (await this.get()) {
      throw new Error(`Realm "${this.realmName}" already exists`);
    }

    await this.core.realms.create({ ...data, realm: this.realmName });
    return this.get();
  }

  public async update(data: Omit<RealmRepresentation, 'realm'>) {
    if (!(await this.get())) {
      throw new Error(`Realm "${this.realmName}" not found`);
    }

    await this.core.realms.update({ realm: this.realmName }, { ...data });
    return this.get();
  }

  public async delete() {
    if (!(await this.get())) {
      throw new Error(`Realm "${this.realmName}" not found`);
    }

    await this.core.realms.del({ realm: this.realmName });
    this.realm = null;
    return this.realmName;
  }

  public async ensure(data: Omit<RealmRepresentation, 'realm'>) {
    this.realmData = data;

    const one = await this.get();
    if (one) {
      await this.core.realms.update({ realm: this.realmName }, { ...data });
    } else {
      await this.core.realms.create({ ...data, realm: this.realmName });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one) {
      await this.core.realms.del({ realm: this.realmName });
      this.realm = null;
    }

    return this.realmName;
  }

  public client(clientId: string) {
    return new ClientHandle(this.core, this, clientId);
  }
}
