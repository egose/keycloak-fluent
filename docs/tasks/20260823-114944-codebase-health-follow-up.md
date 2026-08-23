# Codebase Health Follow-Up

Created: 2026-08-23 11:49:44 PDT

Related plan: `docs/tasks/20260813-141755-codebase-health-remediation.md`

## Objective

Close current correctness, security, performance, readability, encapsulation, reusability, and testability gaps in `@egose/keycloak-fluent` after the August 13 remediation. This is a fresh follow-up because the prior plan is substantially complete and contains historical completion evidence that should not be rewritten.

## Scope And Working Rules

- Treat findings below as current-source findings. Do not rely on completion claims in the related plan without checking the checked-in implementation.
- Add a regression test that fails against the current implementation before changing confirmed behavior.
- Prefer one shared enforcement point for retries, pagination, ownership, and handle identity.
- Preserve the fluent API unless a task explicitly calls out a contract change.
- Do not preserve unsafe mutation replay or credential disclosure for compatibility.
- Do not hand-edit `dist/`; build and pack checks regenerate it.
- Do not modify `src/openapi.json` unless the upstream API source and generation process are explicitly verified.
- Do not revert unrelated worktree changes. Re-read shared files before editing because agents may run concurrently.
- Run build, pack, and sandbox commands serially because they share generated output or infrastructure.
- Update source, tests, website documentation, and release notes together for externally observable behavior.

## Non-Goals

- Replacing the fluent handle model with a different API.
- Hiding the intentionally exposed raw client at `KeycloakAdminClientFluent.core`.
- Broad formatting or naming rewrites unrelated to a finding.
- Increasing a coverage percentage without strengthening a concrete boundary.
- Rewriting historical completion evidence in the related August 13 plan. Add a correction or resolution note instead.

## Baseline Verification

Observed on 2026-08-23 from a clean worktree:

- `pnpm typecheck`: passed.
- `pnpm typecheck:tests`: passed.
- `pnpm lint:check`: passed.
- `pnpm test:unit`: passed, 17 files and 232 tests.
- `pnpm build`: passed; ESM, CJS, and declarations were emitted.
- `pnpm pack:inspect`: passed; the `0.13.1` tarball contains 8 expected entries and no source maps.
- `pnpm audit --prod`: no known vulnerabilities.
- `pnpm test:integration` was not run because this review did not start the Docker/Keycloak sandbox.
- `pnpm pack:consumers` was not run during this review.

Canonical commands:

```bash
pnpm lint:check
pnpm typecheck
pnpm typecheck:tests
pnpm test:unit
pnpm build
pnpm pack:inspect
pnpm pack:consumers
make DAEMON=true up
pnpm test:integration
make down
pnpm publish:check
```

## Priority Definitions

- P0: credential disclosure, unsafe replay of a committed mutation, release integrity failure, or similarly high-impact risk.
- P1: confirmed incorrect routing, data truncation, partial-success ambiguity, or public contract failure.
- P2: hardening, performance, maintainability, testability, or documentation drift with bounded runtime impact.
- P3: optional cleanup or measurement that should not delay correctness work.

## Wave 1: Safety And Data Integrity

### Task RETRY-02: Stop Implicit Replay Of Mutating Admin Requests

Status: completed

Priority: P0

Suggested agent: resilience and data-integrity specialist

Dependencies: none

Primary ownership:

- `src/utils/retry.ts`
- callers of `retryTransientAdminError` under `src/`
- `tests/implementation-retry.spec.ts`
- focused caller regression tests

Finding:

`retry()` defaults to one effective attempt unless `idempotent: true`, but the legacy `retryTransientAdminError()` wrapper forcibly sets `idempotent` to `true`. Approximately one hundred call sites use that wrapper, including client, realm, organization, role, authentication-flow, component, and other create/update/delete operations. A transient response after a committed write can therefore replay the mutation. This contradicts the helper's stated safe default and the earlier remediation objective.

References:

- `src/utils/retry.ts:22-24`
- `src/utils/retry.ts:217-290`
- `src/clients/client.ts:235-301`
- `src/organization.ts:145-234`
- `src/authentication-flow.ts:141-229`
- `src/component.ts:151-218`
- `src/client-policies.ts:35-50` as the desired explicit mutation pattern

Implementation requirements:

1. Make the compatibility wrapper replay-safe by default; it must not silently opt an unknown operation into mutation retries.
2. Inventory every call site and classify it as read-only, provably idempotent mutation, or non-idempotent/ambiguous mutation.
3. Move read-only calls to `retry(..., { idempotent: true })` or a clearly named read helper.
4. Keep mutations single-attempt unless the call site records a concrete endpoint-level idempotency rationale and has an ambiguous-response regression test.
5. Preserve structured status classification, bounded backoff, cancellation, and original-error behavior.
6. Do not infer replay safety from HTTP method names alone; Keycloak create/copy/add endpoints can commit before returning an error.

Acceptance criteria:

- A 503 from a create/update/delete operation causes exactly one request by default.
- A 503 from an explicitly classified read can retry according to policy.
- Every remaining explicit mutation retry has a source comment and test proving replay safety.
- A repository search no longer finds unclassified mutation calls wrapped by a helper that implies idempotency.
- `pnpm test:unit`, `pnpm typecheck`, and `pnpm lint:check` pass.

Completion evidence:

- Changed: `src/utils/retry.ts`, `src/attack-detection.ts`, `src/authentication-flow.ts`, `src/client-role.ts`, `src/client-scope.ts`, `src/clients/client-lookup.ts`, `src/clients/client.ts`, `src/component.ts`, `src/groups/abstract-group.ts`, `src/organization.ts`, `src/realm.ts`, `src/role.ts`, `src/server-info.ts`, `src/user-storage-provider.ts`, `src/who-am-i.ts`, `src/workflow.ts`, `tests/implementation-client.spec.ts`, `tests/implementation-resource-handles.spec.ts`, `tests/implementation-retry.spec.ts`.
- Inventory/classification: read-only wrapper call sites were moved to `retryTransientAdminReadError`; create/update/delete/copy/add/remove/link/unlink/invite/sync/generate/import/upload/push/clear-style mutations remain on `retryTransientAdminError`, which now defaults to single-attempt unless `idempotent: true` is explicit. The only source explicit mutation retry remains cache clearing in `src/cache.ts`, with an idempotency rationale and regression coverage.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 236 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`).
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`).
- Follow-up: none for RETRY-02.

### Task USER-02: Make Password Provisioning Errors Confidential And State-Accurate

Status: completed

Priority: P0

Suggested agent: identity lifecycle and security specialist

Dependencies: RETRY-02

Primary ownership:

- `src/user.ts`
- `tests/implementation-user-password-provisioning.spec.ts`
- `website/docs/api/user.mdx`
- root exports only after API-02 decides the public surface

Finding:

The public error contract says plaintext passwords never appear in `UserPasswordProvisioningError.cause`, but the raw upstream password-reset error is assigned directly as the cause. The existing test uses an error message containing `s3cret-value` and only asserts that the complete message is not exactly equal to the password, so the leak passes. Cleanup failure also leaves a disabled user while `profileApplied` remains `false`. Separately, an enable failure after a successful password reset escapes as a raw error, leaving a disabled account with a committed password; retrying the original default-enabled input follows the existing-user path and does not necessarily enable it.

References:

- `src/user.ts:88-129`
- `src/user.ts:222-245`
- `src/user.ts:263-277`
- `src/user.ts:325-342`
- `src/user.ts:379-405`
- `tests/implementation-user-password-provisioning.spec.ts:337-404`
- `website/docs/api/user.mdx:286-310`

Implementation requirements:

