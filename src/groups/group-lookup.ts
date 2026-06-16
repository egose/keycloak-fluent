import type { default as KeycloakAdminClient, GroupRepresentation } from '../keycloak-admin-client';

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

function getRootGroupPath(groupName: string) {
  return `/${groupName}`;
}

function getExactGroupNameMatches(groups: GroupRepresentation[], groupName: string) {
  return groups.filter((group) => group.name === groupName);
}

function ensureUniqueGroupMatch(matches: GroupRepresentation[], errorMessage: string) {
  if (matches.length > 1) {
    throw new Error(errorMessage);
  }

  return matches[0] ?? null;
}

export async function getGroupById(core: KeycloakAdminClient, realm: string, id: string) {
  const one = await core.groups.findOne({ realm, id });
  return one ?? null;
}

export async function getGroupByName(core: KeycloakAdminClient, realm: string, groupName: string, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const groups = await core.groups.find({ realm, search: groupName, exact: true, briefRepresentation: false });
      const rootGroups = getExactGroupNameMatches(groups, groupName).filter(
        (group) => group.path === getRootGroupPath(groupName),
      );
      const rootGroup = ensureUniqueGroupMatch(
        rootGroups,
        `Group "${groupName}" is ambiguous in realm "${realm}". Use a group path to disambiguate nested groups.`,
      );

      if (!rootGroup?.id) {
        return null;
      }

      return getGroupById(core, realm, rootGroup.id);
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

export async function getChildGroupByParentId(
  core: KeycloakAdminClient,
  realm: string,
  parentGroupId: string,
  groupName: string,
) {
  const subGroups = await listSubGroups(core, realm, parentGroupId);
  const childGroups = getExactGroupNameMatches(subGroups, groupName);

  return ensureUniqueGroupMatch(
    childGroups,
    `Child Group "${groupName}" is ambiguous in realm "${realm}". Use a fully qualified group path to disambiguate it.`,
  );
}

export async function getChildGroupByName(
  core: KeycloakAdminClient,
  realm: string,
  parentGroupName: string,
  groupName: string,
) {
  const group = await getGroupByName(core, realm, parentGroupName);
  if (!group?.id) return null;

  return getChildGroupByParentId(core, realm, group.id, groupName);
}

export async function getGroupByPath(
  core: KeycloakAdminClient,
  realm: string,
  groupPath: string,
): Promise<GroupRepresentation | null> {
  const groupPathParts = normalizeGroupPath(groupPath);

  let currentGroup = await getGroupByName(core, realm, groupPathParts[0]);
  if (!currentGroup?.id) {
    return null;
  }

  for (let i = 1; i < groupPathParts.length; i++) {
    currentGroup = await getChildGroupByParentId(core, realm, currentGroup.id, groupPathParts[i]);
    if (!currentGroup?.id) {
      return null;
    }
  }

  return currentGroup;
}
