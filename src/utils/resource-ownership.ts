import type KeycloakAdminClient from '../keycloak-admin-client';

export type ResourceKind =
  | 'client'
  | 'client role'
  | 'client scope'
  | 'group'
  | 'identity provider'
  | 'realm role'
  | 'user';

type OwnedHandle = {
  core: KeycloakAdminClient;
  realmName?: string;
  realmHandle?: { realmName: string };
  clientHandle?: OwnedHandle & { clientId?: string };
  parentGroupHandle?: OwnedHandle;
};

type ResourceIdentity = {
  core: KeycloakAdminClient;
  realmName?: string;
  kind: ResourceKind | 'unknown';
  name?: string;
};

function getLiveRealmName(handle: OwnedHandle): string | undefined {
  return (
    handle.realmHandle?.realmName ??
    (handle.clientHandle ? getLiveRealmName(handle.clientHandle) : undefined) ??
    (handle.parentGroupHandle ? getLiveRealmName(handle.parentGroupHandle) : undefined) ??
    handle.realmName
  );
}

function getHandleName(handle: object, kind = getResourceKind(handle)): string | undefined {
  const candidate = handle as {
    alias?: string;
    clientId?: string;
    groupName?: string;
    roleName?: string;
    scopeName?: string;
    username?: string;
  };
  if (kind === 'client role' || kind === 'realm role') return candidate.roleName;
  if (kind === 'client') return candidate.clientId;
  if (kind === 'client scope') return candidate.scopeName;
  if (kind === 'group') return candidate.groupName;
  if (kind === 'user') return candidate.username;
  if (kind === 'identity provider') return candidate.alias;
  return (
    candidate.clientId ??
    candidate.scopeName ??
    candidate.roleName ??
    candidate.groupName ??
    candidate.username ??
    candidate.alias
  );
}

export function getResourceKind(handle: object): ResourceKind | 'unknown' {
  if ('roleName' in handle && 'clientHandle' in handle) return 'client role';
  if ('roleName' in handle) return 'realm role';
  if ('clientScope' in handle || 'scopeName' in handle) return 'client scope';
  if ('group' in handle || 'groupName' in handle) return 'group';
  if ('user' in handle || 'username' in handle) return 'user';
  if ('identityProvider' in handle || 'alias' in handle) return 'identity provider';
  if ('client' in handle || 'clientId' in handle) return 'client';
  return 'unknown';
}

export function describeResourceHandle(handle: object): string {
  const kind = getResourceKind(handle);
  const name = getHandleName(handle, kind);
  return name ? `${kind} "${name}"` : kind;
}

function getResourceIdentity(handle: OwnedHandle): ResourceIdentity {
  const kind = getResourceKind(handle);
  return {
    core: handle.core,
    realmName: getLiveRealmName(handle),
    kind,
    name: getHandleName(handle, kind),
  };
}

function getParentResourceIdentity(handle: OwnedHandle): ResourceIdentity | undefined {
  if (handle.clientHandle) return getResourceIdentity(handle.clientHandle);
  if (handle.parentGroupHandle) return getResourceIdentity(handle.parentGroupHandle);
  return undefined;
}

export function assertResourceKind(handle: object, expectedKind: ResourceKind, ownerLabel: string, action: string) {
  const actualKind = getResourceKind(handle);
  if (actualKind !== expectedKind) {
    throw new Error(`${describeResourceHandle(handle)} is not a ${expectedKind}; ${ownerLabel} cannot ${action}`);
  }
}

export function assertSameResourceOwner(
  owner: OwnedHandle,
  candidate: OwnedHandle,
  candidateLabel: string,
  ownerLabel: string,
  action: string,
) {
  if (owner.core !== candidate.core) {
    throw new Error(
      `${candidateLabel} belongs to a different Keycloak admin client than ${ownerLabel}; refusing ${action}`,
    );
  }

  const ownerRealm = getLiveRealmName(owner);
  const candidateRealm = getLiveRealmName(candidate);
  if (ownerRealm !== candidateRealm) {
    throw new Error(
      `${candidateLabel} belongs to realm "${candidateRealm}", which differs from ${ownerLabel} realm "${ownerRealm}"; refusing ${action}`,
    );
  }
}

export function assertSameParentResourceOwner(
  expectedParent: OwnedHandle,
  candidate: OwnedHandle,
  candidateLabel: string,
  ownerLabel: string,
  action: string,
) {
  const expected = getResourceIdentity(expectedParent);
  const actual = getParentResourceIdentity(candidate);

  if (!actual) {
    throw new Error(`${candidateLabel} has no parent resource; ${ownerLabel} cannot ${action}`);
  }

  if (actual.kind !== expected.kind || actual.name !== expected.name) {
    throw new Error(
      `${candidateLabel} belongs to ${actual.kind} "${actual.name}", which differs from ${ownerLabel} target ${expected.kind} "${expected.name}"; refusing ${action}`,
    );
  }
}

export function assertOwnedHandle(
  owner: OwnedHandle,
  candidate: OwnedHandle,
  expectedKind: ResourceKind,
  ownerLabel: string,
  action: string,
) {
  assertResourceKind(candidate, expectedKind, ownerLabel, action);
  assertSameResourceOwner(owner, candidate, describeResourceHandle(candidate), ownerLabel, action);
}

export function assertClientRoleOwnedByClient(
  targetClient: OwnedHandle & { clientId: string },
  roleHandle: OwnedHandle & { clientHandle: OwnedHandle & { clientId: string } },
  ownerLabel: string,
  action: string,
) {
  assertOwnedHandle(targetClient, roleHandle, 'client role', ownerLabel, action);
  assertOwnedHandle(targetClient, roleHandle.clientHandle, 'client', ownerLabel, action);
  assertSameParentResourceOwner(targetClient, roleHandle, describeResourceHandle(roleHandle), ownerLabel, action);
}