1. Redact the supplied password from the complete public error graph without mutating the upstream error object. Cover messages, nested causes, cleanup errors, enumerable properties, and serialized forms.
2. Preserve useful bounded diagnostics such as status and safe error codes; do not expose arbitrary response bodies under the confidentiality guarantee.
3. Make persisted state explicit when cleanup fails. `profileApplied` must not be `false` while an account remains, or the field must be replaced by an unambiguous state model.
4. Treat the final enable step as part of initial provisioning and surface a typed partial-success result when it fails after password application.
5. Define deterministic retry behavior for the exact original create/ensure input after password or enable failure.
6. Document any new fields and export the catchable error through the chosen public entry point under API-02.

Acceptance criteria:

- Recursively inspecting or serializing the thrown error cannot find the supplied plaintext password, even when mocked upstream and cleanup errors echo it.
- Cleanup success reports no persisted account; cleanup failure reports that a disabled account persists.
- Enable failure reports `passwordApplied: true` and the actual disabled state, or an equivalent explicit state contract.
- Retrying the exact same default-enabled input after an enable failure converges to an enabled user without creating a duplicate.
- Create, ensure-create, existing-user update, cleanup-failure, and enable-failure regressions pass.
- `pnpm test:unit`, `pnpm typecheck`, `pnpm typecheck:tests`, and `pnpm lint:check` pass.

Completion evidence:

- Changed: `src/user.ts`, `src/index.ts`, `tests/implementation-user-password-provisioning.spec.ts`, `website/docs/api/user.mdx`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: `UserPasswordProvisioningError` now exposes sanitized diagnostic `cause` data without mutating upstream errors; redaction covers messages, nested causes, cleanup failures, enumerable properties, blocked response/body-like fields, and `toJSON()` serialization. Partial state is explicit through `accountPersists`, `accountEnabled`, and `passwordApplied` while retaining `profileApplied` compatibility. Final enable failures are wrapped as typed partial-success errors. The root entry point exports `UserPasswordProvisioningError` under the API-02 root-only package-surface decision.
- Retry behavior: after create/ensure password failure with successful cleanup, no account persists and the same operation starts clean. If cleanup fails, the error reports a disabled persisted account; retrying with `ensure()` and the same enabled input updates the existing account instead of creating a duplicate. After final enable failure, retrying `ensure()` with the same default-enabled input converges to an enabled existing user without duplicate creation.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-user-password-provisioning.spec.ts`.
- Result: passed, 1 test file and 17 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 239 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Follow-up: none for USER-02.

### Task OWN-02: Enforce Ownership For Every Cross-Handle Operation

Status: completed

Priority: P1

Suggested agent: authorization-boundary and API-contract specialist

Dependencies: RETRY-02

Primary ownership:

- `src/utils/role-ownership.ts` or a package-wide replacement
- cross-handle methods under `src/`
- focused ownership regression tests

Finding:

Role mapping methods gained core/realm/client ownership checks, but other methods still trust representations from arbitrary handles. Client-scope assignment, organization membership and IdP linking, user group and federated-identity linking, realm default-group operations, composite-role operations, and client-filtered composite reads can consume cached IDs or aliases from another realm or admin-client instance before issuing a request through the owner handle.

References:

- `src/clients/client.ts:174-190`
- `src/clients/client.ts:324-399`
- `src/organization.ts:107-123`
- `src/organization.ts:287-314`
- `src/organization.ts:356-383`
- `src/user.ts:683-716`
- `src/user.ts:797-820`
- `src/role.ts:69-75`
- `src/role.ts:159-178`
- `src/role.ts:229-245`
- `src/client-role.ts:99-105`
- `src/client-role.ts:208-227`
- `src/utils/role-ownership.ts:22-128`

Implementation requirements:

1. Inventory every public method accepting another handle; record why each combination is valid or rejected.
2. Generalize ownership checks around package-wide concepts such as same admin-client instance, live realm identity, resource kind, and parent resource identity.
3. Validate ownership before resolving either handle or issuing any network request.
4. Do not compare only cached representation IDs because equal IDs from different cores are not proof of ownership.
5. Keep messages actionable without leaking credentials or transport details.
6. Preserve valid same-core, same-realm request shapes.

Acceptance criteria:

- Cross-core and cross-realm inputs fail before all reads and mutations for every cross-handle method.
- Wrong-parent and wrong-kind inputs fail where applicable.
- Negative tests assert zero network calls, not only zero mutation calls.
- Valid same-owner operations retain their current endpoint payloads.
- The ownership helper is resource-agnostic rather than duplicating role-specific logic.
- `pnpm test:unit`, `pnpm typecheck`, and focused live integration tests pass.

Completion evidence:

- Changed: `src/utils/resource-ownership.ts`, `src/user.ts`, `tests/implementation-role-ownership.spec.ts`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Inventory: public cross-handle methods were checked across `src/clients/client.ts`, `src/organization.ts`, `src/user.ts`, `src/realm.ts`, `src/role.ts`, `src/client-role.ts`, and `src/groups/abstract-group.ts`. Covered combinations are client-scope assignment, client scope role mappings, organization membership and IdP linking, user realm/client role mappings, user group assignment, user federated identity linking, user offline sessions by client, realm default groups, realm/client role composites, client-filtered composite reads, and group realm/client role mappings. Valid combinations require the same admin-client instance, live realm identity, expected resource kind, and parent client identity for client-role ownership; invalid cross-core, cross-realm, wrong-kind, and wrong-parent inputs are rejected before handle resolution or network access.
- Implementation: `resource-ownership` now derives live realm identity recursively through parent handles and exposes parent-resource identity checks. Client-role parent ownership is enforced through the shared resource identity path instead of comparing cached representation IDs alone. `UserHandle.assignRealmRoles()` and `unassignRealmRoles()` now prevalidate every role handle before resolving any role or user.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-role-ownership.spec.ts`.
- Result: passed, 1 test file and 18 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 246 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Focused live integration attempted: `pnpm vitest run --no-cache --config vitest.integration.config.ts tests/role-composite.spec.ts tests/client-client-scope-assignment.spec.ts tests/user-federated-identity.spec.ts`.
- Result: failed before test actions during `simpleAuth()` because the local Keycloak sandbox was not reachable at `localhost:8080` (`UND_ERR_CONNECT_TIMEOUT`).
- Follow-up: rerun the focused integration command after starting the sandbox with `make DAEMON=true up`; no code follow-up identified from unit/type/lint verification.

### Task IDP-01: Preserve JWKS Configuration When The URL Is Omitted

Status: completed

Priority: P1

Suggested agent: identity-provider specialist

Dependencies: RETRY-02

Primary ownership:

- `src/identity-provider.ts`
- identity-provider unit and integration tests
- identity-provider API documentation if behavior is documented

Finding:

`normalizeIdentityProviderData()` evaluates `undefined !== ''` as true and writes `useJwksUrl: 'true'` when `config.jwksUrl` is absent. Update and ensure-update merge server data and caller data through this normalization, so an omitted URL can silently enable JWKS URL use without a URL and alter unrelated authentication behavior.

References:

- `src/identity-provider.ts:53-74`
- `src/identity-provider.ts:141-178`
- `tests/identity-provider.spec.ts:16-24`

Implementation requirements:

1. Derive `useJwksUrl` only when `jwksUrl` is explicitly present in the effective input according to a documented rule.
2. Preserve an existing `useJwksUrl` value when an update omits `jwksUrl`.
3. Define behavior for absent, empty, whitespace-only, and non-empty values without changing unrelated config keys.
4. Avoid mutating caller-owned nested config objects.

Acceptance criteria:

