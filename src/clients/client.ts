import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import CertificateRepresentation from '@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import CredentialRepresentation from '@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation';
import GlobalRequestResult from '@keycloak/keycloak-admin-client/lib/defs/globalRequestResult';
import KeyStoreConfig from '@keycloak/keycloak-admin-client/lib/defs/keystoreConfig';
import { ManagementPermissionReference } from '@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference';
import MappingsRepresentation from '@keycloak/keycloak-admin-client/lib/defs/mappingsRepresentation';
import PolicyEvaluationResponse from '@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse';
import PolicyProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation';
import PolicyRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import ProtocolMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation';
import ResourceEvaluation from '@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation';
import ResourceRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';
import type RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import ScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation';
import UserSessionRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation';
import RealmHandle from '../realm';
import ClientRoleHandle from '../client-role';
import type ClientScopeHandle from '../client-scope';
import { getClientByClientId, getClientById } from './client-lookup';
import type RoleHandle from '../role';
import ProtocolMapperHandle from '../protocol-mappers/protocol-mapper';
import UserAttributeProtocolMapperHandle from '../protocol-mappers/user-attribute-protocol-mapper';
import HardcodedClaimProtocolMapperHandle from '../protocol-mappers/hardcoded-claim-protocol-mapper';
import AudienceProtocolMapperHandle from '../protocol-mappers/audience-protocol-mapper';
import { retryTransientAdminError } from '../utils/retry';

function getPaginationParams(options?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 100);

  return {
    first: (page - 1) * pageSize,
    max: pageSize,
  };
}

function getClientUpdateData(client: ClientRepresentation, data: ClientInputData, clientId: string) {
  return _merge({}, client, data, { clientId });
}

