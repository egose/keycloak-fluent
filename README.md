# Keycloak Fluent

<p align="center">
  <a href="https://www.npmjs.com/package/@egose/keycloak-fluent"><img alt="npm version" src="https://img.shields.io/npm/v/%40egose%2Fkeycloak-fluent" /></a>
  <a href="https://www.npmjs.com/package/@egose/keycloak-fluent"><img alt="npm downloads" src="https://img.shields.io/npm/dm/%40egose%2Fkeycloak-fluent" /></a>
  <a href="https://github.com/egose/keycloak-fluent/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/%40egose%2Fkeycloak-fluent" /></a>
  <a href="https://keycloak-fluent.pages.dev/"><img alt="docs" src="https://img.shields.io/badge/docs-online-blue" /></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/egose/keycloak-fluent/main/website/static/img/keycloak-fluent-lockup-dark.png" alt="Keycloak Fluent" width="640" />
</p>

<p align="center">
  Fluent TypeScript wrapper for the Keycloak Admin API with idempotent provisioning for realms, users, clients, authentication flows, organizations, and admin operations.
</p>

<p align="center">
  <a href="https://keycloak-fluent.pages.dev">Documentation</a>
  ·
  <a href="https://github.com/egose/keycloak-fluent">GitHub</a>
  ·
  <a href="https://www.npmjs.com/package/@egose/keycloak-fluent">npm</a>
</p>

## What It Is

`@egose/keycloak-fluent` builds on top of `@keycloak/keycloak-admin-client` and turns low-level admin calls into a fluent, chainable API for Keycloak provisioning and operations.

Instead of stitching together ids, searches, and update payloads everywhere, you work through handles such as:

- `kc.realm('demo')`
- `realm.user('alice')`
- `realm.client('app')`
- `realm.authenticationFlow('browser-copy')`
- `realm.organization('acme')`
- `realm.cache()`
- `kc.serverInfo()`

The library stays close to Keycloak rather than inventing a separate abstraction model. You keep the official admin client underneath, but get a much better working surface for repeatable automation.

## Why Use It

- Write provisioning code that reads like intent instead of request plumbing.
- Use `ensure(...)` and `discard()` for idempotent setup and cleanup flows.
- Traverse Keycloak resources from a realm through dedicated resource handles.
- Cover more than CRUD: authentication flows, organizations, workflows, cache, attack detection, user storage sync, client policies, `serverInfo`, and `whoAmI` are supported too.
- Keep access to the official admin client through `kc.core`.

## Why Not Just Use `@keycloak/keycloak-admin-client`?

You still can, and this package intentionally keeps that option open.

Use the raw admin client when you want direct access to every endpoint with no extra abstraction.

Use `@egose/keycloak-fluent` when you want:

- idempotent provisioning with `ensure(...)` and `discard()`
- resource-scoped handles instead of passing ids and lookup results around manually
- readable scripts for realms, users, clients, flows, and organizations
- a cleaner working surface for operational tasks like cache clearing, attack detection, and server inspection

In practice, this library is best seen as a better orchestration layer on top of the official Keycloak client, not a replacement for it.

## Supported Keycloak Versions

This package currently depends on `@keycloak/keycloak-admin-client@^26.4.7`.

Practical guidance:

- Node.js `>=20` is required
- the current implementation is aligned with Keycloak Admin Client `26.x`
- the test suite exercises behavior consistent with Keycloak `26.x`

If you are targeting an older or significantly newer Keycloak release, verify the specific endpoints you depend on, especially for newer areas such as organizations, workflows, and authentication-flow administration.

## Installation

Requirements:

- Node.js `>=20`
- A reachable Keycloak server
- Credentials for the Keycloak Admin API

```bash
npm install @egose/keycloak-fluent
```

## Quick Start

```ts
import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const kc = new KeycloakAdminClientFluent({
  baseUrl: 'http://localhost:8080',
  realmName: 'master',
});

await kc.simpleAuth({
  username: 'admin',
  password: 'admin', // pragma: allowlist secret
  clientId: 'admin-cli',
});

const realm = await kc.realm('demo').ensure({
  displayName: 'Demo Realm',
});

const user = await realm.user('alice').ensure({
  email: 'alice@example.com',
  enabled: true,
});

const group = await realm.group('developers').ensure({
  description: 'Application developers',
});

await user.assignGroup(group);
```

## Authentication

### `simpleAuth(...)`

`simpleAuth(...)` picks the grant type for you:

- `password` grant when `password` is provided
- `refresh_token` grant when `refreshToken` is provided
- `client_credentials` grant otherwise
- `username` and `password` must be provided together
- `password` and `refreshToken` are mutually exclusive

```ts
await kc.simpleAuth({
  username: 'admin',
  password: 'admin', // pragma: allowlist secret
  clientId: 'admin-cli',
});

await kc.simpleAuth({
  clientId: 'my-service-account',
  clientSecret: 'my-secret', // pragma: allowlist secret
});

await kc.simpleAuth({
  clientId: 'admin-cli',
  refreshToken: process.env.KEYCLOAK_REFRESH_TOKEN,
});
```