- Omitted `jwksUrl` does not enable JWKS URL use.
- Empty and non-empty URL inputs produce the documented boolean-string setting.
- Update and ensure preserve existing settings when the field is omitted.
- Focused unit tests fail on the current `undefined !== ''` behavior.
- `pnpm test:unit`, `pnpm typecheck`, and the identity-provider integration test pass.

Completion evidence:

- Changed: `src/identity-provider.ts`, `tests/implementation-regressions.spec.ts`, `website/docs/api/identity-provider.mdx`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: `normalizeIdentityProviderData()` now derives `useJwksUrl` only when caller input explicitly includes `config.jwksUrl`; omitted `jwksUrl` preserves existing update/ensure settings, empty and whitespace-only strings set `'false'`, and non-empty strings set `'true'`. Normalization still clones merged data and does not mutate caller-owned config objects.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-regressions.spec.ts`.
- Result: passed, 1 test file and 45 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 251 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Focused live integration attempted: `pnpm vitest run --no-cache --config vitest.integration.config.ts tests/identity-provider.spec.ts`.
- Result: failed before test actions during `simpleAuth()` because the local Keycloak sandbox was not reachable at `localhost:8080` (`UND_ERR_CONNECT_TIMEOUT`).
- Follow-up: rerun the focused identity-provider integration command after starting the sandbox with `make DAEMON=true up`; no code follow-up identified from unit/type verification.

## Wave 2: Pagination And Handle Identity

### Task PAGE-02: Prevent Truncation Under Server-Side Page Caps

Status: completed

Priority: P1

Suggested agent: pagination and scalability specialist

Dependencies: RETRY-02

Primary ownership:

- `src/utils/fetch-all.ts`
- `src/user.ts::listAssignedGroups`
- `src/groups/group-lookup.ts`
- `tests/implementation-pagination.spec.ts`
- focused caller tests

Finding:

`fetchAll()` and `fetchAllStream()` stop when a returned page is shorter than the requested page size. If Keycloak caps an endpoint below the requested `max`, a short page does not prove exhaustion and the methods silently truncate. The current documentation explicitly claims that this behavior avoids truncation, and tests enshrine it. `UserHandle.listAssignedGroups()` separately advances by requested `max`, has no page bound or cancellation, and can skip rows under a server cap. `group-lookup.ts` also retains a separate message-substring retry loop instead of the structured retry policy.

References:

- `src/utils/fetch-all.ts:9-22`
- `src/utils/fetch-all.ts:75-115`
- `src/utils/fetch-all.ts:132-182`
- `src/user.ts:719-743`
- `src/groups/group-lookup.ts:20-26`
- `src/groups/group-lookup.ts:49-105`
- `tests/implementation-pagination.spec.ts`
- `tests/implementation-regressions.spec.ts:1103-1119`
- `tests/implementation-regressions.spec.ts:1178-1197`

Implementation requirements:

1. Continue after a non-empty short page unless the endpoint supplies an authoritative completion signal.
2. Advance by the actual number of rows returned and terminate on an empty page, explicit total/done signal, repeated-page failure, cancellation, or `maxPages`/`maxItems` bound.
3. Throw a controlled error on repeated-page detection; do not silently return a potentially truncated collection.
4. Add a configurable item bound in addition to the page bound so large collections cannot exhaust memory unnoticed.
5. Replace `listAssignedGroups()` with the shared paginator and expose cancellation/bounds while preserving its array-return contract.
6. Replace group lookup's `unknown_error` substring loop with the structured, read-safe retry policy from RETRY-02.
7. Correct comments and tests that currently describe a short server-capped page as terminal.

Acceptance criteria:

- Pages of 50 rows continue correctly when `max: 100` and more rows exist.
- No rows are skipped when the server returns fewer rows than requested.
- Repeated content/offset behavior fails explicitly before `maxPages`; it never returns silent partial success.
- `maxPages`, `maxItems`, and `AbortSignal` work for buffered and streaming APIs.
- Plain `Error('unknown_error')` is not retried; structured 429/502/503/504 read failures can retry.
- All `fetchAll` callers pass focused cap/exhaustion tests, and `pnpm test:unit` passes.

Completion evidence:

- Changed: `src/utils/fetch-all.ts`, `src/user.ts`, `src/groups/group-lookup.ts`, `tests/implementation-pagination.spec.ts`, `tests/implementation-regressions.spec.ts`, `tests/implementation-workflow.spec.ts`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: `fetchAll()` and `fetchAllStream()` now continue after non-empty short pages, advance by actual rows returned, stop on empty pages or explicit `done`, enforce repeated-page, `maxPages`, `maxItems`, and `AbortSignal` guards, and expose a configurable item bound. Streaming iteration terminates on an empty page without yielding the terminator. `UserHandle.listAssignedGroups()` uses the shared paginator while retaining its array-return contract and now accepts paginator options plus `briefRepresentation`/`search`. Group lookup uses the structured read-safe retry helper instead of message-substring retrying.
- Tests: focused regressions cover 50-row server-capped pages with `max: 100`, no skipped offsets, repeated-page failures, buffered and streaming `maxPages`/`maxItems`, AbortSignal cancellation, `listAssignedGroups()` cap/bounds/cancellation behavior, and structured group lookup retry behavior. Fixtures that previously treated repeated short pages as terminal were corrected to return an explicit empty page.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-pagination.spec.ts tests/implementation-regressions.spec.ts`.
- Result: passed, 2 test files and 69 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 261 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Follow-up: none for PAGE-02.

### Task HANDLE-03: Make Parent Rebinding Transitive And Cache-Safe

Status: completed

Priority: P1

Suggested agent: handle lifecycle specialist

Dependencies: OWN-02

Primary ownership:

- `src/realm.ts`
- handle classes storing `realmName` snapshots
- client/client-scope child handles and their caches
- `tests/implementation-handle-rebinding.spec.ts`
- `tests/implementation-handle-visibility.spec.ts`
- `website/docs/api/handle-identity.mdx`

Finding:

`RealmHandle.rebind()` claims existing descendants read the realm name live, but most constructors copy `realmHandle.realmName` into a readonly string. Those descendants remain routed to the old realm. Client and client-scope child handles read their parent identity live, but their own cached role/mapper representation survives a parent rebind. The current regression test manually calls `child.rebind(child.name)` after rebinding the parent, masking the stale-child problem.

References:

- `src/realm.ts:125-138`
- `src/clients/client.ts:105-116`
- `src/user.ts:132-166`
- `src/role.ts:16-47`
- `src/client-role.ts:15-45`
- `src/client-role.ts:90-96`
- `tests/implementation-handle-rebinding.spec.ts:30-48`
- `tests/implementation-handle-rebinding.spec.ts:102-117`
- `tests/implementation-handle-rebinding.spec.ts:170-185`

Implementation requirements:

1. Define a single parent identity/version contract. Descendants must derive live routing identity or detect a parent generation change.
2. Invalidate descendant resource caches automatically when a parent realm, client, client scope, group path, or other owning identity changes.
3. Do not require callers to rebind children manually after rebinding a parent.
4. Preserve the no-duplicate-lookup fast path when no identity changed.
5. Cover already-resolved descendants, not only children created before initial resolution.
6. Update documentation to match actual transitive behavior; if transitive rebinding cannot be supported safely, remove the claim and narrow the API in a documented major-version decision.

Acceptance criteria:

- Resolve a descendant under parent A, call only `parent.rebind(B)`, then invoke a read and mutation; no realm, parent ID, or child ID from A is sent.
- Tests cover realm descendants and client-role, client protocol-mapper, and client-scope protocol-mapper descendants.
- Multiple nested levels observe one parent rebind without manual child invalidation.
- Unchanged parent identity reuses cached representations and avoids duplicate requests.
- Public readonly visibility tests and website documentation agree with runtime behavior.
- `pnpm test:unit`, `pnpm typecheck:tests`, and focused integration tests pass.

