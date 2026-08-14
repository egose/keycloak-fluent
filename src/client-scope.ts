import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, { type ClientScopeRepresentation } from './keycloak-admin-client';
import RealmHandle from './realm';
import ClientScopeProtocolMapperHandle from './protocol-mappers/client-scope-protocol-mapper';
import ClientScopeUserAttributeProtocolMapperHandle from './protocol-mappers/client-scope-user-attribute-protocol-mapper';
import ClientScopeHardcodedClaimProtocolMapperHandle from './protocol-mappers/client-scope-hardcoded-claim-protocol-mapper';
import ClientScopeAudienceProtocolMapperHandle from './protocol-mappers/client-scope-audience-protocol-mapper';
import { retryTransientAdminError } from './utils/retry';

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
export type ClientScopeInputData = Omit<ClientScopeRepresentationExt, 'name' | 'id'>;

function getClientScopeUpdateData(
  clientScope: ClientScopeRepresentation,
  data: ClientScopeInputData,
  scopeName: string,
) {
  return mergeUpdateData(clientScope, data, { name: scopeName });
}

export default class ClientScopeHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  public readonly realmName: string;
  private _scopeName: string;
  private _clientScope?: ClientScopeRepresentation | null;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, scopeName: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this._scopeName = scopeName;
  }

  public get scopeName(): string {
    return this._scopeName;
  }

  public get clientScope(): ClientScopeRepresentation | null | undefined {
    return this._clientScope;
  }

  /**
   * @internal Write-back used by child handles
   * (`ClientScopeProtocolMapperHandle`) to populate this parent's cached
   * representation after a resolution, so subsequent operations do not
   * duplicate lookups (per HANDLE-01). Not part of the public contract; do
   * not call from application code. Identity changes belong to
   * {@link rebind}.
   */
  public _setResolvedClientScope(rep: ClientScopeRepresentation, canonicalScopeName?: string): void {
    this._clientScope = rep;
    if (canonicalScopeName !== undefined) {
      this._scopeName = canonicalScopeName;
    }
  }

  /**
   * Re-targets this handle to a different client-scope identity and clears
   * the cached representation. The next read (`get()`/`require*()` or any
   * dependent operation) resolves against the new scope. Existing child
   * handles created from this one (e.g.
   * `clientScope.protocolMapper('y')`) read `scopeName`/`clientScope`
   * live from this parent per HANDLE-01, so they follow the rebind on
   * their next operation.
   *
   * Returns `this` for chaining.
   */
  public rebind(newScopeName: string): this {
    this._scopeName = newScopeName;
    this._clientScope = undefined;
    return this;
  }

  public async getById(id: string) {
    const one = await retryTransientAdminError(() => this.core.clientScopes.findOne({ realm: this.realmName, id }));
    this._clientScope = one ?? null;

    if (this._clientScope) {
      this._scopeName = this._clientScope.name!;
    }

    return this.clientScope ?? null;
  }

  public async get(): Promise<ClientScopeRepresentation | null> {
    const all = await retryTransientAdminError(() => this.core.clientScopes.find({ realm: this.realmName }));
    this._clientScope = all.find((c) => c.name === this.scopeName) ?? null;

    if (this._clientScope) {
      this._scopeName = this._clientScope.name!;
    }

    return this.clientScope ?? null;
  }

  public async create(data: ClientScopeInputData) {
    if (await this.get()) {
      throw new Error(`Client Scope "${this.scopeName}" already exists in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.clientScopes.create({ ...defaultScopeData, ...data, realm: this.realmName, name: this.scopeName }),
    );
    return this.get();
  }

  public async update(data: ClientScopeInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client Scope "${this.scopeName}" not found in realm "${this.realmName}"`);
    }

    const clientScopeId = one.id;

    await retryTransientAdminError(() =>
      this.core.clientScopes.update(
        { realm: this.realmName, id: clientScopeId },
        getClientScopeUpdateData(one, data, this.scopeName),
      ),
    );

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Client Scope "${this.scopeName}" not found in realm "${this.realmName}"`);
    }

    const clientScopeId = one.id;

    await retryTransientAdminError(() => this.core.clientScopes.del({ realm: this.realmName, id: clientScopeId }));
    this._clientScope = null;
    return this.scopeName;
  }

  public async ensure(data: ClientScopeInputData) {
    const one = await this.get();

    if (one?.id) {
      const clientScopeId = one.id;

      await retryTransientAdminError(() =>
        this.core.clientScopes.update(
          { realm: this.realmName, id: clientScopeId },
          getClientScopeUpdateData(one, data, this.scopeName),
        ),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.clientScopes.create({
          ...defaultScopeData,
          ...data,
          realm: this.realmName,
          name: this.scopeName,
        }),
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      const clientScopeId = one.id;

      await retryTransientAdminError(() => this.core.clientScopes.del({ realm: this.realmName, id: clientScopeId }));
      this._clientScope = null;
    }

    return this.scopeName;
  }

  public protocolMapper(mapperName: string) {
    return new ClientScopeProtocolMapperHandle(this.core, this, mapperName);
  }

  public userAttributeProtocolMapper(mapperName: string) {
    return new ClientScopeUserAttributeProtocolMapperHandle(this.core, this, mapperName);
  }

  public hardcodedClaimProtocolMapper(mapperName: string) {
    return new ClientScopeHardcodedClaimProtocolMapperHandle(this.core, this, mapperName);
  }

  public audienceProtocolMapper(mapperName: string) {
    return new ClientScopeAudienceProtocolMapperHandle(this.core, this, mapperName);
  }
}
