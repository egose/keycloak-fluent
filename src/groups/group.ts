import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RealmHandle from '../realm';
import ChildGroupHandle from './child-group';
import { AbstractGroupHandle } from './abstract-group';

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

export type GroupInputData = Omit<GroupRepresentation, 'name | id'>;

export default class GroupHandle extends AbstractGroupHandle {
  public realmHandle: RealmHandle;
  public groupData?: GroupInputData;

  constructor(core: KeycloakAdminClient, realmHandle: RealmHandle, groupName: string) {
    super(core, realmHandle.realmName, groupName);
    this.realmHandle = realmHandle;
  }

  static async getById(core: KeycloakAdminClient, realm: string, id: string) {
    const one = await core.groups.findOne({ realm, id });
    return one ?? null;
  }

  static async getByName(core: KeycloakAdminClient, realm: string, groupName: string, attempts = 3) {
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

  static async listSubGroups(core: KeycloakAdminClient, realm: string, parentId: string, attempts = 3) {
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await core.groups.listSubGroups({
          realm,
          parentId,
          briefRepresentation: false,
          first: 0,
          max: 1000,
        });
      } catch (error) {
        if (!isTransientGroupLookupError(error) || attempt === attempts - 1) {
          throw error;
        }

        await sleep(50 * (attempt + 1));
      }
    }

    return [];
  }

  static async getByPath(core: KeycloakAdminClient, realm: string, groupPath: string) {
    const groupPathParts = normalizeGroupPath(groupPath);

    if (groupPathParts.length === 1) {
      return GroupHandle.getByName(core, realm, groupPathParts[0]);
    }

    if (groupPathParts.length === 2) {
      return ChildGroupHandle.getByName(core, realm, groupPathParts[0], groupPathParts[1]);
    }

    const firstChildGroup = await ChildGroupHandle.getByName(core, realm, groupPathParts[0], groupPathParts[1]);

    if (!firstChildGroup) {
      return null;
    }

    let currentGroupId = firstChildGroup.id ?? null;
    let foundGroup: GroupRepresentation | null = null;

    for (let i = 2; i < groupPathParts.length; i++) {
      if (!currentGroupId) {
        return null;
      }

      const subGroups = await GroupHandle.listSubGroups(core, realm, currentGroupId);

      foundGroup = subGroups.find((g) => g.name === groupPathParts[i]) ?? null;

      if (!foundGroup) {
        return null;
      }

      currentGroupId = foundGroup.id ?? null;
    }

    return foundGroup;
  }

  public async getById(id: string) {
    this.group = await GroupHandle.getById(this.core, this.realmName, id);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async get(): Promise<GroupRepresentation | null> {
    this.group = await GroupHandle.getByName(this.core, this.realmName, this.groupName);

    if (this.group) {
      this.groupName = this.group.name!;
    }

    return this.group;
  }

  public async create(data: GroupInputData) {
    if (await this.get()) {
      throw new Error(`Group "${this.groupName}" already exists in realm "${this.realmName}"`);
    }

    await this.core.groups.create({ ...data, realm: this.realmName, name: this.groupName });
    return this.get();
  }

  public async update(data: GroupInputData) {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.update({ realm: this.realmName, id: one.id }, { ...data, name: this.groupName });

    return this.get();
  }

  public async delete() {
    const one = await this.get();
    if (!one?.id) {
      throw new Error(`Group "${this.groupName}" not found in realm "${this.realmName}"`);
    }

    await this.core.groups.del({ realm: this.realmName, id: one.id });

    this.group = null;
    return this.groupName;
  }

  public async ensure(data: GroupInputData) {
    this.groupData = data;

    const one = await this.get();

    if (one?.id) {
      await this.core.groups.update({ realm: this.realmName, id: one.id }, { ...data, name: this.groupName });
    } else {
      await this.core.groups.create({ ...data, realm: this.realmName, name: this.groupName });
    }

    await this.get();
    return this;
  }

  public async discard() {
    const one = await this.get();
    if (one?.id) {
      await this.core.groups.del({ realm: this.realmName, id: one.id });
      this.group = null;
    }

    return this.groupName;
  }

  public childGroup(childGroupName: string) {
    return new ChildGroupHandle(this.core, this, childGroupName);
  }
}