Completion evidence:

- Changed: `src/user-storage-provider.ts`, `tests/implementation-handle-rebinding.spec.ts`, `website/docs/api/handle-identity.mdx`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: realm, client, client-scope, identity-provider, and group descendants use the shared `HandleIdentitySource` / `ParentIdentityTracker` contract so child caches are invalidated when parent generations change while preserving cached-parent fast paths when identity is unchanged. `UserStorageProviderHandle` now participates in the same parent-generation contract and clears its cached provider name when the parent realm is rebound.
- Tests: existing and added HANDLE regressions cover already-resolved realm descendants, client roles, client protocol mappers, client-scope protocol mappers, nested groups, reads and mutations after parent rebind, unchanged-parent cache reuse, and visibility/docs agreement.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-handle-rebinding.spec.ts tests/implementation-handle-visibility.spec.ts`.
- Result: passed, 2 test files and 36 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 268 tests.
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Focused live integration attempted: `pnpm vitest run --no-cache --config vitest.integration.config.ts tests/realm.spec.ts tests/client-role.spec.ts tests/protocol-mapper.spec.ts tests/client-scope-protocol-mapper.spec.ts`.
- Result: failed before test actions during `simpleAuth()` because the local Keycloak sandbox was not reachable at `localhost:8080` (`UND_ERR_CONNECT_TIMEOUT`).
- Follow-up: rerun the focused integration command after starting the sandbox with `make DAEMON=true up`; no code follow-up identified from unit/type verification.

### Task PAGE-03: Centralize And Strictly Validate Single-Page Queries

Status: completed

Priority: P2

Suggested agent: API consistency and maintainability specialist

Dependencies: PAGE-02

Primary ownership:

- a shared pagination query utility under `src/utils/`
- `src/realm.ts`
- `src/clients/client.ts`
- `src/organization.ts`
- `src/workflow.ts`
- `src/role.ts`
- `src/client-role.ts`
- focused pagination contract tests

Finding:

Several modules duplicate `getPaginationParams` or inline `Math.max(1, ...)`. This silently coerces negative values but allows fractional values, `Infinity`, and multiplication overflow into request offsets. Validation semantics differ from the strict `fetchAll` API and repeated implementations increase drift.

References:

- `src/realm.ts:75-101`
- `src/clients/client.ts:24-50`
- `src/organization.ts:7-28`
- `src/workflow.ts:6-21`
- `src/role.ts:183-197`
- `src/client-role.ts:232-246`

Implementation requirements:

1. Introduce one package-owned converter for `{ page, pageSize }` and `{ first, max }`.
2. Reject non-finite, non-integer, negative, zero-sized, and overflowed values before network access.
3. Define whether supplying both styles is invalid or whether one style has documented precedence.
4. Keep valid request shapes unchanged.
5. Avoid a broad endpoint rewrite; only replace duplicated pagination calculation and validation.

Acceptance criteria:

- Boundary tests cover zero, negative, fraction, `NaN`, `Infinity`, maximum safe integer, and conflicting option styles.
- Invalid input results in zero admin-client calls.
- Every single-page method uses the shared contract.
- Existing valid pagination request-shape tests pass.
- `pnpm test:unit`, `pnpm typecheck`, and `pnpm lint:check` pass.

Completion evidence:

- Changed: `src/utils/single-page-query.ts`, `src/realm.ts`, `src/clients/client.ts`, `src/organization.ts`, `src/workflow.ts`, `src/role.ts`, `src/client-role.ts`, `tests/implementation-pagination.spec.ts`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: added a shared `toSinglePageQuery()` converter for single-page `{ page, pageSize }` and `{ first, max }` options. It rejects mixed option styles as ambiguous; rejects non-finite, non-integer, unsafe, negative, zero-sized, and overflowed ranges before any request; and preserves existing valid `first`/`max` request shapes.
- Coverage: boundary tests cover zero, negative, fractional, `NaN`, `Infinity`, `Number.MAX_SAFE_INTEGER` overflow, and conflicting styles. Representative realm, workflow, client, organization, realm-role, and client-role calls assert invalid options make zero admin-client calls before handle resolution.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-pagination.spec.ts tests/implementation-client.spec.ts tests/implementation-realm.spec.ts tests/implementation-workflow.spec.ts`.
- Result: passed, 4 test files and 87 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 285 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Extra verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Follow-up: none for PAGE-03.

## Wave 3: Public API, Release Safety, And Testability

### Task AUTH-01: Bound And Sanitize Authentication Failures

Status: completed

Priority: P2

Suggested agent: OAuth security specialist

Dependencies: USER-02

Primary ownership:

- `src/index.ts`
- `tests/implementation-index.spec.ts`
- authentication documentation

Finding:

`simpleAuth()` serializes arbitrary `responseData` into the new error message and retains the raw error as `cause`. This can expose unexpectedly large or sensitive server content. Explicit empty strings also change grant selection: an empty `refreshToken` falls through to client credentials. The earlier plan already identified both concerns but did not promote them to an executable task.

References:

- `src/index.ts:16-60`
- `src/index.ts:74-115`
- `tests/implementation-index.spec.ts:19-35`
- `tests/implementation-index.spec.ts:71-86`
- related plan `Additional P2 Follow-Ups`

Implementation requirements:

1. Whitelist bounded OAuth error fields and cap rendered lengths.
2. Sanitize the public cause using the same no-credential principles as USER-02; do not expose client secrets, passwords, refresh tokens, or arbitrary bodies.
3. Reject explicitly supplied empty credentials rather than silently selecting another grant.
4. Preserve useful status/code information and normal valid grant selection.
5. Export `SimpleAuthOptions` through the chosen API surface under API-02.

Acceptance criteria:

- Oversized or credential-bearing response data cannot appear unbounded in the public error graph.
- Empty password, refresh token, username, client ID, and client secret cases follow a documented validation contract.
- Password, refresh-token, and client-credentials happy paths retain their request shapes.
- Unit tests cover circular response data, nested secrets, and size bounds.
- `pnpm test:unit`, `pnpm typecheck`, and `pnpm lint:check` pass.

Completion evidence:

- Changed: `src/index.ts`, `tests/implementation-index.spec.ts`, `README.md`, `website/docs/api/keycloak-admin-client-fluent.mdx`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: `simpleAuth()` now rejects explicitly supplied empty `username`, `password`, `refreshToken`, `clientId`, and `clientSecret` values before grant selection. Authentication failures now use bounded public diagnostics: OAuth response data is limited to whitelisted `error`, `error_description`, and `error_uri` fields with rendered string caps; public `cause` data keeps safe name/status/code fields and sanitized nested causes while redacting credential-like keys and supplied password, refresh token, and client secret values. Raw upstream errors and arbitrary response/body fields are no longer exposed as the public cause.
- API/docs: `SimpleAuthOptions` is exported from the root entry point. README and root API docs document non-empty credential validation and bounded sanitized authentication failures.
- Tests: root-client unit coverage now includes circular response data, nested secrets, size bounds, empty credential validation, and existing password, refresh-token, and client-credentials request-shape happy paths.
- Verified: `pnpm vitest run --no-cache --config vitest.unit.config.ts tests/implementation-index.spec.ts`.
- Result: passed, 1 test file and 6 tests.
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 288 tests.
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Extra verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Follow-up: none for AUTH-01.

### Task API-02: Choose And Enforce The Supported Public Surface

Status: completed

