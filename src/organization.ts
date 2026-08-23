import { mergeUpdateData } from './utils/merge-update-data';
import KeycloakAdminClient, {
  type IdentityProviderRepresentation,
  type OrganizationRepresentation,
  type UserRepresentation,
} from './keycloak-admin-client';
import type IdentityProviderHandle from './identity-provider';
import RealmHandle from './realm';
import type UserHandle from './user';
import { retryTransientAdminError, retryTransientAdminReadError } from './utils/retry';
import { fetchAll } from './utils/fetch-all';
import { assertOwnedHandle } from './utils/resource-ownership';
import { makeHandleIdentityVersion, ParentIdentityTracker } from './utils/handle-identity';
import { toSinglePageQuery } from './utils/single-page-query';

function getOrganizationUpdateData(
  organization: OrganizationRepresentation,
  data: OrganizationInputData,
  organizationAlias: string,
) {
  return mergeUpdateData(organization, data, { alias: organizationAlias });
}

export const defaultOrganizationData = Object.freeze({
  enabled: true,
});

export type OrganizationInputData = Omit<OrganizationRepresentation, 'id' | 'alias'>;

export default class OrganizationHandle {
  public readonly core: KeycloakAdminClient;
  public readonly realmHandle: RealmHandle;
  private _organizationAlias: string;
  private _organization?: OrganizationRepresentation | null;
  private _identityGeneration = 0;
  private readonly parentIdentity: ParentIdentityTracker;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, organizationAlias: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this._organizationAlias = organizationAlias;
    this.parentIdentity = new ParentIdentityTracker(realmHandle);
  }

  private invalidateParentCache() {
    if (this.parentIdentity.invalidateIfChanged(() => (this._organization = undefined))) {
      this._identityGeneration++;
    }
  }

  public get realmName(): string {
    return this.realmHandle.realmName;
  }

  public get identityVersion(): string {
    this.invalidateParentCache();
    return makeHandleIdentityVersion(this._identityGeneration, this.realmHandle);
  }

  public get organizationAlias(): string {
    return this._organizationAlias;
  }

  public get organization(): OrganizationRepresentation | null | undefined {
    this.invalidateParentCache();
    return this._organization;
  }

  /**
   * Re-targets this handle to a different organization alias and clears the
   * cached representation. Returns `this` for chaining.
   */
  public rebind(newOrganizationAlias: string): this {
    if (newOrganizationAlias === this._organizationAlias) return this;
    this._organizationAlias = newOrganizationAlias;
    this._organization = undefined;
    this._identityGeneration++;
    return this;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminReadError(() => core.organizations.findOne({ realm, id }));
    return one ?? null;
  }

  static async getByAlias(core: KeycloakAdminClient, realm: string, organizationAlias: string) {
    const organizations = await retryTransientAdminReadError(() =>
      core.organizations.find({
        realm,
        search: organizationAlias,
        exact: true,
      }),
    );

    const matches = organizations.filter((organization) => organization.alias === organizationAlias);
    if (matches.length > 1) {
      throw new Error(`Organization alias "${organizationAlias}" is ambiguous in realm "${realm}"`);
    }

    return matches[0] ?? null;
  }

  private async requireOrganization(): Promise<OrganizationRepresentation & { id: string }> {
    const organization = this.organization ?? (await this.get());
    if (!organization?.id) {
      throw new Error(`Organization "${this.organizationAlias}" not found in realm "${this.realmName}"`);
    }

    return organization as OrganizationRepresentation & { id: string };
  }

  private async resolveUser(userHandle: UserHandle) {
    const user = userHandle.user ?? (await userHandle.get());
    if (!user?.id) {
      throw new Error(`User "${userHandle.username}" not found in realm "${this.realmName}"`);
    }

    return user as UserRepresentation & { id: string };
  }

  private async resolveIdentityProvider(identityProviderHandle: IdentityProviderHandle) {
    const identityProvider = identityProviderHandle.identityProvider ?? (await identityProviderHandle.get());
    if (!identityProvider?.alias) {
      throw new Error(`Identity Provider "${identityProviderHandle.alias}" not found in realm "${this.realmName}"`);
    }

    return identityProvider as IdentityProviderRepresentation & { alias: string };
  }

  public async getById(id: string) {
    this.invalidateParentCache();
    this._organization = await OrganizationHandle.getById(this.core, this.realmName, id);

    if (this._organization?.alias) {
      if (this._organizationAlias !== this._organization.alias) this._identityGeneration++;
      this._organizationAlias = this._organization.alias;
    }

    return this.organization ?? null;
  }

  public async get(): Promise<OrganizationRepresentation | null> {
    this.invalidateParentCache();
    this._organization = await OrganizationHandle.getByAlias(this.core, this.realmName, this.organizationAlias);

    if (this._organization?.alias) {
      if (this._organizationAlias !== this._organization.alias) this._identityGeneration++;
      this._organizationAlias = this._organization.alias;
    }

    return this.organization ?? null;
  }

  public async create(data: OrganizationInputData) {
    if (await this.get()) {
      throw new Error(`Organization "${this.organizationAlias}" already exists in realm "${this.realmName}"`);
    }

    await retryTransientAdminError(() =>
      this.core.organizations.create({
        ...defaultOrganizationData,
        ...data,
        realm: this.realmName,
        alias: this.organizationAlias,
      }),
    );

    return this.get();
  }

  public async update(data: OrganizationInputData) {
    const organization = await this.requireOrganization();
    const organizationId = organization.id;

    await retryTransientAdminError(() =>
      this.core.organizations.updateById(
        {
          realm: this.realmName,
          id: organizationId,
        },
        getOrganizationUpdateData(organization, data, this.organizationAlias),
      ),
    );

    return this.getById(organizationId);
  }

  public async delete() {
    const organization = await this.requireOrganization();
    const organizationId = organization.id;

    await retryTransientAdminError(() =>
      this.core.organizations.delById({
        realm: this.realmName,
        id: organizationId,
      }),
    );

    this._organization = null;
    return this.organizationAlias;
  }

  public async ensure(data: OrganizationInputData) {
    const organization = await this.get();
    if (organization?.id) {
      const organizationId = organization.id;

      await retryTransientAdminError(() =>
        this.core.organizations.updateById(
          {
            realm: this.realmName,
            id: organizationId,
          },
          getOrganizationUpdateData(organization, data, this.organizationAlias),
        ),
      );
    } else {
      await retryTransientAdminError(() =>
        this.core.organizations.create({
          ...defaultOrganizationData,
          ...data,
          realm: this.realmName,
          alias: this.organizationAlias,
        }),
      );
    }

    await this.get();
    return this;
  }

  public async discard() {
    const organization = await this.get();
    if (organization?.id) {
      const organizationId = organization.id;

      await retryTransientAdminError(() =>
        this.core.organizations.delById({
          realm: this.realmName,
          id: organizationId,
        }),
      );
      this._organization = null;
    }

    return this.organizationAlias;
  }

  public async listMembers(options?: {
    page?: number;
    pageSize?: number;
    first?: number;
    max?: number;
    membershipType?: string;
    exact?: boolean;
    search?: string;
  }): Promise<UserRepresentation[]> {
    const { first, max } = toSinglePageQuery(options, 'OrganizationHandle.listMembers');
    const organization = await this.requireOrganization();

    return retryTransientAdminReadError(() =>
      this.core.organizations.listMembers({
        realm: this.realmName,
        orgId: organization.id,
        first,
        max,
        membershipType: options?.membershipType,
        ...(options?.exact !== undefined && { exact: options.exact }),
        ...(options?.search && { search: options.search }),
      } as { orgId: string; first?: number; max?: number; realm?: string; membershipType?: string }),
    );
  }

  public async listMembersAll(options?: {
    membershipType?: string;
    exact?: boolean;
    search?: string;
  }): Promise<UserRepresentation[]> {
    const organization = await this.requireOrganization();

    return fetchAll((first, max) =>
      retryTransientAdminReadError(() =>
        this.core.organizations.listMembers({
          realm: this.realmName,
          orgId: organization.id,
          first,
          max,
          membershipType: options?.membershipType,
          ...(options?.exact !== undefined && { exact: options.exact }),
          ...(options?.search && { search: options.search }),
        } as { orgId: string; first?: number; max?: number; realm?: string; membershipType?: string }),
      ),
    );
  }

  public async addMember(userHandle: UserHandle) {
    assertOwnedHandle(
      this,
      userHandle,
      'user',
      `organization "${this.organizationAlias}"`,
      'organization membership update',
    );
    const organization = await this.requireOrganization();
    const user = await this.resolveUser(userHandle);

    await retryTransientAdminError(() =>
      this.core.organizations.addMember({
        realm: this.realmName,
        orgId: organization.id,
        userId: user.id,
      }),
    );

    return this.listMembers();
  }

  public async removeMember(userHandle: UserHandle) {
    assertOwnedHandle(
      this,
      userHandle,
      'user',
      `organization "${this.organizationAlias}"`,
      'organization membership update',
    );
    const organization = await this.requireOrganization();
    const user = await this.resolveUser(userHandle);

    await retryTransientAdminError(() =>
      this.core.organizations.delMember({
        realm: this.realmName,
        orgId: organization.id,
        userId: user.id,
      }),
    );

    return this.listMembers();
  }

  public async invite(data: FormData) {
    const organization = await this.requireOrganization();

    return retryTransientAdminError(() =>
      this.core.organizations.invite(
        {
          realm: this.realmName,
          orgId: organization.id,
        },
        data,
      ),
    );
  }

  public async inviteExistingUser(data: FormData) {
    const organization = await this.requireOrganization();

    return retryTransientAdminError(() =>
      this.core.organizations.inviteExistingUser(
        {
          realm: this.realmName,
          orgId: organization.id,
        },
        data,
      ),
    );
  }

  public async listIdentityProviders(): Promise<IdentityProviderRepresentation[]> {
    const organization = await this.requireOrganization();

    return retryTransientAdminReadError(() =>
      this.core.organizations.listIdentityProviders({
        realm: this.realmName,
        orgId: organization.id,
      }),
    );
  }

  public async linkIdentityProvider(identityProviderHandle: IdentityProviderHandle) {
    assertOwnedHandle(
      this,
      identityProviderHandle,
      'identity provider',
      `organization "${this.organizationAlias}"`,
      'organization identity-provider link',
    );
    const organization = await this.requireOrganization();
    const identityProvider = await this.resolveIdentityProvider(identityProviderHandle);

    await retryTransientAdminError(() =>
      this.core.organizations.linkIdp({
        realm: this.realmName,
        orgId: organization.id,
        alias: identityProvider.alias,
      }),
    );

    return this.listIdentityProviders();
  }

  public async unlinkIdentityProvider(identityProviderHandle: IdentityProviderHandle) {
    assertOwnedHandle(
      this,
      identityProviderHandle,
      'identity provider',
      `organization "${this.organizationAlias}"`,
      'organization identity-provider link',
    );
    const organization = await this.requireOrganization();
    const identityProvider = await this.resolveIdentityProvider(identityProviderHandle);

    await retryTransientAdminError(() =>
      this.core.organizations.unLinkIdp({
        realm: this.realmName,
        orgId: organization.id,
        alias: identityProvider.alias,
      }),
    );

    return this.listIdentityProviders();
  }
}
