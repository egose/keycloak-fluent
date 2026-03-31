import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import CredentialRepresentation from '@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation';
import RealmHandle from '../realm';
import ClientRoleHandle from '../client-role';
import type ClientScopeHandle from '../client-scope';
import ProtocolMapperHandle from '../protocol-mappers/protocol-mapper';
import UserAttributeProtocolMapperHandle from '../protocol-mappers/user-attribute-protocol-mapper';
import HardcodedClaimProtocolMapperHandle from '../protocol-mappers/hardcoded-claim-protocol-mapper';
import AudienceProtocolMapperHandle from '../protocol-mappers/audience-protocol-mapper';

function isTransientAdminError(error: unknown) {
  return error instanceof Error && error.message.includes('unknown_error');
}

async function retryTransientAdminError<T>(operation: () => Promise<T>, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientAdminError(error) || attempt === attempts - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }

  throw new Error('Unreachable');
}

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

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminError(() => core.clients.findOne({ realm, id }));
    return one ?? null;
  }

  static async getByClientId(core: KeycloakAdminClient, realm: string, clientId: string) {
    const ones = await retryTransientAdminError(() => core.clients.find({ realm, clientId }));
    return ones.find((v) => v.clientId === clientId) ?? null;
  }

  private async requireClient(): Promise<ClientRepresentation & { id: string }> {
    const client = this.client ?? (await this.get());
    if (!client?.id) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    return client as ClientRepresentation & { id: string };
  }

  private async resolveClientScope(clientScopeHandle: ClientScopeHandle) {
    const clientScope = clientScopeHandle.clientScope ?? (await clientScopeHandle.get());
    if (!clientScope?.id) {
      throw new Error(`Client Scope "${clientScopeHandle.scopeName}" not found in realm "${this.realmName}"`);
    }

    return clientScope as ClientScopeRepresentation & { id: string };
  }

  public async getById(id: string) {
    this.client = await ClientHandle.getById(this.core, this.realmName, id);

    if (this.client) {
      this.clientId = this.client.clientId!;
    }

    return this.client;
  }

  public async get(): Promise<ClientRepresentation | null> {
    this.client = await ClientHandle.getByClientId(this.core, this.realmName, this.clientId);

    if (this.client) {
      this.clientId = this.client.clientId!;
    }

    return this.client;
  }

  public async create(data: ClientInputData) {
    if (await this.get()) {
      throw new Error(`Client "${this.clientId}" already exists in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.clients.create({ ...data, realm: this.realmName, clientId: this.clientId }),
    );
    return this.get();
  }

  public async update(data: ClientInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.clients.update({ realm: this.realmName, id: one.id }, { ...data, clientId: this.clientId }),
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() => this.core.clients.del({ realm: this.realmName, id: one.id }));
    this.client = null;
    return this.clientId;
  }

  public async ensure(data: ClientInputData) {
    this.clientData = data;

    const one = await this.get();

    if (one?.id) {
      await retryTransientAdminError(() =>
        this.core.clients.update({ realm: this.realmName, id: one.id }, { ...data, clientId: this.clientId }),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.clients.create({ ...data, realm: this.realmName, clientId: this.clientId }),
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await retryTransientAdminError(() => this.core.clients.del({ realm: this.realmName, id: one.id }));
      this.client = null;
    }

    return this.clientId;
  }

  public async searchRoles(keyword: string) {
    const one = await this.requireClient();

    const result = await this.core.clients.listRoles({
      realm: this.realmName,
      id: one.id,
    });

    const lowerkeyword = keyword.toLocaleLowerCase();

    return result.filter((item) => {
      if (!item.name) return false;

      return item.name.toLocaleLowerCase().includes(lowerkeyword);
    });
  }

  public async addDefaultClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);

    await retryTransientAdminError(() =>
      this.core.clients.addDefaultClientScope({
        realm: this.realmName,
        id: client.id,
        clientScopeId: clientScope.id,
      }),
    );

    return this;
  }

  public async removeDefaultClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);

    await retryTransientAdminError(() =>
      this.core.clients.delDefaultClientScope({
        realm: this.realmName,
        id: client.id,
        clientScopeId: clientScope.id,
      }),
    );

    return this;
  }

  public async listDefaultClientScopes() {
    const client = await this.requireClient();

    return retryTransientAdminError(() =>
      this.core.clients.listDefaultClientScopes({
        realm: this.realmName,
        id: client.id,
      }),
    );
  }

  public async addOptionalClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);

    await retryTransientAdminError(() =>
      this.core.clients.addOptionalClientScope({
        realm: this.realmName,
        id: client.id,
        clientScopeId: clientScope.id,
      }),
    );

    return this;
  }

  public async removeOptionalClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);

    await retryTransientAdminError(() =>
      this.core.clients.delOptionalClientScope({
        realm: this.realmName,
        id: client.id,
        clientScopeId: clientScope.id,
      }),
    );

    return this;
  }

  public async listOptionalClientScopes() {
    const client = await this.requireClient();

    return retryTransientAdminError(() =>
      this.core.clients.listOptionalClientScopes({
        realm: this.realmName,
        id: client.id,
      }),
    );
  }

  public async getSecret(): Promise<CredentialRepresentation> {
    const client = await this.requireClient();

    return retryTransientAdminError(() =>
      this.core.clients.getClientSecret({
        realm: this.realmName,
        id: client.id,
      }),
    );
  }

  public async regenerateSecret(): Promise<CredentialRepresentation> {
    const client = await this.requireClient();

    return retryTransientAdminError(() =>
      this.core.clients.generateNewClientSecret({
        realm: this.realmName,
        id: client.id,
      }),
    );
  }

  public async invalidateSecret() {
    const client = await this.requireClient();

    await retryTransientAdminError(() =>
      this.core.clients.invalidateSecret({
        realm: this.realmName,
        id: client.id,
      }),
    );
  }

  public role(roleName: string) {
    return new ClientRoleHandle(this.core, this, roleName);
  }

  public protocolMapper(mapperName: string) {
    return new ProtocolMapperHandle(this.core, this, mapperName);
  }

  public userAttributeProtocolMapper(mapperName: string) {
    return new UserAttributeProtocolMapperHandle(this.core, this, mapperName);
  }

  public hardcodedClaimProtocolMapper(mapperName: string) {
    return new HardcodedClaimProtocolMapperHandle(this.core, this, mapperName);
  }

  public audienceProtocolMapper(mapperName: string) {
    return new AudienceProtocolMapperHandle(this.core, this, mapperName);
  }
}