Priority: P1

Suggested agent: TypeScript library API specialist

Dependencies: maintainer decision on root-only named exports versus supported subpaths

Primary ownership:

- `src/index.ts`
- `src/keycloak-admin-client.ts`
- `package.json`
- `tsup.config.ts`
- packed TypeScript fixtures
- API documentation

Finding:

The package exports only the root entry point, while documented catchable errors such as `UserPasswordProvisioningError`, `WorkflowNotFoundError`, `DuplicateWorkflowNameError`, and `AuthenticationFlowNotFoundError` are defined in inaccessible source modules. `SimpleAuthOptions` and many useful input/query/handle types are also unavailable. Public declarations depend heavily on upstream `lib/...` deep imports, including an upstream misspelled filename. This is the still-blocked API-01 concern from the related plan, now made more visible by additional named exports in `src/index.ts` that packed-consumer tests do not inventory.

References:

- `package.json:48-57`
- `src/index.ts:8-14`
- `src/index.ts:145-156`
- `src/user.ts:95-129`
- `src/workflow.ts:35-70`
- `src/authentication-flow.ts:44-54`
- `src/keycloak-admin-client.ts:1-68`
- `website/docs/api/user.mdx:286-300`
- `website/docs/api/workflow.mdx:39-50`
- `website/docs/api/authentication-flow.mdx:70-77`
- related plan `API-01`

Blocker:

The maintainer must choose one supported package shape. The minimal recommendation is to retain one root entry point and intentionally export documented runtime errors plus supported option/input/query/handle types. Choose subpaths only if independent module entry points are a desired long-term compatibility commitment.

Decision for this implementation: retain the existing root-only package shape. Do not add supported subpath exports; make documented runtime errors and supported option/input/query/handle types intentionally importable from the package root.

Implementation requirements:

1. Record the package-shape decision before implementation and remove the blocked status.
2. Ensure every documented public runtime symbol and type is importable from a declared export path.
3. Prefer supported upstream exports. Where unavailable, define package-owned stable interfaces or narrow/pin the dependency compatibility range.
4. Add an API snapshot for ESM runtime exports, CJS runtime exports, and TypeScript declarations.
5. Test the declared minimum and current supported upstream client versions in isolated packed consumers.
6. Document and release-note additions, removals, and path changes.

Acceptance criteria:

- Every documented catchable error can be imported from the installed package.
- Every emitted entry is intentionally reachable, and no undeclared entry leaks into the tarball.
- API snapshots fail on accidental runtime or type export changes.
- Packed declarations compile with `skipLibCheck: false` at both compatibility-range endpoints.
- No supported public declaration relies on an unverified upstream deep path.
- `pnpm publish:check` passes after the decision is implemented.

Completion evidence:

- Decision: retained the root-only package shape; no supported subpath exports were added.
- Changed: `src/index.ts`, `scripts/pack-consumers.mjs`, `scripts/api-snapshots/esm-runtime-exports.json`, `scripts/api-snapshots/cjs-runtime-exports.json`, `scripts/api-snapshots/declaration-exports.json`, `README.md`, `CHANGELOG.md`, `website/docs/api/keycloak-admin-client-fluent.mdx`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: the root export now intentionally exposes the default client, `createManagedKeycloakClient`, documented catchable errors (`AuthenticationFlowNotFoundError`, `DuplicateWorkflowNameError`, `UserPasswordProvisioningError`, `WorkflowNotFoundError`), runtime handle classes, public option/input/query types, and Keycloak representation aliases used by public method signatures. Package exports remain root-only through `package.json`.
- API snapshots: packed consumers compare exact ESM runtime exports, CJS runtime exports, and TypeScript declaration export names against checked-in snapshots.
- Packed declarations: TypeScript consumer fixtures import every declaration snapshot export and compile with `skipLibCheck: false` against the default resolved upstream admin client and the pinned minimum supported `@keycloak/keycloak-admin-client@26.5.7`.
- Upstream compatibility: upstream representation declarations are not exported from the upstream root entry point, so this package continues to centralize and verify the required upstream declaration paths against the supported dependency range instead of adding unsupported package subpaths.
- Verified: `pnpm pack:consumers`.
- Result: passed for ESM, CJS, default TypeScript consumer, and minimum-upstream TypeScript consumer.
- Verified: `pnpm publish:check`.
- Result: passed (`lint:check`, `typecheck`, `test:unit` with 17 files and 288 tests, `build`, `pack:inspect`, and `pack:consumers`).
- Follow-up: none for API-02.

### Task RELEASE-02: Gate Publication On Test Types And Live Integration

Status: completed

Priority: P1

Suggested agent: release engineering specialist

Dependencies: RETRY-02, PAGE-02, USER-02

Primary ownership:

- `package.json`
- `.github/workflows/publish.yaml`
- reusable CI workflow or required-check configuration documentation
- release verification tests

Finding:

The tag-triggered publish workflow runs `publish:check`, but that script omits `typecheck:tests` and `test:integration`. The push-triggered test workflow runs those checks separately, with no dependency proving they passed for the exact tag commit before npm publication. A release can therefore publish while test compilation or live Keycloak integration is failing or still running.

References:

- `package.json:18-35`
- `.github/workflows/publish.yaml:3-33`
- `.github/workflows/test.yml:10-70`

Implementation requirements:

1. Add `typecheck:tests` to the canonical pre-publish verification.
2. Gate publishing on live integration success for the exact commit being tagged.
3. Prefer a reusable verification workflow or one tag workflow over timing assumptions between separate workflows.
4. Keep npm credentials unavailable to untrusted pull-request code and only expose them to the final publish step.
5. Prevent concurrent duplicate publication for the same tag.

Acceptance criteria:

- A failing test typecheck prevents the publish step.
- A failing or incomplete integration run for the tagged SHA prevents the publish step.
- Artifact checks and publish consume the same checked-out commit and lockfile.
- The publish job has least-privilege permissions and tag-scoped concurrency.
- Workflow syntax validation and a documented dry-run/failure-path check pass.

Completion evidence:

- Changed: `package.json`, `.github/workflows/publish.yaml`, `scripts/verify-release-workflow.mjs`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: `publish:check` now includes `pnpm typecheck:tests`. The tag-triggered publish workflow now has secret-free `static-verification` and `integration-verification` jobs, both checking out `${{ github.sha }}`. The final `publish` job depends on both verification jobs, checks out the same tagged SHA, rebuilds publishable `dist/`, refuses an already-published package version, and exposes `NPM_TOKEN` only in the final npm publish step through a temporary npm config. Workflow permissions are read-only and concurrency is scoped to `${{ github.workflow }}-${{ github.ref }}` with in-flight publication not cancelled.
- Release verification: added `scripts/verify-release-workflow.mjs` and `pnpm release:workflow:check` to assert the release workflow invariants that protect test typechecking, live integration gating, exact-SHA checkout, least-privilege permissions, tag-scoped concurrency, duplicate-version refusal, and npm credential placement.
- Verified: `pnpm release:workflow:check`.
- Result: passed (`Release workflow verification passed.`).
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Verified: `ASDF_ACTIONLINT_VERSION=1.7.12 actionlint -shellcheck= .github/workflows/publish.yaml`.
- Result: passed with shellcheck integration disabled. Plain `actionlint .github/workflows/publish.yaml` was blocked because this repo has no `actionlint` version in `.tool-versions`; enabling actionlint with an environment override then found shellcheck unavailable because this repo has no `shellcheck` version in `.tool-versions`.
- Verified: `pnpm publish:check`.
- Result: passed (`lint:check`, `typecheck`, `typecheck:tests`, `test:unit` with 17 files and 288 tests, `build`, `pack:inspect`, and `pack:consumers`).
- Dry-run/failure path: the workflow duplicate-version guard was run against the current package spec and refused publication because `@egose/keycloak-fluent@0.13.1` is already published. `npm publish --dry-run --ignore-scripts --access public` packed the expected 8 files and then failed with npm's expected registry refusal for the already-published `0.13.1` version.
- Local live integration blocker: `docker --version` reported Docker is not available in this WSL 2 distro, so the local Keycloak sandbox could not be started. The tag workflow now gates publication on `pnpm test:integration` inside `.github/actions/setup-sandbox` for the exact tagged SHA.
- Follow-up: rerun the full tag workflow in GitHub Actions on the release tag; no code follow-up identified from local workflow/package verification.

