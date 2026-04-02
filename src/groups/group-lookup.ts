import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';

const groupLookupPageSize = 1000;

function removeOptionalPrefixSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}

function normalizeGroupPath(groupPath: string) {
  const groupPathParts = removeOptionalPrefixSlash(groupPath).split('/').filter(Boolean);

  if (groupPathParts.length === 0) {
    throw new Error(`Invalid child group path: ${groupPath}`);
  }

  return groupPathParts;
}

function isTransientGroupLookupError(error: unknown) {
  return error instanceof Error && error.message.includes('unknown_error');
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getGroupById(core: KeycloakAdminClient, realm: string, id: string) {
  const one = await core.groups.findOne({ realm, id });
  return one ?? null;
}

export async function getGroupByName(core: KeycloakAdminClient, realm: string, groupName: string, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const groups = await core.groups.find({ realm, search: groupName, exact: true });
      const group = groups.find((v) => v.name === groupName);
      return group ?? null;
    } catch (error) {
      if (!isTransientGroupLookupError(error) || attempt === attempts - 1) {
        throw error;
      }

      await sleep(50 * (attempt + 1));
    }
  }

  return null;
}

export async function listSubGroups(core: KeycloakAdminClient, realm: string, parentId: string, attempts = 3) {
  const subGroups: GroupRepresentation[] = [];

  for (let first = 0; ; first += groupLookupPageSize) {
    let page: GroupRepresentation[] | null = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        page = await core.groups.listSubGroups({
          realm,
          parentId,
          briefRepresentation: false,
          first,
          max: groupLookupPageSize,
        });
        break;
      } catch (error) {
        if (!isTransientGroupLookupError(error) || attempt === attempts - 1) {
          throw error;
        }

        await sleep(50 * (attempt + 1));
      }
    }

    const resolvedPage = page ?? [];
    subGroups.push(...resolvedPage);

    if (resolvedPage.length < groupLookupPageSize) {
      return subGroups;
    }
  }
}

export async function getChildGroupByName(
  core: KeycloakAdminClient,
  realm: string,
  parentGroupName: string,
  groupName: string,
) {
  const group = await getGroupByName(core, realm, parentGroupName);
  if (!group) return null;

  const subGroups = await listSubGroups(core, realm, group.id!);
  const subgroup = subGroups.find((v) => v.name === groupName);
  return subgroup ?? null;
}

export async function getGroupByPath(
  core: KeycloakAdminClient,
  realm: string,
  groupPath: string,
): Promise<GroupRepresentation | null> {
  const groupPathParts = normalizeGroupPath(groupPath);

  if (groupPathParts.length === 1) {
    return getGroupByName(core, realm, groupPathParts[0]);
  }

  if (groupPathParts.length === 2) {
    return getChildGroupByName(core, realm, groupPathParts[0], groupPathParts[1]);
  }

  const firstChildGroup = await getChildGroupByName(core, realm, groupPathParts[0], groupPathParts[1]);

  if (!firstChildGroup) {
    return null;
  }

  let currentGroupId = firstChildGroup.id ?? null;
  let foundGroup: GroupRepresentation | null = null;

  for (let i = 2; i < groupPathParts.length; i++) {
    if (!currentGroupId) {
      return null;
    }

    const subGroups = await listSubGroups(core, realm, currentGroupId);

    foundGroup = subGroups.find((g) => g.name === groupPathParts[i]) ?? null;

    if (!foundGroup) {
      return null;
    }

    currentGroupId = foundGroup.id ?? null;
  }

  return foundGroup;
}