### `auth(...)`

If you need full control over the grant configuration, call the underlying auth method directly:

```ts
await kc.auth({
  grantType: 'password',
  clientId: 'admin-cli',
  username: 'admin',
  password: 'admin', // pragma: allowlist secret
});
```

## Example Flows

### Realm and User Provisioning

```ts
const realm = await kc.realm('my-realm').ensure({
  displayName: 'My Realm',
});

await realm.user('john.doe').ensure({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
});
```

### Authentication Flows

```ts
const flow = await kc.realm('demo').authenticationFlow('browser-copy').ensure({
  description: 'Custom browser flow',
  providerId: 'basic-flow',
  topLevel: true,
  builtIn: false,
});

await flow.copy('browser-copy-v2');
await flow.addExecution('auth-cookie');
```

### Organizations

```ts
const realm = kc.realm('demo');
const organization = await realm.organization('acme').ensure({
  name: 'Acme Corp',
});

await organization.addMember(realm.user('alice'));

const google = realm.identityProvider('google');
await organization.linkIdentityProvider(google);
```

### Operational Helpers

```ts
const realm = kc.realm('demo');

await realm.cache().clearUserCache();
await realm.attackDetection('user-id').clear();

const info = await kc.serverInfo().get();
const me = await kc.whoAmI('master').get();
```

## Main Entry Points

### Root Client

`KeycloakAdminClientFluent` exposes:

- `auth(credentials)`
- `simpleAuth({...})`
- `realm(name)`
- `searchRealms(keyword)`
- `serverInfo()`
- `whoAmI(currentRealm, realmName?)`

### Realm Handle

`RealmHandle` is the main entry point for resource-scoped work. From a realm you can access handles for:

- clients
- authentication flows
- components
- client scopes
- roles
- groups
- users
- identity providers
- organizations
- user storage providers
- workflows
- browser login client helpers
- service accounts
- realm admin service accounts
- cache
- attack detection
- client policies

It also includes realm-level search and operational methods such as:

- `searchClients(...)`
- `searchClientScopes(...)`
- `searchRoles(...)`
- `searchGroups(...)`
- `searchUsers(...)`
- `searchIdentityProviders(...)`
- `searchOrganizations(...)`
- `searchAuthenticationFlows(...)`
- `searchWorkflows(...)`
- realm import/export helpers
- event queries
- localization helpers
- session helpers

## Main Handles At A Glance

| Handle                         | Purpose                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `KeycloakAdminClientFluent`    | Root entry point for auth, realm access, server info, and who-am-i                   |
| `RealmHandle`                  | Realm-scoped entry point for users, groups, roles, clients, flows, and operations    |
| `UserHandle`                   | Manage users, credentials, role mappings, groups, sessions, and federated identities |
| `GroupHandle`                  | Manage groups, hierarchy, membership, and role mappings                              |
| `RoleHandle`                   | Manage realm roles and related mappings                                              |
| `ClientHandle`                 | Manage clients, client roles, and protocol mappers                                   |
| `ClientScopeHandle`            | Manage client scopes and scope mappers                                               |
| `IdentityProviderHandle`       | Manage identity providers and provider-level mapper access                           |
| `IdentityProviderMapperHandle` | Manage mappers attached to an identity provider                                      |
| `AuthenticationFlowHandle`     | Manage flows, executions, authenticator config, and required actions                 |
| `OrganizationHandle`           | Manage organizations, members, invitations, and linked identity providers            |
| `WorkflowHandle`               | Manage realm workflows and workflow listing                                          |
| `ComponentHandle`              | Manage realm components such as user storage-related components                      |
| `UserStorageProviderHandle`    | Trigger sync, unlink, naming, and mapper sync operations for user storage providers  |
| `CacheHandle`                  | Clear realm caches                                                                   |
| `AttackDetectionHandle`        | Inspect or clear user and realm attack-detection state                               |
| `ClientPoliciesHandle`         | Read and update client profiles and client policies                                  |
| `ServerInfoHandle`             | Read root server info and effective message bundles                                  |
| `WhoAmIHandle`                 | Inspect the currently authenticated admin user                                       |

## Supported Areas

The currently documented and tested surface includes:

- realms
- users
- groups
- roles
- clients
- client scopes
- protocol mappers
- identity providers
- identity provider mappers
- authentication flows
- organizations
- workflows
- components
- user storage providers
- cache operations
- attack detection
- client policies
- server info
- who-am-i

## Notes

- For resource-style handles, `update(...)` and the update path of `ensure(...)` now merge the supplied fields into the existing representation before sending the admin update call. This keeps unspecified nested fields such as attributes, config blocks, redirect URIs, and other existing settings intact.
- `WorkflowHandle` now follows the same contract as the other mutable handles: it exposes `create(...)`, `update(...)`, `ensure(...)`, `delete()`, and `discard()`.
- Some higher-level helpers resolve resources lazily by alias or name, so code stays concise while still failing explicitly when a resource cannot be resolved.
- You can always access the underlying official admin client through `kc.core`.