### Task PACK-02: Test The Real Installed Export And Authentication Contracts

Status: completed

Priority: P2

Suggested agent: package consumer-test specialist

Dependencies: API-02, AUTH-01

Primary ownership:

- `scripts/pack-consumers.mjs`
- `scripts/pack-inspect.mjs`
- packed fixture generation
- API export snapshot

Finding:

Packed consumers exercise only the default class. They do not import current named runtime exports or named types. The smoke script also claims `simpleAuth({})` is a validation rejection, but the implementation intentionally selects client credentials and the assertion passes only because an unauthenticated network request fails. This is environment-dependent and tests the wrong contract.

References:

- `scripts/pack-consumers.mjs:61-68`
- `scripts/pack-consumers.mjs:88-107`
- `scripts/pack-consumers.mjs:115-156`
- `src/index.ts:16-24`
- `src/index.ts:145-156`
- `README.md:123-131`

Implementation requirements:

1. Import and exercise every intentional root runtime export from ESM and CJS.
2. Import every intentional public type from a strict external TypeScript fixture.
3. Replace network-dependent authentication assertions with deterministic validation cases or an injected/mock local transport.
4. Snapshot export names and supported entry points without snapshotting unstable declaration formatting.
5. Keep fixture installation isolated from workspace `node_modules`.

Acceptance criteria:

- The smoke suite fails if a supported named export disappears from ESM, CJS, or declarations.
- No passing assertion depends on external network failure.
- `simpleAuth({})` is tested according to its documented contract after AUTH-01.
- `pnpm pack:inspect` and `pnpm pack:consumers` pass from a clean `dist/`.

Completion evidence:

- Changed: `scripts/pack-consumers.mjs`, `scripts/api-snapshots/package-entry-points.json`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Runtime export coverage: packed ESM and CJS consumers now compare installed root runtime export names to snapshots, assert every named runtime export is callable/constructable, construct documented runtime errors, exercise `createManagedKeycloakClient()`, and verify every exported handle class through public factory chains.
- Type/export coverage: packed TypeScript consumers snapshot declaration export names, import every intentional public declaration export from the installed package root, reference each imported declaration in a strict external fixture, and snapshot supported package entry points separately from declaration formatting.
- Authentication coverage: `simpleAuth({})` is now tested as the documented default `client_credentials` flow against an in-process local token endpoint, with request-shape assertions for grant type, default client ID, and absence of password/refresh token fields. Validation rejection cases remain deterministic and no passing assertion depends on external network failure.
- Isolation: packed fixtures are regenerated under `.packed-consumers/`, install the freshly packed tarball with `npm install --ignore-scripts`, and do not install into workspace `node_modules`.
- Verified from clean `dist/`: `pnpm exec rimraf ./dist && pnpm pack:inspect && pnpm pack:consumers`.
- Result: passed; tarball inspection reported 8 expected entries, no source maps, and packed ESM, CJS, default TypeScript, and minimum-upstream TypeScript consumers passed smoke/type checks with `skipLibCheck: false`.
- Extra verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Follow-up: none for PACK-02.

### Task TEST-01: Add Typed Admin-Client Test Seams

Status: completed

Priority: P2

Suggested agent: test architecture specialist

Dependencies: OWN-02, HANDLE-03

Primary ownership:

- package-owned narrow admin-client interfaces or test builders
- `src/index.ts` constructor/factory seam if needed
- `tests/test-utils.ts`
- highest-risk `tests/implementation-*.spec.ts` files

Finding:

Implementation tests contain well over one hundred `as any` casts for partial admin-client mocks. Root authentication tests also intercept a deep-imported module because the root class always constructs its own concrete client and directly calls the upstream token helper. Source and tests typecheck, but these casts suppress method-name and request-shape drift at the exact boundary the tests aim to protect.

References:

- `src/index.ts:1-2`
- `src/index.ts:63-68`
- `src/index.ts:95-105`
- `tests/implementation-index.spec.ts:2-11`
- `tests/implementation-client.spec.ts:7-11`
- `tests/implementation-workflow.spec.ts:10`
- `tests/implementation-regressions.spec.ts`
- `tsconfig.test.json:1-9`

Implementation requirements:

1. Define narrow package-owned capabilities or typed mock builders for tested resource groups instead of implementing the entire upstream client.
2. Add an injection seam for the admin client and token acquisition without changing ordinary consumer construction.
3. Convert the highest-risk suites first: retry/mutations, ownership, rebinding, user provisioning, root auth, workflows, and clients.
4. Use `satisfies`, `Pick`, and exact argument assertions so upstream signature drift becomes a compile failure.
5. Do not combine this with behavior refactors; migrate incrementally after the owning behavior tasks settle.

Acceptance criteria:

- Priority suites contain no broad `as any` cast for the core under test.
- A deliberate upstream method-name or request-shape mismatch fails `pnpm typecheck:tests`.
- Root auth behavior can be tested without module-level interception of an upstream deep path.
- Existing runtime assertions remain intact.
- `pnpm typecheck:tests` and `pnpm test:unit` pass.

Completion evidence:

- Changed: `src/index.ts`, `tests/test-utils.ts`, `tests/implementation-index.spec.ts`, `tests/implementation-client.spec.ts`, `tests/implementation-workflow.spec.ts`, `tests/implementation-role-ownership.spec.ts`, `tests/implementation-handle-rebinding.spec.ts`, `tests/implementation-user-password-provisioning.spec.ts`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Implementation: `KeycloakAdminClientFluent` keeps ordinary `new KeycloakAdminClientFluent(connectionConfig)` construction unchanged while accepting optional injected admin-client and token-acquisition seams for tests. Root auth tests now inject a typed token acquirer instead of module-level interception of `@keycloak/keycloak-admin-client/lib/utils/auth`.
- Test architecture: added package-owned `createMockAdminClient()` and `MockAdminResource` helpers based on upstream `KeycloakAdminClient` resource keys and `Pick`. Priority implementation suites for retry/mutations, ownership, rebinding, user provisioning, root auth, workflows, and clients now construct admin-client cores through the typed builder instead of broad local `as any` casts; request/input literals use `satisfies` where narrow upstream representation shapes are under test.
- Scan: `tests/implementation-{client,workflow,role-ownership,handle-rebinding,user-password-provisioning,index,retry}.spec.ts` contain no `as any` occurrences.
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 288 tests.
- Follow-up: remaining lower-priority implementation suites outside TEST-01's priority set still contain legacy broad casts and can be migrated incrementally with the new helpers.

### Task DOC-01: Reconcile Version, Security, And Development Documentation

Status: completed

Priority: P2

Suggested agent: documentation and release-contract maintainer

Dependencies: API-02, RELEASE-02, PACK-02

Primary ownership:

- `README.md`
- `website/docs/**/*.mdx`
- related plan correction notes
- documentation validation scripts if introduced

Finding:

