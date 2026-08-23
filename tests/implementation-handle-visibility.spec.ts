import { describe, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import RealmHandle from '../src/realm';
import ClientHandle from '../src/clients/client';
import ClientScopeHandle from '../src/client-scope';
import RoleHandle from '../src/role';
import UserHandle from '../src/user';
import OrganizationHandle from '../src/organization';
import IdentityProviderHandle from '../src/identity-provider';
import AuthenticationFlowHandle from '../src/authentication-flow';
import WorkflowHandle from '../src/workflow';
import ComponentHandle from '../src/component';
import GroupHandle from '../src/groups/group';
import ChildGroupHandle from '../src/groups/child-group';
import NestedChildGroupHandle from '../src/groups/nested-child-group';
import ClientRoleHandle from '../src/client-role';
import ProtocolMapperHandle from '../src/protocol-mappers/protocol-mapper';
import ClientScopeProtocolMapperHandle from '../src/protocol-mappers/client-scope-protocol-mapper';
import IdentityProviderMapperHandle from '../src/identity-provider-mapper';
import CacheHandle from '../src/cache';
import ClientPoliciesHandle from '../src/client-policies';
import AttackDetectionHandle from '../src/attack-detection';
import UserStorageProviderHandle from '../src/user-storage-provider';
import KeycloakAdminClientFluent from '../src/index';

/*
 * HANDLE-02: Encapsulate Mutable Handle Identity.
 *
 * Public API compile fixture: asserts that callers CANNOT redirect an
 * existing handle by mutating its routing identity (`realmName`, parent
 * identity like `clientId`/`scopeName`/`roleName`/...) nor by overwriting
 * its cached representation (`client`/`role`/`group`/...). The only supported
 * way to re-target a handle is the public `rebind(newId)` method, which
 * clears the local cached representation atomically with the identity
 * change. Existing descendants detect parent identity-version changes,
 * clear stale caches automatically, and re-resolve against the new target.
 *
 * `.core` / `.realmHandle` remain public and mutable-on-construction but
 * are declared `readonly` so they cannot be redirected after construction;
 * the Non-Goal explicitly preserves read access to the underlying admin
 * client via `kc.core` (and read access through sub-handles' `.core` /
 * `.realmHandle` for cross-handle composition).
 *
 * The runtime portion below confirms `rebind()` exists on every parent
 * handle. The compile portion (typescript "bad" fixture file below) is
 * typechecked via `tsc` against a fixture directory; if the visibility
 * contract regresses (e.g. someone re-exposes a public mutable identity
 * field), the matching `@ts-expect-error` directive becomes unused and
 * `tsc` exits non-zero, failing this test.
 */

const coreStub = {} as any;
const realmStub = new RealmHandle(coreStub, 'demo');
const clientHandleStub = realmStub.client('app');
const clientScopeStub = realmStub.clientScope('profile');
const idpStub = realmStub.identityProvider('oidc');

function ensure(value: unknown): asserts value {
  if (value === undefined || value === null) throw new Error('expected value');
}

describe('Implementation Consistency: Handle Visibility Contract (HANDLE-02)', () => {
  describe('runtime: rebind() is exposed on every parent handle', () => {
    test('RealmHandle.rebind returns the handle for chaining', () => {
      const r = new RealmHandle(coreStub, 'a');
      expect(r.rebind('b')).toBe(r);
      expect(r.realmName).toBe('b');
    });

    test('ClientHandle.rebind clears cache and updates identity', () => {
      const c = new ClientHandle(coreStub, realmStub, 'x');
      expect(c.rebind('y')).toBe(c);
      expect(c.clientId).toBe('y');
      expect(c.client).toBeUndefined();
    });

    test('ClientScopeHandle.rebind clears cache and updates identity', () => {
      const s = new ClientScopeHandle(coreStub, realmStub, 'p');
      expect(s.rebind('q')).toBe(s);
      expect(s.scopeName).toBe('q');
      expect(s.clientScope).toBeUndefined();
    });

    test('RoleHandle.rebind clears cache and updates identity', () => {
      const r = new RoleHandle(coreStub, realmStub, 'r');
      expect(r.rebind('s')).toBe(r);
      expect(r.roleName).toBe('s');
      expect(r.role).toBeUndefined();
    });

    test('UserHandle.rebind clears cache and updates identity', () => {
      const u = new UserHandle(coreStub, realmStub, 'u');
      expect(u.rebind('v')).toBe(u);
      expect(u.username).toBe('v');
      expect(u.user).toBeUndefined();
    });

    test('OrganizationHandle.rebind clears cache and updates identity', () => {
      const o = new OrganizationHandle(coreStub, realmStub, 'org');
      expect(o.rebind('org2')).toBe(o);
      expect(o.organizationAlias).toBe('org2');
      expect(o.organization).toBeUndefined();
    });

    test('IdentityProviderHandle.rebind clears cache and updates identity', () => {
      const i = new IdentityProviderHandle(coreStub, realmStub, 'idp');
      expect(i.rebind('idp2')).toBe(i);
      expect(i.alias).toBe('idp2');
      expect(i.identityProvider).toBeUndefined();
    });

    test('AuthenticationFlowHandle.rebind clears cache and updates identity', () => {
      const f = new AuthenticationFlowHandle(coreStub, realmStub, 'flow');
      expect(f.rebind('flow2')).toBe(f);
      expect(f.alias).toBe('flow2');
      expect(f.flow).toBeUndefined();
    });

    test('WorkflowHandle.rebind clears cache and updates identity', () => {
      const w = new WorkflowHandle(coreStub, realmStub, 'wf');
      expect(w.rebind('wf2')).toBe(w);
      expect(w.workflowName).toBe('wf2');
      expect(w.workflow).toBeUndefined();
    });

    test('ComponentHandle.rebind clears cache and updates identity', () => {
      const c = new ComponentHandle(coreStub, realmStub, 'comp');
      expect(c.rebind('comp2')).toBe(c);
      expect(c.componentName).toBe('comp2');
      expect(c.component).toBeUndefined();
    });

    test('GroupHandle.rebind clears cache and updates identity', () => {
      const g = new GroupHandle(coreStub, realmStub, 'g');
      expect(g.rebind('g2')).toBe(g);
      expect(g.groupName).toBe('g2');
      expect(g.group).toBeUndefined();
    });

    test('ChildGroupHandle.rebind clears cache and updates identity', () => {
      const parent = new GroupHandle(coreStub, realmStub, 'p');
      const cg = new ChildGroupHandle(coreStub, parent, 'c');
      expect(cg.rebind('c2')).toBe(cg);
      expect(cg.groupName).toBe('c2');
      expect(cg.group).toBeUndefined();
    });

    test('NestedChildGroupHandle.rebind clears cache and updates identity', () => {
      const ng = new NestedChildGroupHandle(coreStub, 'demo', '/p', 'n');
      expect(ng.rebind('n2')).toBe(ng);
      expect(ng.groupName).toBe('n2');
      expect(ng.group).toBeUndefined();
    });

    test('ClientRoleHandle.rebind clears cache and updates identity', () => {
      const r = new ClientRoleHandle(coreStub, clientHandleStub, 'role');
      expect(r.rebind('role2')).toBe(r);
      expect(r.roleName).toBe('role2');
      expect(r.role).toBeUndefined();
    });

    test('ProtocolMapperHandle.rebind clears cache and updates identity', () => {
      const m = new ProtocolMapperHandle(coreStub, clientHandleStub, 'm');
      expect(m.rebind('m2')).toBe(m);
      expect(m.mapperName).toBe('m2');
      expect(m.clientProtocolMapper).toBeUndefined();
    });

    test('ClientScopeProtocolMapperHandle.rebind clears cache and updates identity', () => {
      const m = new ClientScopeProtocolMapperHandle(coreStub, clientScopeStub, 'm');
      expect(m.rebind('m2')).toBe(m);
      expect(m.mapperName).toBe('m2');
      expect(m.clientScopeProtocolMapper).toBeUndefined();
    });

    test('IdentityProviderMapperHandle.rebind clears cache and updates identity', () => {
      const m = new IdentityProviderMapperHandle(coreStub, idpStub, 'm');
      expect(m.rebind('m2')).toBe(m);
      expect(m.mapperName).toBe('m2');
      expect(m.identityProviderMapper).toBeUndefined();
    });

    test('AttackDetectionHandle.rebind updates identity', () => {
      const a = new AttackDetectionHandle(coreStub, realmStub, 'user-1');
      expect(a.rebind('user-2')).toBe(a);
      expect(a.userId).toBe('user-2');
    });

    test('read access through .core and .realmHandle is preserved', () => {
      ensure(realmStub.core);
      ensure(realmStub.realmName);
      const c = new ClientHandle(coreStub, realmStub, 'x');
      ensure(c.core);
      ensure(c.realmHandle);
      ensure(c.realmName);
    });

    test('UserStorageProviderHandle.providerId is publicly readable', () => {
      const u = new UserStorageProviderHandle(coreStub, realmStub, 'kerberos-ldap');
      expect(u.providerId).toBe('kerberos-ldap');
    });

    test('KeycloakAdminClientFluent.core remains publicly readable (Non-Goal)', () => {
      const fluent = new KeycloakAdminClientFluent();
      ensure(fluent.core);
    });
  });

  describe('compile: readonly/identity/cache fields reject external mutation', () => {
    /*
     * Builds a TypeScript fixture (one intentional-bad statement per field
     * under a `@ts-expect-error` directive) in a temp directory and runs
     * `tsc --noEmit` on it. A passing run means every `@ts-expect-error`
     * directive correctly suppresses a real compile error — i.e. the bad
     * statements do not compile. If someone re-exposes a mutable identity
     * or cache field, the directive becomes unused and `tsc` exits 1.
     */
    const fixtureDir = join(tmpdir(), `h02-fixture-${process.pid}`);
    const fixturePath = join(fixtureDir, 'regression.ts');
    const fixtureTsconfigPath = join(fixtureDir, 'tsconfig.json');

    const fixtureSource = `
import RealmHandle from '@egose/keycloak-fluent/realm';
import ClientHandle from '@egose/keycloak-fluent/clients/client';
import ClientScopeHandle from '@egose/keycloak-fluent/client-scope';
import RoleHandle from '@egose/keycloak-fluent/role';
import UserHandle from '@egose/keycloak-fluent/user';
import OrganizationHandle from '@egose/keycloak-fluent/organization';
import IdentityProviderHandle from '@egose/keycloak-fluent/identity-provider';
import AuthenticationFlowHandle from '@egose/keycloak-fluent/authentication-flow';
import WorkflowHandle from '@egose/keycloak-fluent/workflow';
import ComponentHandle from '@egose/keycloak-fluent/component';
import GroupHandle from '@egose/keycloak-fluent/groups/group';
import ChildGroupHandle from '@egose/keycloak-fluent/groups/child-group';
import NestedChildGroupHandle from '@egose/keycloak-fluent/groups/nested-child-group';
import ClientRoleHandle from '@egose/keycloak-fluent/client-role';
import ProtocolMapperHandle from '@egose/keycloak-fluent/protocol-mappers/protocol-mapper';
import ClientScopeProtocolMapperHandle from '@egose/keycloak-fluent/protocol-mappers/client-scope-protocol-mapper';
import IdentityProviderMapperHandle from '@egose/keycloak-fluent/identity-provider-mapper';
import AttackDetectionHandle from '@egose/keycloak-fluent/attack-detection';
import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const coreStub = {} as any;
const realm = new RealmHandle(coreStub, 'demo');
const cli = new ClientHandle(coreStub, realm, 'app');
const cs = new ClientScopeHandle(coreStub, realm, 'scope');
const idp = new IdentityProviderHandle(coreStub, realm, 'idp');
const parent = new GroupHandle(coreStub, realm, 'p');

export function bad() {
  // routing identity — must be immutable from the outside
  // @ts-expect-error clientId is a readonly getter
  cli.clientId = 'other';
  // @ts-expect-error scopeName is a readonly getter
  cs.scopeName = 'other';
  // @ts-expect-error role name on a client role is a readonly getter
  new ClientRoleHandle(coreStub, cli, 'role').roleName = 'other';
  // @ts-expect-error mapperName on a client protocol mapper is a readonly getter
  new ProtocolMapperHandle(coreStub, cli, 'm').mapperName = 'other';
  // @ts-expect-error mapperName on a client-scope protocol mapper is a readonly getter
  new ClientScopeProtocolMapperHandle(coreStub, cs, 'm').mapperName = 'other';
  // @ts-expect-error identity-provider alias is a readonly getter
  idp.alias = 'other';
  // @ts-expect-error mapperName on an idp mapper is a readonly getter
  new IdentityProviderMapperHandle(coreStub, idp, 'm').mapperName = 'other';
  // @ts-expect-error realmName on RealmHandle is a readonly getter
  realm.realmName = 'other';
  // @ts-expect-error realmName on a sub-handle is readonly
  cli.realmName = 'other';
  // @ts-expect-error realmName on cache handle is a readonly getter
  new CacheHandle(coreStub, realm).realmName = 'other';
  // @ts-expect-error realmName on client-policies handle is a readonly getter
  new ClientPoliciesHandle(coreStub, realm).realmName = 'other';
  // @ts-expect-error user username is a readonly getter
  new UserHandle(coreStub, realm, 'u').username = 'other';
  // @ts-expect-error organization alias is a readonly getter
  new OrganizationHandle(coreStub, realm, 'org').organizationAlias = 'other';
  // @ts-expect-error authentication-flow alias is a readonly getter
  new AuthenticationFlowHandle(coreStub, realm, 'flow').alias = 'other';
  // @ts-expect-error workflow name is a readonly getter
  new WorkflowHandle(coreStub, realm, 'wf').workflowName = 'other';
  // @ts-expect-error component name is a readonly getter
  new ComponentHandle(coreStub, realm, 'comp').componentName = 'other';
  // @ts-expect-error group name is a readonly getter
  new GroupHandle(coreStub, realm, 'g').groupName = 'other';
  // @ts-expect-error child-group parentGroupName is a readonly getter
  new ChildGroupHandle(coreStub, parent, 'c').parentGroupName = 'other';
  // @ts-expect-error group name on a child group is a readonly getter
  new ChildGroupHandle(coreStub, parent, 'c').groupName = 'other';
  // @ts-expect-error group name on a nested child group is a readonly getter
  new NestedChildGroupHandle(coreStub, 'demo', '/p', 'n').groupName = 'other';
  // @ts-expect-error attack-detection userId is a readonly getter
  new AttackDetectionHandle(coreStub, realm, 'u').userId = 'other';

  // cached representations — must not be writable externally
  // @ts-expect-error realm cache is a readonly getter
  realm.realm = undefined;
  // @ts-expect-error client cache is a readonly getter
  cli.client = undefined;
  // @ts-expect-error clientScope cache is a readonly getter
  cs.clientScope = undefined;
  // @ts-expect-error role cache is a readonly getter
  new RoleHandle(coreStub, realm, 'r').role = undefined;
  // @ts-expect-error group cache is a readonly getter
  new GroupHandle(coreStub, realm, 'g').group = undefined;
  // @ts-expect-error identity provider cache is a readonly getter
  idp.identityProvider = undefined;
  // @ts-expect-error user cache is a readonly getter
  new UserHandle(coreStub, realm, 'u').user = undefined;
  // @ts-expect-error organization cache is a readonly getter
  new OrganizationHandle(coreStub, realm, 'o').organization = undefined;
  // @ts-expect-error flow cache is a readonly getter
  new AuthenticationFlowHandle(coreStub, realm, 'f').flow = undefined;
  // @ts-expect-error workflow cache is a readonly getter
  new WorkflowHandle(coreStub, realm, 'w').workflow = undefined;
  // @ts-expect-error component cache is a readonly getter
  new ComponentHandle(coreStub, realm, 'c').component = undefined;
  // @ts-expect-error client-role cache is a readonly getter
  new ClientRoleHandle(coreStub, cli, 'r').role = undefined;
  // @ts-expect-error client-protocol-mapper cache is a readonly getter
  new ProtocolMapperHandle(coreStub, cli, 'm').clientProtocolMapper = undefined;
  // @ts-expect-error client-scope-protocol-mapper cache is a readonly getter
  new ClientScopeProtocolMapperHandle(coreStub, cs, 'm').clientScopeProtocolMapper = undefined;
  // @ts-expect-error idp-mapper cache is a readonly getter
  new IdentityProviderMapperHandle(coreStub, idp, 'm').identityProviderMapper = undefined;

  // core / realmHandle are publicly readable but not redirectable post-construction
  // @ts-expect-error sub-handle .core is readonly
  cli.core = {} as any;
  // @ts-expect-error sub-handle .realmHandle is readonly
  cli.realmHandle = realm;
  // @ts-expect-error KeycloakAdminClientFluent.core is readonly (Non-Goal protects reads, not writes)
  new KeycloakAdminClientFluent().core = {} as any;

  // idp-mapper alias / identityProvider are derived getters
  // @ts-expect-error idp-mapper alias is a readonly getter
  new IdentityProviderMapperHandle(coreStub, idp, 'm').alias = 'other';
  // @ts-expect-error idp-mapper identityProvider cache is a readonly getter
  new IdentityProviderMapperHandle(coreStub, idp, 'm').identityProvider = undefined;
}
`;

    test('tsc rejects every mutating statement in the fixture', () => {
      mkdirSync(fixtureDir, { recursive: true });

      const tsconfig = {
        compilerOptions: {
          target: 'es2022',
          module: 'es2022',
          moduleResolution: 'bundler',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowJs: true,
          resolveJsonModule: true,
          types: [],
          baseUrl: process.cwd(),
          paths: {
            '@egose/keycloak-fluent': ['./src/index'],
            '@egose/keycloak-fluent/*': ['./src/*'],
          },
          ignoreDeprecations: '6.0',
        },
        include: ['regression.ts'],
      };

      writeFileSync(fixturePath, fixtureSource);
      writeFileSync(fixtureTsconfigPath, JSON.stringify(tsconfig, null, 2));

      let stdErr = '';
      let exitCode = 0;
      try {
        execFileSync('pnpm', ['exec', 'tsc', '--noEmit', '-p', fixtureTsconfigPath], {
          cwd: process.cwd(),
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
      } catch (error: any) {
        exitCode = error.status ?? 1;
        stdErr = (error.stderr ?? '') + (error.stdout ?? '');
      }

      if (exitCode !== 0) {
        // Surface the tsc output for debugging
        console.error(stdErr);
      }

      try {
        expect(exitCode).toBe(0);
      } finally {
        rmSync(fixtureDir, { recursive: true, force: true });
      }
    }, 60000);

    test('fixture directory is cleaned up', () => {
      // sanity: no leftover from a previous run when this file is freshly imported
      if (existsSync(fixtureDir)) {
        rmSync(fixtureDir, { recursive: true, force: true });
      }
      expect(existsSync(fixtureDir)).toBe(false);
    });
  });
});
