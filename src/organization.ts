import _merge from 'lodash-es/merge.js';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type IdentityProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation';
import type OrganizationRepresentation from '@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation';
import type UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import type IdentityProviderHandle from './identity-provider';
import RealmHandle from './realm';
import type UserHandle from './user';
import { retryTransientAdminError } from './utils/retry';

function getPaginationParams(options?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 100);

  return {
    first: (page - 1) * pageSize,
    max: pageSize,
  };
}

function getOrganizationUpdateData(
  organization: OrganizationRepresentation,
  data: OrganizationInputData,
  organizationAlias: string,
) {
  return _merge({}, organization, data, { alias: organizationAlias });
}

export const defaultOrganizationData = Object.freeze({
  enabled: true,
});

export type OrganizationInputData = Omit<OrganizationRepresentation, 'id' | 'alias'>;

export default class OrganizationHandle {
  public core: KeycloakAdminClient;
  public realmHandle: RealmHandle;
  public realmName: string;
  public organizationAlias: string;
  public organization?: OrganizationRepresentation | null;
  public organizationData?: OrganizationInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, organizationAlias: string) {
    this.core = core;
    this.realmHandle = realmHandle;
    this.realmName = realmHandle.realmName;
    this.organizationAlias = organizationAlias;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await retryTransientAdminError(() => core.organizations.findOne({ realm, id }));
    return one ?? null;
  }

  static async getByAlias(core: KeycloakAdminClient, realm: string, organizationAlias: string) {
    const organizations = await retryTransientAdminError(() =>
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
    this.organization = await OrganizationHandle.getById(this.core, this.realmName, id);

    if (this.organization?.alias) {
      this.organizationAlias = this.organization.alias;
    }

    return this.organization;
  }

  public async get(): Promise<OrganizationRepresentation | null> {
    this.organization = await OrganizationHandle.getByAlias(this.core, this.realmName, this.organizationAlias);

    if (this.organization?.alias) {
      this.organizationAlias = this.organization.alias;
    }

    return this.organization;
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

    this.organization = null;
    return this.organizationAlias;
  }

  public async ensure(data: OrganizationInputData) {
    this.organizationData = data;

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
      this.organization = null;
    }

    return this.organizationAlias;
  }

  public async listMembers(options?: {
    page?: number;
    pageSize?: number;
    membershipType?: string;
  }): Promise<UserRepresentation[]> {
    const organization = await this.requireOrganization();
    const { first, max } = getPaginationParams(options);

    return retryTransientAdminError(() =>
      this.core.organizations.listMembers({
        realm: this.realmName,
        orgId: organization.id,
        first,
        max,
        membershipType: options?.membershipType,
      }),
    );
  }

  public async addMember(userHandle: UserHandle) {
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

    return retryTransientAdminError(() =>
      this.core.organizations.listIdentityProviders({
        realm: this.realmName,
        orgId: organization.id,
      }),
    );
  }

  public async linkIdentityProvider(identityProviderHandle: IdentityProviderHandle) {
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
