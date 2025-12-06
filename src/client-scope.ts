import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import RealmHandle from './realm';

export type ClientScopeType = 'none' | 'default' | 'optional';
export type ClientScopeProtocol = 'openid-connect' | 'saml';

export const defaultScopeData = Object.freeze({
  description: '',
  type: 'none',
  protocol: 'openid-connect',
  attributes: {
    'display.on.consent.screen': 'true',
    'include.in.token.scope': 'false',
    'consent.screen.text': '',
    'gui.order': '',
  },
});

export interface ClientScopeRepresentationExt extends ClientScopeRepresentation {
  type?: ClientScopeType;
  protocol?: ClientScopeProtocol;
}
export type ClientScopeInputData = Omit<ClientScopeRepresentationExt, 'name | id'>;

export default class ClientScopeHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public scopeName: string;
  public clientScope?: ClientScopeRepresentation | null;
  public clientScopeData?: Omit<ClientScopeRepresentation, 'name | id'>;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, scopeName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.scopeName = scopeName;
  }

  public async getById(id: string) {
    const one = await this.core.clientScopes.findOne({ realm: this.realmName, id });
    this.clientScope = one ?? null;

    if (this.clientScope) {
      this.scopeName = this.clientScope.name!;
    }

    return this.clientScope;
  }

  public async get(): Promise<ClientScopeRepresentation | null> {
    const all = await this.core.clientScopes.find({ realm: this.realmName });
    this.clientScope = all.find((c) => c.name === this.scopeName) ?? null;

    if (this.clientScope) {
      this.scopeName = this.clientScope.name!;
    }

    return this.clientScope;
  }

  public async create(data: ClientScopeInputData) {
    if (await this.get()) {
      throw new Error(`Client Scope "${this.clientScope}" already exists in realm "${this.realmName}"`);
    }

    await this.core.clientScopes.create({ ...defaultScopeData, ...data, realm: this.realmName, name: this.scopeName });
    return this.get();
  }

  public async update(data: ClientScopeInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client Scope "${this.scopeName}" not found in realm "${this.realmName}"`);
    }

    await this.core.clientScopes.update(
      { realm: this.realmName, id: one.id },
      { ...defaultScopeData, ...data, name: this.scopeName },
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client Scope "${this.scopeName}" not found in realm "${this.realmName}"`);
    }

    await this.core.clientScopes.del({ realm: this.realmName, id: one.id });
    this.clientScope = null;
    return this.scopeName;
  }

  public async ensure(data: ClientScopeInputData) {
    this.clientScopeData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.clientScopes.update(
        { realm: this.realmName, id: one.id },
        { ...defaultScopeData, ...data, name: this.scopeName },
      );
    } else {
      await this.core.clientScopes.create({
        ...defaultScopeData,
        ...data,
        realm: this.realmName,
        name: this.scopeName,
      });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.clientScopes.del({ realm: this.realmName, id: one.id });
      this.clientScope = null;
    }

    return this.scopeName;
  }
}
