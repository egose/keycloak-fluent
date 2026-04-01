import { randomUUID } from 'node:crypto';
import KeycloakAdminClientFluent from '../src/index';
import type RealmHandle from '../src/realm';

type MasterRealmContext = {
  kcMaster: KeycloakAdminClientFluent;
  realm: string;
};

type EnsuredMasterRealmContext = MasterRealmContext & {
  realmHandle: RealmHandle;
};

function createTestRealmName(prefix: string) {
  return `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

export async function withMasterRealm(prefix: string, callback: (context: MasterRealmContext) => Promise<void>) {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  const realm = createTestRealmName(prefix);

  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  try {
    await callback({ kcMaster, realm });
  } finally {
    await kcMaster.realm(realm).discard();
  }
}

export async function withEnsuredMasterRealm(
  prefix: string,
  callback: (context: EnsuredMasterRealmContext) => Promise<void>,
) {
  await withMasterRealm(prefix, async ({ kcMaster, realm }) => {
    const realmHandle = await kcMaster.realm(realm).ensure({});
    await callback({ kcMaster, realm, realmHandle });
  });
}

export async function createAuthenticatedRealmClient(realm: string, clientId: string, clientSecret: string) {
  const kcCustom = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: realm });

  await kcCustom.simpleAuth({
    clientId,
    clientSecret,
  });

  return kcCustom;
}
