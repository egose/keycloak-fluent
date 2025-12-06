import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import RealmHandle from './realm';
import ClientRoleHandle from './client-role';

export type ClientInputData = Omit<ClientRepresentation, 'realm | clientId | id'>;

export default class ClientHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public clientId: string;
  public client?: ClientRepresentation | null;
  public clientData?: ClientInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, clientId: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.clientId = clientId;
  }

  public async getById(id: string) {
    const one = await this.core.clients.findOne({ realm: this.realmName, id });
    this.client = one ?? null;

    if (this.client) {
      this.clientId = this.client.clientId!;
    }

    return this.client;
  }

  public async get(): Promise<ClientRepresentation | null> {
    const ones = await this.core.clients.find({ realm: this.realmName, clientId: this.clientId });
    this.client = ones.length > 0 ? ones[0] : null;

    if (this.client) {
      this.clientId = this.client.clientId!;
    }

    return this.client;
  }

  public async create(data: ClientInputData) {
    if (await this.get()) {
      throw new Error(`Client "${this.clientId}" already exists in realm "${this.realmName}"`);
    }

    await this.core.clients.create({ ...data, realm: this.realmName, clientId: this.clientId });
    return this.get();
  }

  public async update(data: ClientInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    await this.core.clients.update({ realm: this.realmName, id: one.id }, { ...data, clientId: this.clientId });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    await this.core.clients.del({ realm: this.realmName, id: one.id });
    this.client = null;
    return this.clientId;
  }

  public async ensure(data: ClientInputData) {
    this.clientData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.clients.update({ realm: this.realmName, id: one.id }, { ...data, clientId: this.clientId });
    } else {
      await this.core.clients.create({ ...data, realm: this.realmName, clientId: this.clientId });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.clients.del({ realm: this.realmName, id: one.id });
      this.client = null;
    }

    return this.clientId;
  }

  public role(roleName: string) {
    return new ClientRoleHandle(this.core, this, roleName);
  }
}