Documentation has current-source contradictions. README declares admin-client `^26.4.7` while `package.json` declares `^26.5.7`; the first development snippet runs the full integration suite before starting the sandbox; `UserInputData` omits `passwordTemporary`; and README claims `setup-sandbox` downloads and checksum-verifies Docker Compose even though the current action delegates tool installation to `setup-tools` and has no checksum input. The earlier task evidence also cites checksum behavior and action inputs no longer present in the checked-in file.

References:

- `README.md:65-75`
- `README.md:389-456`
- `package.json:95-98`
- `.github/actions/setup-sandbox/action.yml:1-20`
- `.github/actions/setup-tools/action.yml:7-13`
- `.tool-versions:1-5`
- `website/docs/api/user.mdx:276-284`
- `src/user.ts:41-45`
- related plan `CI-01` completion evidence

Implementation requirements:

1. Align supported dependency and Keycloak server versions with package metadata and the tested matrix.
2. Separate sandbox-free local checks from sandbox-dependent integration commands.
3. Correct public type snippets or generate/check them from source.
4. Describe the actual tool-integrity model. Do not claim checksum verification unless the repository enforces it.
5. Add a dated correction note to historical task evidence rather than deleting the historical record.
6. Add lightweight checks for version strings and critical public snippets where practical.

Acceptance criteria:

- README version claims match `package.json` and the CI test matrix.
- A new contributor can run unit checks before starting Docker and receives explicit sandbox instructions for integration.
- `UserInputData` documentation includes `passwordTemporary` and matches the public import path chosen by API-02.
- Supply-chain claims match checked-in workflow/action behavior.
- Documentation build and any link/snippet checks pass.

Completion evidence:

- Changed: `README.md`, `website/docs/api/keycloak-admin-client-fluent.mdx`, `website/docs/api/user.mdx`, `package.json`, `scripts/check-docs.mjs`, `docs/tasks/20260813-141755-codebase-health-remediation.md`, `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Version policy: public docs now align with `package.json` dependency range `@keycloak/keycloak-admin-client@^26.5.7`, packed-consumer minimum check `26.5.7`, lockfile-resolved current admin client `26.6.3`, and sandbox Keycloak server `26.6.1`.
- Local checks: README now separates sandbox-free commands (`pnpm lint:check`, `pnpm typecheck`, `pnpm typecheck:tests`, `pnpm test:unit`, `pnpm build`, `pnpm docs:check`) from sandbox-dependent `pnpm test` / `pnpm test:integration`.
- Public snippets: user API docs now show `UserInputData` imported from the root package path chosen by API-02 and include `passwordTemporary`; password provisioning error docs also use the root import path and current public fields.
- Tool-integrity model: README now describes current checked-in behavior: `.github/actions/setup-tools` delegates tool installation to a pinned action commit plus `.tool-versions`; `.github/actions/setup-sandbox` starts/waits/runs/tears down the sandbox; Docker Compose checksum verification is not claimed because the repository does not enforce it. The historical CI-01 evidence has a dated DOC-01 correction note instead of deleting the original record.
- Added check: `pnpm docs:check` validates version strings, sandbox/checksum wording, root import snippets, and `UserInputData.passwordTemporary` against source/package metadata.
- Verified: `pnpm docs:check`.
- Result: passed (`Documentation checks passed.`).
- Verified: `pnpm build` in `website/`.
- Result: passed; Docusaurus generated static files in `website/build`.
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`).
- Sandbox-dependent integration commands were not run for DOC-01 because this task changed documentation/checks only and live integration requires the Docker/Keycloak sandbox.
- Follow-up: none for DOC-01.

## Deferred Improvement Candidates

These should become separate tasks only after measurement or a maintainer contract decision:

- Server-side search: `KeycloakAdminClientFluent.searchRealms()`, `ClientHandle.searchRoles()`, `RealmHandle.searchClientScopes()`, `searchIdentityProviders()`, and `searchAuthenticationFlows()` load complete collections and filter locally. Owner: pagination/API maintainer. Rationale: first verify which installed and minimum-supported Keycloak endpoints expose search/pagination before changing semantics. Residual risk: large collections can cost extra client memory/time but correctness is preserved by existing bounded all-results helpers where those APIs are used (`src/index.ts:130-142`, `src/clients/client.ts:307-321`, `src/realm.ts:466-477`, `src/realm.ts:629-640`, `src/realm.ts:683-693`).
- Mutation return contracts: organization member and IdP mutations perform a follow-up list request and may return only one page. Owner: public API maintainer. Rationale: decide whether mutation methods should return `this`/`void`, the affected representation, or an explicit page before changing public behavior. Residual risk: callers may observe partial list-style return data from those specific methods; mutation side effects themselves remain covered by ownership and retry safeguards (`src/organization.ts:287-314`, `src/organization.ts:356-383`).
- Error taxonomy: most not-found and ambiguity conditions remain generic `Error` while a few resources expose typed errors. Owner: public API maintainer. Rationale: define a package-wide discriminated error contract before adding more classes. Residual risk: catch-by-type coverage remains uneven, but documented catchable errors are root-exported and snapshot-tested.
- Bundle size: the root bundle is approximately 203 KB ESM and 219 KB CJS unminified. Owner: release/performance maintainer. Rationale: measure consumer tree-shaking and cold-start impact before adding subpaths or changing externalization. Residual risk: root-only consumers continue to install a single bundle until measurements justify a package-shape change.
- Live coverage: cache, client policies, server info, and who-am-I still merit focused integration tests once the release gate can run them reliably. Owner: integration-test maintainer. Rationale: prioritize the higher-risk live paths first in this wave. Residual risk: these lower-risk areas rely on unit coverage plus the release gate until focused live scenarios are added.

## Parallelization Guidance

| Agent | Recommended tasks      | Sequencing                                                            |
| ----- | ---------------------- | --------------------------------------------------------------------- |
| A     | RETRY-02, then IDP-01  | RETRY-02 owns retry semantics first; IDP-01 is otherwise isolated.    |
| B     | USER-02, then AUTH-01  | Shared credential/error policy; starts after RETRY-02.                |
| C     | OWN-02, then HANDLE-03 | Both touch handle identity; run sequentially.                         |
| D     | PAGE-02, then PAGE-03  | Shared pagination contract; run sequentially after RETRY-02.          |
| E     | API-02, then PACK-02   | Blocked until the maintainer records package-shape choice.            |
| F     | RELEASE-02             | May design early, but final verification follows Wave 1 and PAGE-02.  |
| G     | TEST-01                | Starts after ownership/rebinding behavior stabilizes.                 |
| H     | DOC-01                 | Runs after public API, release, and packed-consumer contracts settle. |
| I     | REVIEW-02              | Independent final reviewer; runs last.                                |

Shared hotspots:

- `src/user.ts`: USER-02 owns provisioning first; OWN-02 and PAGE-02 must re-read and limit changes to cross-handle and pagination methods.
- `src/utils/retry.ts`: RETRY-02 owns policy; PAGE-02 consumes the resulting read-only API but should not redesign it.
- Handle classes: OWN-02 precedes HANDLE-03 so ownership checks use the final live identity contract.
- `src/index.ts`: AUTH-01 owns auth behavior; API-02 owns exports; TEST-01 owns injection seams. Apply in that order.
- `package.json`, `src/index.ts`, `tsup.config.ts`, and pack scripts: API-02 and PACK-02 run serially.
- `.github/workflows/*`: RELEASE-02 owns behavior; DOC-01 only updates prose afterward.
- `dist/` and `.packed-consumers/`: never hand-edit and never run build/pack tasks concurrently in one worktree.

## Deferred Decisions And Maintained Risks