## Documentation

- Site: `https://keycloak-fluent.pages.dev`
- Quick Start: `https://keycloak-fluent.pages.dev/about/quick-start/`
- API Reference: `https://keycloak-fluent.pages.dev/api/keycloak-admin-client-fluent/`
- Examples: `https://keycloak-fluent.pages.dev/example/general/`

## Development

```bash
npm install
npm run build
npm test
```

### Build, Type-check, And Release Verification

- `npm run build`
  Produces the publishable `dist/` from current source via `tsup` (ESM + CJS + `.d.ts`/`.d.cts`). The package `exports`/`main`/`module`/`types` entry points all point at `dist/index.{cjs,js,d.ts}`, so the bundle is the source of truth for the installed tarball.
- `npm run typecheck`
  Runs `tsc --noEmit` for project-wide type validation. This is the non-emitting type gate used by CI and pre-publish checks; it does not write `build/`.
- `npm run pack:inspect`
  Rebuilds `dist/`, runs `npm pack --dry-run --json`, and asserts the tarball contains only the intended files (`dist/index.*`, `README.md`, `LICENSE`, `CHANGELOG.md`, `package.json`) and no source maps. Useful as a guard against stale or accidental package-file drift.
- `npm run pack:consumers`
  Builds and packs the tarball, then installs it into isolated ESM, CJS, and TypeScript consumer projects under `.packed-consumers/` and exercises `simpleAuth()` validation plus representative handle creation in each. The TypeScript consumer additionally runs `tsc --noEmit` against the packed `.d.ts` with `skipLibCheck: false` to prove the published declarations compile in an external strict project.
- `npm run publish:check`
  Runs the full pre-publish chain: `lint:check` -> `typecheck` -> `test:unit` -> `build` -> `pack:inspect` -> `pack:consumers`. Publish only after this passes.

### Test Layers

The repo intentionally has two different kinds of tests:

- `npm run test:unit`
  Runs the mocked implementation/contract tests in `tests/implementation-*.spec.ts`.
  These verify the fluent wrapper behavior itself: lazy resolution, correct admin-client method selection, payload shaping, pagination wiring, and resource-handle contracts.
- `npm run test:integration`
  Runs the live Keycloak integration tests in the rest of `tests/*.spec.ts`.
  These create real realms and resources against a running Keycloak instance through `tests/test-utils.ts`.
- `npm test`
  Runs the full suite.

The mocked tests are not meant to replace the live integration suite. They exist because some wrapper guarantees are easier and safer to assert at the admin-client call boundary than through a live server alone.

### Integration Sandbox

The live integration tests (`npm run test:integration`) target a Keycloak instance provisioned by the `sandbox/` Docker Compose stack:

```bash
make DAEMON=true up   # start Keycloak + Postgres in the background
make logs             # tail sandbox service logs
make down             # stop and remove sandbox containers
make destroy          # down + remove volumes and images
```

The stack pins every image by immutable digest (`postgres:18.4-alpine3.22@sha256:...`, `quay.io/keycloak/keycloak:26.6.1@sha256:...`, and the `golang` mkcert build stage) and builds the local mkcert cert from the pinned `mkcert` release tag (`v1.4.4`, commit-pinned inside the Dockerfile), so a forced re-pull cannot silently advance the runtime to a different image than the one the tests were authored against.

The integration tests read their target endpoint and credentials from environment variables so a non-default Keycloak instance can be targeted without editing the test sources. Defaults match the local sandbox:

| Environment variable    | Default                 | Purpose                                    |
| ----------------------- | ----------------------- | ------------------------------------------ |
| `KEYCLOAK_BASE_URL`     | `http://localhost:8080` | Keycloak admin API base URL.               |
| `KEYCLOAK_MASTER_REALM` | `master`                | Master realm name to authenticate against. |
| `KEYCLOAK_USERNAME`     | `admin`                 | Admin username for `simpleAuth()`.         |
| `KEYCLOAK_PASSWORD`     | `password`              | Admin password for `simpleAuth()`.         |

For example, to run the integration suite against Keycloak on `https://kc.example:8443` with custom credentials:

```bash
KEYCLOAK_BASE_URL=https://kc.example:8443 \
KEYCLOAK_USERNAME=ci-admin \
KEYCLOAK_PASSWORD="$CI_ADMIN_PASSWORD" \
  npm run test:integration
```

In CI, the `.github/actions/setup-sandbox` composite action installs Docker Compose v2 (its downloaded binary is checksum-verified against the pinned SHA before use), brings the sandbox up, waits for the master realm `openid-configuration` to be reachable, runs the provided script, and tears the services down via an `EXIT` trap that fires on success, failure, and job cancellation — so cleanup and diagnostic logs run even if the script is interrupted.

## License

Apache-2.0
