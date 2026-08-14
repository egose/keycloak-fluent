import type KeycloakAdminClient from '../keycloak-admin-client';
import type RoleHandle from '../role';
import type ClientRoleHandle from '../client-role';
import type ClientHandle from '../clients/client';

/**
 * Shared ownership validation for role mapping endpoints.
 *
 * Keycloak scope/role mapping endpoints accept `RoleRepresentation` payloads
 * without surfacing which admin-client instance fetched them, which realm they
 * belong to, or (for client roles) which client owns them. Callers could
 * therefore mix role handles built from a different admin-client instance, a
 * different realm, or the wrong kind (realm vs. client) without any failure
 * until a network mutation either silently corrupted state or rejected with an
 * opaque transport error.
 *
 * These helpers fail before the mutation by comparing the cross-cutting
 * identity dimensions (`core`, `realmName`, and `clientId` where applicable)
 * of the participating handles.
 */

type OwnableRoleHandle = RoleHandle | ClientRoleHandle;

function describeHandle(roleHandle: OwnableRoleHandle): string {
  const roleKind = isClientRoleHandle(roleHandle) ? 'client role' : 'realm role';
  return `${roleKind} "${roleHandle.roleName}"`;
}

function isClientRoleHandle(handle: OwnableRoleHandle): handle is ClientRoleHandle {
  return (handle as Partial<ClientRoleHandle>).clientHandle !== undefined;
}

/**
 * Asserts that two admin-client instances refer to the same Keycloak admin
 * client. Handles built from different `KeycloakAdminClient` instances must
 * not be mixed even when their realm names coincide, since their cached
 * representations are not interchangeable.
 */
export function assertSameCore(
  ownerCore: KeycloakAdminClient,
  roleCore: KeycloakAdminClient,
  roleHandle: OwnableRoleHandle,
  ownerLabel: string,
) {
  if (ownerCore !== roleCore) {
    throw new Error(
      `${describeHandle(roleHandle)} belongs to a different Keycloak admin client than ${ownerLabel}; refusing cross-core role mapping`,
    );
  }
}

/**
 * Asserts that a role handle and a target owner share the same realm name.
 * Cross-realm mappings are not supported by the underlying endpoints and
 * must be rejected before any network mutation.
 */
export function assertSameRealm(
  ownerRealm: string,
  roleRealm: string,
  roleHandle: OwnableRoleHandle,
  ownerLabel: string,
) {
  if (ownerRealm !== roleRealm) {
    throw new Error(
      `${describeHandle(roleHandle)} belongs to realm "${roleRealm}", which differs from ${ownerLabel} realm "${ownerRealm}"; refusing cross-realm role mapping`,
    );
  }
}

/**
 * Asserts that a client role handle is owned by the stated target client. When
 * the handle was built from a different client, it cannot be assigned as a
 * scope mapping of the target client even within the same realm.
 */
export function assertClientRoleOwnedBy(targetClient: ClientHandle, roleHandle: ClientRoleHandle, ownerLabel: string) {
  if (roleHandle.clientId !== targetClient.clientId) {
    throw new Error(
      `${describeHandle(roleHandle)} belongs to client "${roleHandle.clientId}", which differs from ${ownerLabel} target client "${targetClient.clientId}"; refusing cross-client scope mapping`,
    );
  }
}

/**
 * Guards realm-scope mapping endpoints. Only realm roles are valid inputs for
 * realm-scope mappings since they target realm-role endpoints; client roles
 * must be rejected by kind rather than trusted as compatible payloads.
 */
export function assertRealmRoleForScopeMapping(roleHandle: OwnableRoleHandle, ownerLabel: string) {
  if (isClientRoleHandle(roleHandle)) {
    throw new Error(
      `${describeHandle(roleHandle)} is a client role; ${ownerLabel} realm-scope mappings only accept realm roles`,
    );
  }
}

/**
 * Combined guard for realm roles used as realm-scope mappings. Compares core
 * identity and realm name so cross-core or cross-realm handles fail before
 * any request is issued.
 */
export function assertRealmRoleMappingOwnership(
  ownerCore: KeycloakAdminClient,
  ownerRealm: string,
  roleHandle: RoleHandle,
  ownerLabel: string,
) {
  assertRealmRoleForScopeMapping(roleHandle, ownerLabel);
  assertSameCore(ownerCore, roleHandle.core, roleHandle, ownerLabel);
  assertSameRealm(ownerRealm, roleHandle.realmName, roleHandle, ownerLabel);
}

/**
 * Combined guard for client roles used as scope mappings of a target client.
 * Compares core identity, realm name, and parent-client ownership so the
 * role must originate from the same admin client, realm, and client as the
 * mapping target.
 */
export function assertClientRoleMappingOwnership(
  ownerCore: KeycloakAdminClient,
  ownerRealm: string,
  targetClient: ClientHandle,
  roleHandle: ClientRoleHandle,
  ownerLabel: string,
) {
  assertSameCore(ownerCore, roleHandle.core, roleHandle, ownerLabel);
  assertSameRealm(ownerRealm, roleHandle.realmName, roleHandle, ownerLabel);
  assertClientRoleOwnedBy(targetClient, roleHandle, ownerLabel);
}