1. Public package shape: resolved by API-02 as root-only named exports from `@egose/keycloak-fluent`; no supported subpaths. Owner: public API maintainer. Rationale: one root entry point keeps the compatibility commitment smaller while making documented errors/types importable. Residual risk: consumers that deep-import implementation modules remain unsupported; packed ESM/CJS/declaration snapshots gate the chosen surface.
2. Mutation return convention: still deferred for organization member and IdP helper cleanups only. Owner: public API maintainer. Rationale: changing `this`/`void` vs. representation vs. page/list returns is an observable API contract decision outside this safety wave. Residual risk: those methods may keep returning page-shaped follow-up data until a future contract task resolves it; retry and ownership safety are not deferred.
3. Supported-version policy: resolved by API-02/DOC-01 as Keycloak Admin Client `26.x` from `26.5.7` upward, tested at the pinned minimum and current lockfile-resolved version, with a Keycloak `26.6.1` sandbox. Owner: release maintainer. Rationale: this matches package metadata and available compatibility checks without overclaiming older/newer server behavior. Residual risk: significantly older or newer Keycloak endpoints can drift and require consumer-specific verification.

## Wave 4: Independent Integration Review

### Task REVIEW-02: Verify Runtime Boundaries And Release Artifact Independently

Status: completed

Priority: P0

Suggested agent: independent senior reviewer who implemented none of the tasks above

Dependencies: all accepted tasks above; blocked tasks must have an explicit maintained-risk decision

Primary ownership:

- read-only review across the repository
- completion evidence and status updates in this task file

Finding:

The plan changes cross-cutting retry, pagination, ownership, cache identity, credential-error, public API, test, and release boundaries. Isolated task tests are insufficient because alternate entry paths and the packed artifact can disagree.

Implementation requirements:

1. Verify every acceptance criterion against current runtime behavior and record exact evidence.
2. Probe all mutation paths for replay after ambiguous 429/502/503/504 responses.
3. Probe alternate cross-core, cross-realm, wrong-parent, and stale-cache paths.
4. Verify collection traversal under server caps, repeated pages, cancellation, and bounds.
5. Inspect complete public error graphs for passwords, secrets, refresh tokens, and unbounded response bodies.
6. Compare documentation, root/subpath exports, declarations, ESM, CJS, and installed tarball behavior.
7. Run package and live integration checks serially and preserve logs for failures.
8. Confirm every deferred item states an owner, rationale, and residual risk.

Acceptance criteria:

- `pnpm lint:check`, `pnpm typecheck`, `pnpm typecheck:tests`, and `pnpm test:unit` pass.
- A digest-pinned sandbox run of `pnpm test:integration` passes and always tears down.
- `pnpm build`, `pnpm pack:inspect`, `pnpm pack:consumers`, and `pnpm publish:check` pass from clean generated output.
- No mutation is implicitly replayed without documented endpoint-level safety.
- No cross-owner or stale descendant handle can route a request using foreign identity.
- No all-results API silently truncates under the tested server-cap scenarios.
- Public errors satisfy the credential-redaction and bounded-output contracts.
- Published runtime exports, declarations, docs, and compatibility matrix agree.
- No unresolved P0 or P1 finding remains without explicit maintainer acceptance.

Completion evidence:

- Changed: `docs/tasks/20260823-114944-codebase-health-follow-up.md`.
- Earlier-task status review: all accepted tasks in this follow-up file are `completed`. Prior local integration blockers in OWN-02, IDP-01, HANDLE-03, RELEASE-02, and DOC-01 are maintained-risk evidence only; REVIEW-02 reran the full sandbox workflow successfully after applying the same readiness gate used by `.github/actions/setup-sandbox`.
- Runtime boundary review: inspected retry, pagination, ownership, handle-identity, credential-redaction, public-export, pack-consumer, release-workflow, and documentation code/tests. No unresolved P0/P1 issue was found. Mutation replay remains opt-in (`retryTransientAdminError` defaults non-idempotent; only cache clearing has `idempotent: true` with test coverage). Cross-owner operations use shared ownership guards before handle resolution/network access. Parent/child identity generation invalidates descendant caches on rebind. Buffered/streamed all-results traversal is bounded, cancellable, and tested against server caps/repeated pages. Password/authentication public error graphs are sanitized and bounded. Root runtime/declaration exports are snapshot-tested through installed packed consumers.
- Deferred decisions review: updated deferred candidates and decisions so each has owner, rationale, and residual risk. Public package shape and supported-version policy are recorded as resolved; mutation return convention remains a maintained lower-priority API decision.
- Verified: `pnpm lint:check`.
- Result: passed (`eslint .`, no diagnostics).
- Verified: `pnpm typecheck`.
- Result: passed (`tsc --noEmit`, no diagnostics).
- Verified: `pnpm typecheck:tests`.
- Result: passed (`tsc --noEmit --project tsconfig.test.json`, no diagnostics).
- Verified: `pnpm test:unit`.
- Result: passed, 17 test files and 288 tests.
- Verified: `pnpm build`.
- Result: passed; ESM, CJS, and declarations emitted to `dist/`.
- Verified: `pnpm pack:inspect`.
- Result: passed; tarball `egose-keycloak-fluent-0.13.1.tgz` contains 8 intended entries and no source maps.
- Verified: `pnpm pack:consumers`.
- Result: passed; packed ESM, CJS, default TypeScript, and minimum-upstream TypeScript consumers passed smoke/type checks with `skipLibCheck: false`.
- Verified: `pnpm publish:check`.
- Result: passed (`lint:check`, `typecheck`, `typecheck:tests`, `test:unit`, `build`, `pack:inspect`, and `pack:consumers`).
- Sandbox verification: `docker --version` reported Docker `29.7.2`; `make DAEMON=true up` built/started the digest-pinned Keycloak `26.6.1` sandbox. An immediate `pnpm test:integration` failed during initial `simpleAuth()` with `UND_ERR_SOCKET` because the plain make target does not wait for Keycloak readiness. The CI gate uses `wait-on http-get://localhost:8080/realms/master/.well-known/openid-configuration --timeout 240000`; after running that same readiness check locally, `pnpm test:integration` passed with 25 test files and 26 tests. `make down` then removed the Keycloak/Postgres containers and `docker-compose ... ps` showed no running services.
- Extra verified: `pnpm docs:check`.
- Result: passed (`Documentation checks passed.`).
- Extra verified: `pnpm release:workflow:check`.
- Result: passed (`Release workflow verification passed.`).
- Residual risks: no unresolved P0/P1 findings remain. Lower-priority maintained risks are the documented server-side search optimization, organization/IdP mutation return-contract decision, package-wide error taxonomy decision, bundle-size measurement, and additional focused live coverage for cache/client-policies/server-info/who-am-I.

## Definition Of Done

- Every accepted task is `completed` with changed files, verification commands, and observed results recorded as completion evidence.
- Mutation retries are opt-in and justified; read retries remain bounded, cancellable, and structured.
- Cross-handle operations enforce live core, realm, kind, and parent ownership before network access.
- Parent rebinding cannot leave descendants routed through stale realm, parent, or resource IDs.
- Buffered and streaming collection APIs are validated, bounded, cancellable, and correct under server-side caps.
- Password and authentication errors do not disclose credentials or unbounded server responses.
- User provisioning reports actual persisted state for password, cleanup, and enable failures.
- The public API is intentionally importable, documented, snapshot-tested, and compatible with the declared upstream range.
- Publication is blocked unless source/test typechecks, unit tests, live integration tests, artifact checks, and packed-consumer checks pass for the tagged commit.
- Documentation matches package metadata, source types, and current CI behavior.
- REVIEW-02 is completed independently and records all verification evidence.