export type ClientInputData = Omit<ClientRepresentation, 'realm' | 'clientId' | 'id'>;
export type AuthorizationResourceQuery = {
  id?: string;
  name?: string;
  type?: string;
  owner?: string;
  uri?: string;
  deep?: boolean;
  page?: number;
  pageSize?: number;
};
export type AuthorizationPolicyQuery = {
  id?: string;
  name?: string;
  type?: string;
  resource?: string;
  scope?: string;
  permission?: string;
  owner?: string;
  fields?: string;
  page?: number;
  pageSize?: number;
};
export type AuthorizationScopeQuery = {
  name?: string;
  deep?: boolean;
  policyId?: string;
  resource?: string;
  page?: number;
  pageSize?: number;
};
export type AuthorizationPermissionQuery = {
  name?: string;
  resource?: string;
  scope?: string;
  page?: number;
  pageSize?: number;
};

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
    return getClientById(core, realm, id);
  }

  static async getByClientId(core: KeycloakAdminClient, realm: string, clientId: string) {
    return getClientByClientId(core, realm, clientId);
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

  private async resolveTargetClient(clientHandle: ClientHandle) {
    const client = clientHandle.client ?? (await clientHandle.get());
    if (!client?.id) {
      throw new Error(`Client "${clientHandle.clientId}" not found in realm "${this.realmName}"`);
    }

    return client as ClientRepresentation & { id: string };
  }

  private async resolveRoleMapping(roleHandle: RoleHandle | ClientRoleHandle) {
    const role = roleHandle.role ?? (await roleHandle.get());
    if (!role?.id || !role.name) {
      throw new Error(`Role "${roleHandle.roleName}" not found in realm "${this.realmName}"`);
    }

    return role as RoleRepresentation & { id: string; name: string };
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

    const clientInternalId = one.id;
    const updateData = getClientUpdateData(one, data, this.clientId);

    await retryTransientAdminError(() =>
      this.core.clients.update({ realm: this.realmName, id: clientInternalId }, updateData),
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client "${this.clientId}" not found in realm "${this.realmName}"`);
    }

    const clientInternalId = one.id;

    await retryTransientAdminError(() => this.core.clients.del({ realm: this.realmName, id: clientInternalId }));
    this.client = null;
    return this.clientId;
  }

  public async ensure(data: ClientInputData) {
    this.clientData = data;

    const one = await this.get();

    if (one?.id) {
      const clientInternalId = one.id;
      const updateData = getClientUpdateData(one, data, this.clientId);

      await retryTransientAdminError(() =>
        this.core.clients.update({ realm: this.realmName, id: clientInternalId }, updateData),
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
      const clientInternalId = one.id;

      await retryTransientAdminError(() => this.core.clients.del({ realm: this.realmName, id: clientInternalId }));
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
    const clientInternalId = client.id;
    const clientScopeId = clientScope.id;

    await retryTransientAdminError(() =>
      this.core.clients.addDefaultClientScope({
        realm: this.realmName,
        id: clientInternalId,
        clientScopeId,
      }),
    );

    return this;
  }

  public async removeDefaultClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);
    const clientInternalId = client.id;
    const clientScopeId = clientScope.id;

    await retryTransientAdminError(() =>
      this.core.clients.delDefaultClientScope({
        realm: this.realmName,
        id: clientInternalId,
        clientScopeId,
      }),
    );

    return this;
  }

  public async listDefaultClientScopes() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listDefaultClientScopes({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async addOptionalClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);
    const clientInternalId = client.id;
    const clientScopeId = clientScope.id;

    await retryTransientAdminError(() =>
      this.core.clients.addOptionalClientScope({
        realm: this.realmName,
        id: clientInternalId,
        clientScopeId,
      }),
    );

    return this;
  }

  public async removeOptionalClientScope(clientScopeHandle: ClientScopeHandle) {
    const client = await this.requireClient();
    const clientScope = await this.resolveClientScope(clientScopeHandle);
    const clientInternalId = client.id;
    const clientScopeId = clientScope.id;

    await retryTransientAdminError(() =>
      this.core.clients.delOptionalClientScope({
        realm: this.realmName,
        id: clientInternalId,
        clientScopeId,
      }),
    );

    return this;
  }

  public async listOptionalClientScopes() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listOptionalClientScopes({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async getSecret(): Promise<CredentialRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getClientSecret({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async regenerateSecret(): Promise<CredentialRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.generateNewClientSecret({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async invalidateSecret() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.invalidateSecret({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async listProtocolMappers(): Promise<ProtocolMapperRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listProtocolMappers({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async listProtocolMappersByProtocol(protocol: string): Promise<ProtocolMapperRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.findProtocolMappersByProtocol({
        realm: this.realmName,
        id: clientInternalId,
        protocol,
      }),
    );
  }

  public async addProtocolMappers(mappers: ProtocolMapperRepresentation[]) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.addMultipleProtocolMappers(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        mappers,
      ),
    );

    return this;
  }

  public async listScopeMappings(): Promise<MappingsRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async addRealmScopeMappings(roleHandles: Array<RoleHandle | ClientRoleHandle>) {
    const client = await this.requireClient();
    const roles = await Promise.all(roleHandles.map((roleHandle) => this.resolveRoleMapping(roleHandle)));
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.addRealmScopeMappings(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        roles,
      ),
    );

    return this;
  }

  public async removeRealmScopeMappings(roleHandles: Array<RoleHandle | ClientRoleHandle>) {
    const client = await this.requireClient();
    const roles = await Promise.all(roleHandles.map((roleHandle) => this.resolveRoleMapping(roleHandle)));
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.delRealmScopeMappings(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        roles,
      ),
    );

    return this;
  }

  public async listRealmScopeMappings() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listRealmScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async listAvailableRealmScopeMappings() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listAvailableRealmScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async listCompositeRealmScopeMappings() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listCompositeRealmScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async addClientScopeMappings(
    targetClientHandle: ClientHandle,
    roleHandles: Array<RoleHandle | ClientRoleHandle>,
  ) {
    const client = await this.requireClient();
    const targetClient = await this.resolveTargetClient(targetClientHandle);
    const roles = await Promise.all(roleHandles.map((roleHandle) => this.resolveRoleMapping(roleHandle)));
    const clientInternalId = client.id;
    const targetClientId = targetClient.id;

    await retryTransientAdminError(() =>
      this.core.clients.addClientScopeMappings(
        {
          realm: this.realmName,
          id: clientInternalId,
          client: targetClientId,
        },
        roles,
      ),
    );

    return this;
  }

  public async removeClientScopeMappings(
    targetClientHandle: ClientHandle,
    roleHandles: Array<RoleHandle | ClientRoleHandle>,
  ) {
    const client = await this.requireClient();
    const targetClient = await this.resolveTargetClient(targetClientHandle);
    const roles = await Promise.all(roleHandles.map((roleHandle) => this.resolveRoleMapping(roleHandle)));
    const clientInternalId = client.id;
    const targetClientId = targetClient.id;

    await retryTransientAdminError(() =>
      this.core.clients.delClientScopeMappings(
        {
          realm: this.realmName,
          id: clientInternalId,
          client: targetClientId,
        },
        roles,
      ),
    );

    return this;
  }

  public async listClientScopeMappings(targetClientHandle: ClientHandle) {
    const client = await this.requireClient();
    const targetClient = await this.resolveTargetClient(targetClientHandle);
    const clientInternalId = client.id;
    const targetClientId = targetClient.id;

    return retryTransientAdminError(() =>
      this.core.clients.listClientScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
        client: targetClientId,
      }),
    );
  }

  public async listAvailableClientScopeMappings(targetClientHandle: ClientHandle) {
    const client = await this.requireClient();
    const targetClient = await this.resolveTargetClient(targetClientHandle);
    const clientInternalId = client.id;
    const targetClientId = targetClient.id;

    return retryTransientAdminError(() =>
      this.core.clients.listAvailableClientScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
        client: targetClientId,
      }),
    );
  }

  public async listCompositeClientScopeMappings(targetClientHandle: ClientHandle) {
    const client = await this.requireClient();
    const targetClient = await this.resolveTargetClient(targetClientHandle);
    const clientInternalId = client.id;
    const targetClientId = targetClient.id;

    return retryTransientAdminError(() =>
      this.core.clients.listCompositeClientScopeMappings({
        realm: this.realmName,
        id: clientInternalId,
        client: targetClientId,
      }),
    );
  }

  public async listSessions(options?: { page?: number; pageSize?: number }): Promise<UserSessionRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;
    const { first, max } = getPaginationParams(options);

    return retryTransientAdminError(() =>
      this.core.clients.listSessions({
        realm: this.realmName,
        id: clientInternalId,
        first,
        max,
      }),
    );
  }

  public async listOfflineSessions(options?: {
    page?: number;
    pageSize?: number;
  }): Promise<UserSessionRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;
    const { first, max } = getPaginationParams(options);

    return retryTransientAdminError(() =>
      this.core.clients.listOfflineSessions({
        realm: this.realmName,
        id: clientInternalId,
        first,
        max,
      }),
    );
  }

  public async getSessionCount() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getSessionCount({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async getOfflineSessionCount() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getOfflineSessionCount({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async generateRegistrationAccessToken() {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.generateRegistrationAccessToken({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async getInstallationProvider(providerId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getInstallationProviders({
        realm: this.realmName,
        id: clientInternalId,
        providerId,
      }),
    );
  }

  public async pushRevocation(): Promise<GlobalRequestResult> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.pushRevocation({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async addClusterNode(node: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.addClusterNode({
        realm: this.realmName,
        id: clientInternalId,
        node,
      }),
    );

    return this;
  }

  public async removeClusterNode(node: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.deleteClusterNode({
        realm: this.realmName,
        id: clientInternalId,
        node,
      }),
    );

    return this;
  }

  public async testNodesAvailable(): Promise<GlobalRequestResult> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.testNodesAvailable({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async getKeyInfo(attr: string): Promise<CertificateRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getKeyInfo({
        realm: this.realmName,
        id: clientInternalId,
        attr,
      }),
    );
  }

  public async generateKey(attr: string): Promise<CertificateRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.generateKey({
        realm: this.realmName,
        id: clientInternalId,
        attr,
      }),
    );
  }

  public async downloadKey(attr: string, config: KeyStoreConfig) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.downloadKey(
        {
          realm: this.realmName,
          id: clientInternalId,
          attr,
        },
        config,
      ),
    );
  }

  public async generateAndDownloadKey(attr: string, config: KeyStoreConfig) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.generateAndDownloadKey(
        {
          realm: this.realmName,
          id: clientInternalId,
          attr,
        },
        config,
      ),
    );
  }

  public async uploadKey(attr: string, data: FormData) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.uploadKey(
        {
          realm: this.realmName,
          id: clientInternalId,
          attr,
        },
        data,
      ),
    );
  }

  public async uploadCertificate(attr: string, data: FormData) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.uploadCertificate(
        {
          realm: this.realmName,
          id: clientInternalId,
          attr,
        },
        data,
      ),
    );
  }

  public async listPermissions(): Promise<ManagementPermissionReference> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listFineGrainPermissions({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async updatePermissions(data: ManagementPermissionReference): Promise<ManagementPermissionReference> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.updateFineGrainPermission(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        data,
      ),
    );
  }

  public async getResourceServer(): Promise<ResourceServerRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getResourceServer({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async updateResourceServer(data: ResourceServerRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.updateResourceServer(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        data,
      ),
    );

    return this.getResourceServer();
  }

  public async importResourceServer(data: ResourceServerRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.importResource(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        data,
      ),
    );
  }

  public async exportResourceServer(): Promise<ResourceServerRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.exportResource({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async evaluateAuthorization(data: ResourceEvaluation): Promise<PolicyEvaluationResponse> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.evaluateResource(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        data,
      ),
    );
  }

  public async listResources(query?: AuthorizationResourceQuery): Promise<ResourceRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;
    const { first, max } = getPaginationParams(query);

    return retryTransientAdminError(() =>
      this.core.clients.listResources({
        realm: this.realmName,
        id: clientInternalId,
        first,
        max,
        name: query?.name,
        type: query?.type,
        owner: query?.owner,
        uri: query?.uri,
        deep: query?.deep,
      }),
    );
  }

  public async getResource(resourceId: string): Promise<ResourceRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getResource({
        realm: this.realmName,
        id: clientInternalId,
        resourceId,
      }),
    );
  }

  public async createResource(data: ResourceRepresentation): Promise<ResourceRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.createResource(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        data,
      ),
    );
  }

  public async updateResource(resourceId: string, data: ResourceRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.updateResource(
        {
          realm: this.realmName,
          id: clientInternalId,
          resourceId,
        },
        data,
      ),
    );

    return this.getResource(resourceId);
  }

  public async deleteResource(resourceId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.delResource({
        realm: this.realmName,
        id: clientInternalId,
        resourceId,
      }),
    );
  }

  public async listAuthorizationPolicies(query?: AuthorizationPolicyQuery): Promise<PolicyRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;
    const { first, max } = getPaginationParams(query);

    const policies = await retryTransientAdminError(() =>
      this.core.clients.listPolicies({
        realm: this.realmName,
        id: clientInternalId,
        first,
        max,
        name: query?.name,
        type: query?.type,
        resource: query?.resource,
        scope: query?.scope,
        permission: query?.permission,
        owner: query?.owner,
        fields: query?.fields,
      }),
    );

    return Array.isArray(policies) ? policies : [];
  }

  public async findAuthorizationPolicyByName(name: string): Promise<PolicyRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.findPolicyByName({
        realm: this.realmName,
        id: clientInternalId,
        name,
      }),
    );
  }

  public async createAuthorizationPolicy(type: string, data: PolicyRepresentation): Promise<PolicyRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.createPolicy(
        {
          realm: this.realmName,
          id: clientInternalId,
          type,
        },
        data,
      ),
    );
  }

  public async getAuthorizationPolicy(type: string, policyId: string): Promise<PolicyRepresentation | undefined> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(
      () =>
        this.core.clients.findOnePolicyWithType({
          realm: this.realmName,
          id: clientInternalId,
          type,
          policyId,
        }) as Promise<PolicyRepresentation | undefined>,
    );
  }

  public async updateAuthorizationPolicy(type: string, policyId: string, data: PolicyRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.updatePolicy(
        {
          realm: this.realmName,
          id: clientInternalId,
          type,
          policyId,
        },
        data,
      ),
    );

    return this.getAuthorizationPolicy(type, policyId);
  }

  public async deleteAuthorizationPolicy(policyId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.delPolicy({
        realm: this.realmName,
        id: clientInternalId,
        policyId,
      }),
    );
  }

  public async listDependentAuthorizationPolicies(policyId: string): Promise<PolicyRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listDependentPolicies({
        realm: this.realmName,
        id: clientInternalId,
        policyId,
      }),
    );
  }

  public async listAuthorizationPolicyProviders(): Promise<PolicyProviderRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listPolicyProviders({
        realm: this.realmName,
        id: clientInternalId,
      }),
    );
  }

  public async listAuthorizationScopes(query?: AuthorizationScopeQuery): Promise<ScopeRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;
    const { first, max } = getPaginationParams(query);

    return retryTransientAdminError(() =>
      this.core.clients.listAllScopes({
        realm: this.realmName,
        id: clientInternalId,
        name: query?.name,
        deep: query?.deep,
        first,
        max,
      }),
    );
  }

  public async listAuthorizationPermissionsByScope(scopeId: string): Promise<PolicyRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listAllPermissionsByScope({
        realm: this.realmName,
        id: clientInternalId,
        scopeId,
      }),
    );
  }

  public async listAuthorizationResourcesByScope(scopeId: string): Promise<ResourceRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.listAllResourcesByScope({
        realm: this.realmName,
        id: clientInternalId,
        scopeId,
      }),
    );
  }

  public async getAuthorizationScope(scopeId: string): Promise<ScopeRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getAuthorizationScope({
        realm: this.realmName,
        id: clientInternalId,
        scopeId,
      }),
    );
  }

  public async createAuthorizationScope(data: ScopeRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.createAuthorizationScope(
        {
          realm: this.realmName,
          id: clientInternalId,
        },
        data,
      ),
    );
  }

  public async updateAuthorizationScope(scopeId: string, data: ScopeRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.updateAuthorizationScope(
        {
          realm: this.realmName,
          id: clientInternalId,
          scopeId,
        },
        data,
      ),
    );

    return this.getAuthorizationScope(scopeId);
  }

  public async deleteAuthorizationScope(scopeId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.delAuthorizationScope({
        realm: this.realmName,
        id: clientInternalId,
        scopeId,
      }),
    );
  }

  public async findAuthorizationPermissions(query?: AuthorizationPermissionQuery): Promise<PolicyRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;
    const { first, max } = getPaginationParams(query);

    return retryTransientAdminError(() =>
      this.core.clients.findPermissions({
        realm: this.realmName,
        id: clientInternalId,
        name: query?.name,
        resource: query?.resource,
        scope: query?.scope,
        first,
        max,
      }),
    );
  }

  public async getAuthorizationPermission(
    type: string,
    permissionId: string,
  ): Promise<PolicyRepresentation | undefined> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.findOnePermission({
        realm: this.realmName,
        id: clientInternalId,
        type,
        permissionId,
      }),
    );
  }

  public async createAuthorizationPermission(type: string, data: PolicyRepresentation): Promise<PolicyRepresentation> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.createPermission(
        {
          realm: this.realmName,
          id: clientInternalId,
          type,
        },
        data,
      ),
    );
  }

  public async updateAuthorizationPermission(type: string, permissionId: string, data: PolicyRepresentation) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.updatePermission(
        {
          realm: this.realmName,
          id: clientInternalId,
          type,
          permissionId,
        },
        data,
      ),
    );

    return this.getAuthorizationPermission(type, permissionId);
  }

  public async deleteAuthorizationPermission(type: string, permissionId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    await retryTransientAdminError(() =>
      this.core.clients.delPermission({
        realm: this.realmName,
        id: clientInternalId,
        type,
        permissionId,
      }),
    );
  }

  public async getAssociatedAuthorizationScopes(permissionId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getAssociatedScopes({
        realm: this.realmName,
        id: clientInternalId,
        permissionId,
      }),
    );
  }

  public async getAssociatedAuthorizationResources(permissionId: string) {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getAssociatedResources({
        realm: this.realmName,
        id: clientInternalId,
        permissionId,
      }),
    );
  }

  public async getAssociatedAuthorizationPolicies(permissionId: string): Promise<PolicyRepresentation[]> {
    const client = await this.requireClient();
    const clientInternalId = client.id;

    return retryTransientAdminError(() =>
      this.core.clients.getAssociatedPolicies({
        realm: this.realmName,
        id: clientInternalId,
        permissionId,
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
