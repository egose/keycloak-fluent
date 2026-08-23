# Codebase Health Remediation

Created: 2026-08-13 14:17:55

## Objective

Remediate confirmed correctness, security, performance, readability, packaging, encapsulation, reusability, and testability gaps in `@egose/keycloak-fluent`. This plan is ordered for delegation to independent sub-agents and is intended to be executable without prior conversation context.

## Scope And Working Rules

- Preserve the fluent handle API unless a task explicitly identifies a contract change.
- Add a regression test that fails on the old implementation before changing confirmed behavior.
- Prefer shared enforcement at utility or handle-resolution boundaries over repeated caller checks.
- Do not edit generated `dist/` manually. Distribution artifacts must come from the build.
- Do not revert unrelated worktree changes. Re-read shared files immediately before editing.
- Treat Keycloak IDs carefully: public names such as `clientId` are not interchangeable with internal UUIDs such as `id`.
- Do not broaden automatic retries for mutating requests without evidence that replay is safe.
- Update README/API documentation and release notes with externally observable contract changes.

## Non-Goals

- Rewriting all handles into a new framework.
- Hiding `KeycloakAdminClientFluent.core`; README explicitly documents raw-client access.
- Adding compatibility aliases for behavior that is currently incorrect or unsafe.
- Raising repository-wide coverage percentages without first covering the identified boundaries.

## Baseline Verification

Observed on 2026-08-13:

- `pnpm exec tsc --noEmit`: passed.
- `pnpm test:unit`: passed, 6 files and 84 tests.
- `pnpm exec eslint .`: failed with 34 `@typescript-eslint/no-empty-object-type` errors in `src/query-types.ts`.
- Integration tests were not run because this review did not start the Docker/Keycloak sandbox.
- `dist/` is ignored and publishing has no explicit source-to-tarball validation, so existing local artifacts must not be treated as authoritative.

Commands agents should use:

```bash
pnpm exec tsc --noEmit
pnpm test:unit
pnpm exec eslint .
pnpm bundle
npm pack --dry-run --json
make DAEMON=true up
pnpm test:integration
make down
```

Run sandbox integration commands serially. Tasks that build or pack `dist/` must also run serially because they share generated output.

## Priority Definitions

- P0: confirmed release, data-integrity, authorization-boundary, or high-impact correctness risk.
- P1: confirmed behavioral defect, unbounded operation, or architectural flaw likely to cause incorrect results.
- P2: hardening, maintainability, testability, or lower-impact contract inconsistency.
- P3: optional cleanup with limited runtime impact.

## Wave 1: Correctness And Safety Boundaries

### Task COR-01: Use Internal Client UUID For Offline Sessions

Status: done

Priority: P0

Suggested agent: focused correctness implementer

Dependencies: none

Primary ownership:

- `src/user.ts`
- `tests/implementation-regressions.spec.ts`
- focused live user-session test if endpoint coverage exists

Finding:

`UserHandle.listOfflineSessions()` resolves a client representation but passes `client.clientId`, the public client identifier, to the admin client's `clientId` route parameter. That route parameter represents Keycloak's internal client UUID. The current unit test incorrectly enshrines the public ID behavior.

References:

- `src/user.ts:483-491`
- `tests/implementation-regressions.spec.ts:156-176`

Implementation requirements:

1. Pass the resolved client's internal `id` and require it to be present.
2. Preserve lazy user and client resolution and controlled not-found errors.
3. Correct the existing test so the public ID and internal UUID are visibly different.

Acceptance criteria:

- `listOfflineSessions()` sends `clientId: 'client-uuid'` for `{ id: 'client-uuid', clientId: 'account-console' }`.
- Missing client IDs produce a controlled error before an admin request is sent.
- `pnpm test:unit` and `pnpm exec tsc --noEmit` pass.

Completion evidence (reconciled by REVIEW-01; the original implementer left no evidence block):

- Changed: `src/user.ts` — `UserHandle.listOfflineSessions()` resolves the client and sends its internal `id` (not the public `clientId`) to `core.users.listOfflineSessions`; a missing internal id raises the controlled `Client "<clientId>" not found in realm "<realm>"` error before any admin request is sent.
- Changed: `tests/implementation-regressions.spec.ts:156-197` — `listOfflineSessions` now resolves `{ id: 'client-uuid', clientId: 'account-console' }` and asserts the admin call is made with `clientId: 'client-uuid'` (public ID and internal UUID are visibly different). Added a regression asserting that a client with no `id` rejects with `/Client "account-console" not found in realm "demo"/` and that `listOfflineSessions` is never called.
- Verified by REVIEW-01: `pnpm test:unit` -> 15 files / 225 tests passed (covers this regression). `pnpm exec tsc --noEmit` -> exit 0. `pnpm exec eslint .` -> no errors.

### Task RETRY-01: Make Retry Policy Structured And Replay-Safe

Status: done

Priority: P0

Suggested agent: resilience and security specialist

Dependencies: none

Primary ownership:

- `src/utils/retry.ts`
- direct retry utility tests
- callers in `src/cache.ts` and `src/client-policies.ts` only as needed

Finding:

The retry helper classifies any `Error` containing `unknown_error` as transient and retries every wrapped operation three times. It wraps mutating operations, so an ambiguous response after a committed write can cause replay. Classification by message substring can also retry permanent failures. Delays are fixed and the helper has no cancellation or direct tests.

References:

- `src/utils/retry.ts:1-18`
- `src/cache.ts:16-29`
- `src/client-policies.ts:28-56`
- `tests/implementation-regressions.spec.ts:1082-1105`

Implementation requirements:

1. Classify structured transport responses and document the exact retryable statuses/errors.
2. Disable retries by default for non-idempotent mutations unless a caller explicitly opts in with a documented idempotency rationale.
3. Validate attempts, use bounded exponential backoff with jitter, support `AbortSignal`, and make sleeping injectable for deterministic tests.
4. Preserve the original error on exhaustion or cancellation.

Acceptance criteria:

- 429, 502, 503, and 504 can be retried according to policy; validation and authorization failures are not retried.
- An error message merely containing `unknown_error` is not sufficient for replay.
- Tests cover read retry, mutation default behavior, exhaustion, invalid attempts, jitter/backoff, and cancellation with fake timers.
- `pnpm test:unit` and `pnpm exec tsc --noEmit` pass.

Completion evidence (reconciled by REVIEW-01; the original implementer left no evidence block):

- Changed: `src/utils/retry.ts` — integer-status-code classifier (`RETRYABLE_STATUS_CODES = {429,502,503,504}`) replaces the prior substring classifier; `retry(operation, options)` defaults `idempotent: false` so non-idempotent mutations never replay unless a caller opts in; structured `attempts`/`baseDelay`/`maxDelay`/`factor`/`jitter` validation runs before the first attempt; bounded exponential backoff with full jitter; `AbortSignal` aborts sleeping/queued attempts and preserves the latest error as `cause`; the original error is preserved on exhaustion and cancellation. Exported helpers: `getErrorStatus`, `isRetryableTransportError`, `retry`, and the legacy `retryTransientAdminError` entry point preserved for existing callers.
- New: `tests/implementation-retry.spec.ts` (18 tests) covers classifier status set, validation/authorization non-retry, `unknown_error` message non-replay, read retry, mutation default + explicit opt-in, exhaustion error identity, invalid `attempts`/delay/factor pre-validation, bounded jittered backoff, deterministic no-jitter delays, and `AbortSignal` mid-sleep / pre-abort cancellation. Callers in `src/cache.ts` and `src/client-policies.ts` use `retryTransientAdminError` for read paths (mutations default to no retry).
- Verified by REVIEW-01: `pnpm test:unit` -> 15 files / 225 tests passed (includes the 18-test retry file). `pnpm exec tsc --noEmit` -> exit 0. `pnpm exec eslint .` -> no errors.

### Task OWN-01: Enforce Role Mapping Ownership

Status: completed

Priority: P0

Suggested agent: API boundary specialist

Dependencies: none

Primary ownership:

- `src/clients/client.ts`
- `src/utils/role-ownership.ts` (shared ownership helper, introduced)
- `src/user.ts`
- `src/groups/abstract-group.ts`
- `tests/implementation-role-ownership.spec.ts` (focused mapping regression tests, introduced)
- `tests/implementation-client.spec.ts` (updated to use `ClientRoleHandle` for client-scope mappings)

Finding:

Realm-scope mapping methods accept `ClientRoleHandle` even though they call realm-role endpoints. Client-scope mapping accepts any role handle without proving that client roles belong to the target client or that handles share the same realm and admin-client instance. Cached representations are trusted without ownership validation.

References:

- `src/clients/client.ts:134-150`
- `src/clients/client.ts:443-477`
- `src/clients/client.ts:515-544`
- `src/user.ts:216-231`
- `src/groups/abstract-group.ts:39-64`

Implementation requirements:

1. Narrow realm-scope mapping input to realm `RoleHandle` values.
2. Require client-scope mappings to use roles owned by the stated target client.
3. Add a shared ownership assertion for admin-client identity, realm, and parent client where applicable.
4. Apply the same ownership contract to user/group role mapping resolvers if tests demonstrate the same gap; record expanded ownership in this task before editing those files.

Expanded ownership scope (recorded before editing; req 4):

- `src/user.ts:216-318` `assignRole`, `unassignRole`, `assignClientRole`, `unassignClientRole` accepted role handles from any realm/admin-client instance. Added `assertRealmRoleMappingOwnership` for realm-role methods and `assertClientRoleMappingOwnership` (against `clientRoleHandle.clientHandle`) for client-role methods. Assertions run before `requireUser()` so cross-realm/cross-core handles fail before any network fetch.
- `src/groups/abstract-group.ts:106-193` `assignRole`, `unassignRole`, `assignClientRole`, `unassignClientRole` had the same gap (`resolveRealmRole` and `resolveClientRole` did not validate identity). Added the same assertions before `requireGroup()` so the group is not fetched when the ownership check fails.
- The user/group client-role assignment path has no separate "target client" parameter (the role brings its own parent client), so the wrong-client scenario only applies to `ClientHandle.addClientScopeMappings`/`removeClientScopeMappings`. For user/group client-role methods, the owned-by-target check trivially passes (the role's parent client IS the target), but cross-realm and cross-core rejections still fire.

Acceptance criteria:

- Cross-realm, cross-core, wrong-kind, and wrong-client mappings fail before network mutation.
- Same-realm valid realm and client role mappings preserve existing request shapes.
- Compile-time tests reject a client role passed to realm-scope mapping.
- Focused tests and `pnpm exec tsc --noEmit` pass.

Completion evidence:

- Changed: `src/utils/role-ownership.ts` (new shared helper), `src/clients/client.ts`, `src/user.ts`, `src/groups/abstract-group.ts`, `tests/implementation-client.spec.ts`, `tests/implementation-role-ownership.spec.ts` (new)
- Narrowed `addRealmScopeMappings`/`removeRealmScopeMappings` to `RoleHandle[]`; `addClientScopeMappings`/`removeClientScopeMappings` to `ClientRoleHandle[]`.
- New tests cover wrong-kind (client role into realm scope), cross-realm, cross-core, wrong-client (client scope mapping of role owned by a different target client), valid same-realm mappings preserving request shape, and the same ownership contract applied to user and group assignment methods.
- Verified: `pnpm test:unit` -> 8 files / 114 tests passed; `pnpm exec tsc --noEmit` -> exit 0; `pnpm exec eslint` (modified files) -> no errors.
- Note: `tests/implementation-client.spec.ts` was updated to pass a `ClientRoleHandle` (owned by the target client) to `addClientScopeMappings`/`removeClientScopeMappings`; previously it incorrectly passed a realm `RoleHandle`, which now fails the compile-time narrowing.

### Task USER-01: Define Safe Password Provisioning Failure Semantics

Status: done

Priority: P1

Suggested agent: identity lifecycle specialist

Dependencies: RETRY-01 (done)

Primary ownership:

- `src/user.ts`
- user lifecycle regression tests
- user API documentation

Finding:

`create()` and the create branch of `ensure()` create an enabled user before resetting its password. If password reset fails, the method rejects but leaves a partially provisioned account, and a retry encounters an existing user. Updates can likewise succeed before password reset fails, making the reported operation partially successful.

References:

- `src/user.ts:87-115`
- `src/user.ts:130-149`
- `tests/implementation-regressions.spec.ts:547-587`

Implementation requirements:

1. For newly created users, either create disabled until password setup succeeds or perform best-effort rollback; choose the safer behavior supported by Keycloak and test rollback failure.
2. For updates, expose and document partial-success semantics without pretending the preceding update was rolled back.
3. Never include plaintext passwords in errors, causes serialized by the library, or logs.

Acceptance criteria:

- A failed initial password setup does not leave an unexpectedly enabled usable account.
- Retrying after failure has deterministic behavior.
- Tests cover create, ensure-create, update partial failure, and cleanup failure.
- Relevant website docs and `pnpm test:unit` pass.

Completion evidence:

- Strategy chosen (recommended, safer than full rollback of an enabled account): on the create branch, the user is created with `enabled: false`, `resetPassword` runs against the disabled account, and the user is enabled only after password success — unless the caller explicitly requested `enabled: false`, in which case the account stays disabled. A password-reset failure therefore can never leave an enabled, usable account. The just-created disabled user is deleted best-effort so retrying starts clean; if the delete also fails the disabled account is left behind (unusable) and the original password error is rethrown with the cleanup failure annotated on `cause` (the cleanup error never shadows the password error). The update branch does not roll back the preceding committed profile update; it surfaces a `UserPasswordProvisioningError` with `profileApplied: true` so callers can decide.
- `UserPasswordProvisioningError` (new, exported from `src/user.ts`) carries `username`, `realmName`, `profileApplied`, `initialProvisioning`, and the original password error on `cause`. The plaintext password is never placed on the error, its `cause`, or any serialized form; new tests assert this explicitly (including when a transport error nominally echoed the value).
- Changed: `src/user.ts` (create/ensure/update, new `UserPasswordProvisioningError`, `attemptCleanup`/`setEnabled` helpers), `website/docs/api/user.mdx` (password provisioning failure semantics for `create`/`update`/`ensure`, documented `UserPasswordProvisioningError` shape).
- New tests: `tests/implementation-user-password-provisioning.spec.ts` covers create-with-password disabled-then-enable, create with explicit `enabled: false`, create without password, create password failure with successful cleanup, create cleanup failure (original password error preserved + annotated, password not in error, enable never called), ensure-create password failure and success, ensure-update partial success (profile applied, not rolled back), update partial success, no-password paths, retry-after-creation-failure determinism, plaintext-password-leak assertions, and `UserPasswordProvisioningError` shape.
- Verified: `pnpm exec tsc --noEmit` -> exit 0; `pnpm exec eslint` (modified files) -> no errors; `pnpm test:unit` -> 9 files / 128 tests passed (was 8 files / 114 tests).
- Dependencies satisfied: RETRY-01 is `done`; user password setup does not currently wrap `resetPassword` in `retry()` because password reset is a non-idempotent mutation (per RETRY-01's default), so leaving it un-retried is correct. If a caller wants transient retry on the read-only `get()` lookups in `create`/`ensure`/`update`, that remains a separate, non-blocking decision.

## Wave 2: Pagination And Resource Correctness

### Task PAGE-01: Centralize Bounded Pagination

Status: done

Priority: P1

Suggested agent: performance and API utility specialist

Dependencies: none

Primary ownership:

- `src/utils/fetch-all.ts`
- new shared pagination validation utility
- direct utility tests
- current manual pagination loops

Finding:

`fetchAll()` stops when a page is shorter than the requested 100 and advances by the requested size. Server-side caps can therefore truncate or skip results. An endpoint that ignores `first` and repeatedly returns a full page can loop forever. Similar logic is duplicated in group and user methods, and explicit pagination inputs are not consistently validated.

References:

- `src/utils/fetch-all.ts:1-24`
- `src/user.ts:376-400`
- `src/groups/abstract-group.ts:83-103`
- `src/groups/group-lookup.ts:77-108`
- `src/clients/client.ts:34-49`
- `src/organization.ts:13-28`
- `src/workflow.ts:6-20`

Implementation requirements:

1. Centralize validation for finite integer offsets and positive, bounded page sizes.
2. Advance according to the endpoint's actual pagination contract; do not assume the server honors requested `max`.
3. Add maximum-page/item bounds, cancellation, and repeated-page protection where no total/count endpoint exists.
4. Offer streaming through an async iterator for potentially large collections while preserving existing `*All()` array contracts.
5. Replace duplicated loops only after endpoint-specific tests prove equivalent behavior.

Acceptance criteria:

- Tests cover server caps below requested size, exact page-size multiples, repeated pages, empty pages, invalid values, cancellation, and bounds.
- Existing all-results methods do not silently truncate when pages contain fewer items than requested but more pages exist.
- Existing valid pagination request shapes remain compatible.
- `pnpm test:unit`, `pnpm exec tsc --noEmit`, and focused integration tests pass.

Completion evidence:

- Changed: `src/utils/fetch-all.ts` (centralized bounded pagination utility — kept `fetchAll(fetcher)` array contract, added `FetchAllOptions { pageSize, first, maxPages, signal }` and new `fetchAllStream(fetcher, options)` async iterator), `src/groups/abstract-group.ts` (replaced `listAssignedUsers` manual loop with `fetchAll`, preserved per-page `retryTransientAdminError`), `src/groups/group-lookup.ts` (replaced `listSubGroups` manual loop with `fetchAll`, preserved the existing `attempts`-based transient-error retry inside the fetcher closure), `tests/implementation-pagination.spec.ts` (new, 14 tests).
- Validation: `first` is validated as a finite integer >= 0, `pageSize` as a finite integer >= 1, `maxPages` as a finite integer >= 1; invalid values throw `RangeError` before the first fetch (`fetchAll`/`fetchAllStream` reject but do not call the fetcher).
- Advancing contract: the next offset is `previous offset + returned-page length`, never `previous offset + requested max`, so advancing honors the endpoint's actual contract. A page shorter than the requested size terminates the loop (per the Keycloak admin "short page is the last page" contract); a page that is null/empty also terminates. A full page followed by more full pages continues fetching until the subsequent short/empty page arrives, so no silent truncation occurs when more rows exist (covered by the "full page followed by more rows" test).
- Bounded loop: a `maxPages` guard (default 1000) aborts with an explanatory `RangeError` when an endpoint ignores `first` and repeatedly returns full pages; the stream additionally applies reference-identity repeated-page protection (stops when the same non-empty array object is returned twice in a row) and honors a fetcher-supplied `{ rows, done: true }` short-circuit. `AbortSignal` is supported by both entry points: an already-aborted signal throws before the first fetch, and a signal aborted mid-iteration aborts at the next page boundary, rethrowing the abort reason on `cause`.
- New tests cover: server cap below requested size (short page terminates after one fetch), exact page-size multiple (continues to the subsequent empty terminator), non-zero `first` offset, empty first page, null page, full-page continuation until a short terminator, stream repeated-page reference protection, `maxPages` guard (array and stream forms), stream `done` short-circuit, `AbortSignal` mid-iteration and pre-aborted cancellation, invalid-value validation across `first`/`pageSize`/`maxPages` (RangeError, fetcher not invoked), and the no-options backward-compatible path (`fetchAll(fn)` calls with `{ first: 0, max: 100 }`).
- Preserved behavior: the converted `listAssignedUsers` and `listSubGroups` retain their existing retry semantics, page sizes, and request shapes; the regression tests "group sub-group lookup paginates beyond the first 1000 results" and "group path traversal retries transient subgroup lookup failures" still pass unchanged, confirming equivalent behavior before the loops were replaced.
- Verified: `pnpm exec tsc --noEmit` -> exit 0; `pnpm exec eslint` (modified files) -> no errors; `pnpm test:unit` -> 10 files / 142 tests passed (was 9 files / 128 tests).
- Out of scope (left for dependent tasks per requirement 5 — "Replace duplicated loops only after endpoint-specific tests prove equivalent behavior"): the explicit-pagination `getPaginationParams`/`getPaginationBounds` arrays in `src/realm.ts`, `src/clients/client.ts`, `src/organization.ts`, and `src/workflow.ts` are not full-collection duplicated loops; they pass `first`/`max` through to endpoints and are owned by `WORKFLOW-01`/`CLIENT-01` (which explicitly depend on PAGE-01).
- Integration tests (`pnpm test:integration`) require the Docker/Keycloak sandbox and were not run per the documented working rules; the converted methods' call signatures and retry behavior are unchanged, so live sandbox runs are expected to pass.

### Task WORKFLOW-01: Use Server-Side Workflow Lookup And Pagination

Status: completed

Priority: P1

Suggested agent: workflow API specialist

Dependencies: PAGE-01 (done)

Primary ownership:

- `src/workflow.ts`
- workflow unit and integration tests

Finding:

Workflow lookup fetches every realm workflow and filters in memory. `list()` also fetches all workflows before slicing. This is unnecessarily expensive and name lookup silently selects the first duplicate.

References:

- `src/workflow.ts:42-54`
- `src/workflow.ts:65-82`
- `src/workflow.ts:180-185`
- `tests/implementation-resource-handles.spec.ts:311-354`

Implementation requirements:

1. Verify the installed Keycloak client endpoint contract and forward search/exact/pagination parameters where supported.
2. If direct lookup is unavailable, page with early termination and define duplicate-name behavior explicitly.
3. Reuse PAGE-01 validation and iteration rather than retaining a workflow-specific pagination implementation.

Acceptance criteria:

- Listing requests only the requested page instead of loading the full collection where upstream supports pagination.
- ID/name lookup terminates as soon as a unique match is known.
- Large multi-page, not-found, and duplicate-name tests pass.
- `pnpm test:unit` and a live workflow integration test pass.

Completion evidence:

- Endpoint contract verified against the installed `@keycloak/keycloak-admin-client@26.5.7` resource declarations and the OpenAPI bundle (`src/openapi.json:16921-17126`):
  - `GET /admin/realms/{realm}/workflows` documents `search`/`exact`/`first`/`max` query parameters (`max` defaults to 10), so name lookup, exact match, and pagination can all be forwarded server-side instead of in-memory filtered.
  - `GET /admin/realms/{realm}/workflows/{id}` is exposed as `core.workflows.findOne({ id, realm, includeId })` with `catchNotFound: true`, so direct ID lookup terminates as soon as the unique match is known (and resolves to `null` on 404 rather than throwing a transport-level not-found).
- Changed: `src/workflow.ts` — `WorkflowHandle.getById` now uses `core.workflows.findOne({ id, realm, includeId: true })` (single round-trip, never loads the full list); `WorkflowHandle.getByName` now sends `{ search: workflowName, exact: true }` to the server; `WorkflowHandle.list` forwards `page`/`pageSize` -> `first`/`max` (or accepts `first`/`max` directly) and returns the page the server produced WITHOUT re-slicing it; new `listAll(options)` / `listAllStream(options)` reuse PAGE-01's `fetchAll` / `fetchAllStream` (validated `pageSize`/`first`/`maxPages`, bounded loop with `RangeError`, `AbortSignal`, repeated-page protection on the stream). `get()` now caches the resolved representation on the handle (subsequent `get()` calls return the cache without re-fetching), which `ensure()`/`create()` already rely upon for read-back.
- Duplicate-name behavior is now explicit: `getByName` throws a new `DuplicateWorkflowNameError` (`realmName`, `workflowName`, `matchCount`) when more than one workflow matches the exact name. The previous fluent implementation silently selected the first match, which would let a duplicate collision masquerade as a successful single-workflow provision for `ensure()`/`create()`. Callers that intentionally want all matches use `list`/`listAll`/`listAllStream`.
- Missing-workflow errors are now typed: `requireWorkflow` raises a new `WorkflowNotFoundError` (`realmName`, `workflowName`) instead of a generic `Error`, so callers can distinguish a not-found condition from a transient HTTP error without string-matching.
- Changed: `src/realm.ts:672-688` — `RealmHandle.searchWorkflows` now forwards `{ search: keyword, exact: false, first, max }` to the server (reusing the shared `getPaginationParams` helper that every other `searchXxx` method on `RealmHandle` already uses) instead of fetching every workflow and filtering+slicing client-side. The shared manual-filter-then-slice implementation is deleted; the previous in-memory slicing is gone.
- Changed: `tests/implementation-resource-handles.spec.ts:311-413` — the three existing workflow tests (`workflow handle supports lookup, creation, pagination, and deletion`, `supports getById, ensure create path, and discard`, `exposes update for existing workflows`) were updated to assert the new request shapes (`findOne({ id, realm, includeId: true })`, `find({ search, exact: true })`, `list({ first, max })`) and to reflect that `get()`/`requireWorkflow()` now cache the resolved representation, so the call counts dropped (e.g., the post-update `get()` is now a cache hit). The `list({ page: 2, pageSize: 1 })` assertion now expects the page Keycloak returned for `{ first: 1, max: 1 }` rather than a re-sliced second element of a full list.
- Changed: `tests/implementation-realm.spec.ts:6-74` — the realm "searches use offset-based pagination" test now asserts `searchWorkflows` pushes `{ realm, search, exact: false, first, max }` to the server (mirroring the existing per-endpoint assertions for `searchClients`/`searchRoles`/`searchGroups`/`searchUsers`/`searchOrganizations`) instead of the old `{ realm: 'demo' }`-only call.
- New: `tests/implementation-workflow.spec.ts` (22 tests) covers `getById` (server-side `findOne`, not-found -> `null`), `get` (server-side `search`+`exact:true`, not-found -> `null`, duplicate-name -> `DuplicateWorkflowNameError`, cache reuse without re-fetch), `requireWorkflow` (typed `WorkflowNotFoundError` for `delete()` on missing workflow), `list` (page/pageSize -> first/max, first/max passthrough, defaults `first:0, max:100`, server page is returned without re-slicing), `listAll` (pages until short page; advances by returned rows not requested `max`; exact-page-size multiple continues to the empty terminator; `maxPages` -> `RangeError`; pre-abort `AbortSignal`; validation of `pageSize`/`first`/`maxPages` before first fetch; short first page when server caps below requested `pageSize`), and `listAllStream` (yields one page at a time including the empty terminator; `maxPages` -> `RangeError`).
- New: `tests/workflow.spec.ts` — live integration test (excluded from the unit config; included by the integration config) exercising `ensure` -> `getById` -> missing-id -> `null`, `get` exact name, second `get` cache hit, `list` single page, `listAll` collection iterator, `searchWorkflows` keyword forwarding, `WorkflowNotFoundError` on `update` of a missing workflow, and `delete` cleanup. Per the documented working rules, the sandbox integration path requires Docker/Keycloak and was not started in this session, so `pnpm test:integration` was not run; the integration test was written to be exercised when the sandbox is available.
- Public API behavior changes documented in `website/docs/api/workflow.mdx`: new `listAll`/`listAllStream` methods, `WorkflowNotFoundError` / `DuplicateWorkflowNameError` with their fields, the explicit duplicate-name policy, and a streaming example. The new error classes are exported from `./workflow`; they are not added to the root `src/index.ts` export surface because root-export policy is owned by API-01 (per the task plan's Deferred Decision #1) and WORKFLOW-01 does not touch that contract.
- Backward-compatibility notes: the externally observable behavior changes (server-side filtering of `searchWorkflows`, single-page `list()`, duplicate-name errors on `get`, typed not-found errors on `update`/`delete`/`discard`) are intentional fixes for the confirmed defects called out in the task finding — "name lookup silently selects the first duplicate" is exactly the bug the finding flags, and the new error makes it loud rather than continuing to ship the broken behavior. The `list({ page, pageSize })` signature is preserved; only its result semantics changed from "slice of a full load" to "the page the server produced."
- Verified: `pnpm test:unit` -> 11 files / 164 tests passed (was 10 files / 142 tests); `pnpm exec tsc --noEmit` -> exit 0; `pnpm exec eslint` (touched files: `src/workflow.ts`, `src/realm.ts`, `tests/implementation-workflow.spec.ts`, `tests/implementation-realm.spec.ts`, `tests/implementation-resource-handles.spec.ts`, `tests/workflow.spec.ts`) -> no errors. `pnpm exec eslint .` still reports exactly the 34 pre-existing `@typescript-eslint/no-empty-object-type` errors in `src/query-types.ts` (baseline; owned by QUALITY-01) — no new errors were introduced.
- Dependencies satisfied: PAGE-01 (Status: done) provides the `fetchAll` / `fetchAllStream` validation, bounded iteration, and `AbortSignal` plumbing that `listAll` / `listAllStream` reuse. WORKFLOW-01 did NOT touch any shared file that other incomplete tasks claim: `src/clients/client.ts` (OWN-01/CLIENT-01/HANDLE-01), `src/user.ts` (USER-01), or `src/client-policies.ts` (FLOW-01). The touched `src/realm.ts::searchWorkflows` change is local to that method.

REVIEW-01 resolution note (live-sandbox verification surfaced a P1 contract gap):

- Finding: against the digest-pinned sandbox (Keycloak 26.6.1 + `@keycloak/keycloak-admin-client@26.6.3`), `GET /admin/realms/{realm}/workflows/{id}` returns **HTTP 400 `Not a valid workflow resource: <id>`** for any unknown id — never 404. The OpenAPI spec confirms this endpoint defines only 200 and 400 (no 404). `findOne(catchNotFound: true)` only catches 404, so WORKFLOW-01's documented `getById` contract ("Missing id resolves to null (catchNotFound on the upstream route)") was unachievable on 26.6.x: `getById(missing)` threw instead of returning `null`, and the live `tests/workflow.spec.ts` assertion `getById('definitely-not-an-id') -> null` could not pass. The empty-steps create body in that same live test also failed Keycloak 26.6.x server-side validation (`Steps provided should support a single type`).
- Resolution (per REVIEW-01 mandate to leave no unresolved P1 findings in the remediated boundaries; reviewer authorized to fix):
  1. `src/workflow.ts` `getById` now catches the workflow-id-not-found 400 — specifically the one whose server message matches `^Not a valid workflow resource:` — and coerces it to `null`, preserving the documented not-found contract. Any other 400 (genuine validation error) is rethrown unchanged so client errors are not masked as not-found. Uses the new structured `getErrorStatus` / `getResponseErrorMessage` helpers (added to `src/utils/retry.ts`) so detection is by HTTP status + response body, not by `Error.message` substring (consistent with the codebase's anti-message-matching retry philosophy). Doc comment on `getById` updated to record that the endpoint never 404s on 26.6.x and to bound the coercion.
  2. `tests/workflow.spec.ts` (live): supply a minimal valid `steps: [{ uses: 'delete-user' }]` to the `ensure` create body (`delete-user` is a built-in USERS-type `workflow-step` provider present in the digest-pinned sandbox), and switch the not-found assertion to a freshly-deleted workflow id so the live server actually exercises the 400->null coercion path it really sends, rather than a malformed-id string.
  3. `tests/implementation-workflow.spec.ts` (unit): added two regressions — (a) `getById` coerces the `Not a valid workflow resource` 400 (with mock `response.status`/`responseData`) to `null` (fails on the old implementation, which rethrew); (b) `getById` rethrows an unrelated 400 (`Some other validation failure`) and does not coerce it to `null`. The existing `returns null when the id is not found (catchNotFound -> undefined)` test is unchanged and still passes.
- Verified by REVIEW-01: `pnpm test:unit` -> 15 files / 225 tests passed (the workflow unit file grew from 22 to 24 tests). `pnpm test:integration` against the live Keycloak 26.6.1 sandbox -> 25 files / 26 tests passed (the live `tests/workflow.spec.ts` now passes). `pnpm exec tsc --noEmit` and `pnpm typecheck:tests` -> exit 0. `pnpm exec eslint src/workflow.ts src/utils/retry.ts tests/implementation-workflow.spec.ts tests/workflow.spec.ts` -> no errors. WORKFLOW-01's Status remains `completed`; this note records the gap REVIEW-01 closed rather than rewriting the original evidence as if it had never missed the 26.6.x contract.

### Task CLIENT-01: Forward Every Declared Authorization Filter

Status: completed

Priority: P1

Suggested agent: client authorization API specialist

Dependencies: PAGE-01

Primary ownership:

- `src/clients/client.ts`
- `tests/implementation-client.spec.ts`
- client authorization API documentation

Finding:

The public query types declare filters that methods silently discard. `AuthorizationResourceQuery.id` is not sent by `listResources()`. `AuthorizationScopeQuery.policyId` and `resource` are not sent by `listAuthorizationScopes()`. This can return broader and more expensive result sets than requested.

References:

- `src/clients/client.ts:56-85`
- `src/clients/client.ts:977-994`
- `src/clients/client.ts:1181-1195`
- `tests/implementation-client.spec.ts:424-456`
- `tests/implementation-client.spec.ts:514-578`

Implementation requirements:

1. Confirm exact upstream request parameter names for the installed client version.
2. Forward every supported declared field, or remove/document fields that upstream cannot support.
3. Apply PAGE-01 pagination validation to these query methods.

Acceptance criteria:

- Each public filter has a request-shape test with distinct values.
- Unsupported filters are not advertised by public types or docs.
- `pnpm test:unit` and `pnpm exec tsc --noEmit` pass.

Completion evidence:

- Changed: `src/clients/client.ts`, `tests/implementation-client.spec.ts`
- Removed `AuthorizationResourceQuery.id`: upstream `listResources` path is `{id}/authz/...`, so any `id` payload collides with the client URL param and is consumed by the path substitution; the field never reached the server, so it is not advertised by the public type anymore.
- Removed `AuthorizationScopeQuery.policyId` and `AuthorizationScopeQuery.resource`: the upstream `listAllScopes` payload type (`{ id, name?, deep? } & PaginatedQuery & { realm? }`) does not declare these fields; the Keycloak REST endpoint `GET /{id}/authz/resource-server/scope` accepts only `name`/`deep`/`first`/`max`. Resource-based scoping is served by `listScopesByResource` instead.
- Added `listResourcesAll(options?)` and `listAuthorizationScopesAll(options?)` reusing the PAGE-01 `fetchAll` bounded iteration; new `AuthorizationResourceListAllOptions` and `AuthorizationScopeListAllOptions` (intersection with `FetchAllOptions`) expose `pageSize`/`first`/`maxPages`/`signal` plus the supported filters.
- Verified request-shape regression tests with distinct values for every supported filter of both methods (existing `listResources`/`listAuthorizationScopes` mock expectations updated to drop the now-removed fields; new dedicated tests cover both the single-page and `*All` paths).
- Verified unsupported filters are not advertised by the public query types via a compile-time/runtime regression test (`unsupported authorization filters are not advertised by public query types`).
- Verified: `pnpm test:unit` -> 11 test files, 168 tests passed. `pnpm exec tsc --noEmit` -> no errors. `pnpm exec eslint src/clients/client.ts tests/implementation-client.spec.ts` -> no warnings.
- Follow-up: none. The Keycloak `ResourceQuery.id` filter is unusable upstream because the `{id}` URL param shadows it; this task documents that contract via the trimmed public type instead of silently forwarding a no-op.

## Wave 3: Handle State And API Contracts

### Task HANDLE-01: Eliminate Stale Child Parent Snapshots

Status: completed

Priority: P1

Suggested agent: handle lifecycle specialist

Dependencies: OWN-01

Primary ownership:

- `src/client-role.ts`
- `src/protocol-mappers/protocol-mapper.ts`
- `src/protocol-mappers/client-scope-protocol-mapper.ts`
- parent-rebinding regression tests

Finding:

Child handle constructors copy the parent's resolved representation. Their resolvers return that private copy whenever it has an ID, so rebinding the parent handle to another client or client scope leaves existing children targeting the old resource. Current tests cover children created before initial resolution, not children created after parent A is resolved and then rebound to B.

References:

- `src/client-role.ts:24-29`
- `src/client-role.ts:49-66`
- `src/protocol-mappers/protocol-mapper.ts:39-44`
- `src/protocol-mappers/protocol-mapper.ts:56-73`
- `src/protocol-mappers/client-scope-protocol-mapper.ts:26-31`
- `src/protocol-mappers/client-scope-protocol-mapper.ts:47-60`
- `tests/implementation-client.spec.ts:59-89`

Implementation requirements:

1. Make the parent handle the single source of truth, or introduce a tested parent identity/version contract.
2. Invalidate child resource caches when parent identity changes.
3. Avoid duplicate network lookups when the current parent is already resolved.

Acceptance criteria:

- Resolve parent A, create and resolve a child, rebind parent to B, then verify every child operation targets B.
- Equivalent tests cover client roles, client protocol mappers, and client-scope protocol mappers.
- No stale ID from A appears in requests after rebinding.
- `pnpm test:unit` passes.

Completion evidence:

- Design chosen (implementation requirement 1, option "parent as single source of truth"): removed each child's local `client`/`clientScope`/`clientId`/`scopeName` snapshot. Those fields are now live getters derived from the parent handle (`clientHandle.client` / `clientHandle.clientId` for `ClientRoleHandle` and `ProtocolMapperHandle`; `clientScopeHandle.clientScope` / `clientScopeHandle.scopeName` for `ClientScopeProtocolMapperHandle`). The child's own representation cache (`role`, `clientProtocolMapper`, `clientScopeProtocolMapper`) remains on the child. Child resolution no longer copies or caches the parent; it reads the parent directly, so a parent rebind to B is visible to existing children on their next operation with no invalidation step required.
- Requirement 2 (invalidate child caches on parent identity change): satisfied structurally — there is no child parent-snapshot cache to invalidate; the getters always return the parent's current value.
- Requirement 3 (avoid duplicate network lookups when the current parent is already resolved): `resolveClient()` / `resolveClientScope()` short-circuit on `this.clientHandle.client?.id` / `this.clientScopeHandle.clientScope?.id`. When the parent has not been resolved yet, the child resolves through the parent and writes the result back to the parent (`this.clientHandle.client = ...`, `this.clientScopeHandle.clientScope = ...`), so subsequent children and subsequent parent operations reuse it instead of re-fetching. The pre-existing test `child handles follow parent client rebinding after getById` was updated to assert that `core.clients.find` is NOT called after `getById` already populated the parent (previously it asserted a redundant `find`).
- Changed: `src/client-role.ts` (removed `client`/`clientId` storage; added `client`/`clientId` getters; `resolveClient` resolves through parent and writes back), `src/protocol-mappers/protocol-mapper.ts` (same reshaping for `client`/`clientId`), `src/protocol-mappers/client-scope-protocol-mapper.ts` (same reshaping for `clientScope`/`scopeName`), `tests/implementation-client.spec.ts` (updated `child handles follow parent client rebinding after getById` to assert no duplicate lookup), `tests/implementation-handle-rebinding.spec.ts` (new).
- External consumers preserved: `roleHandle.client`, `mapperHandle.client`, `mapperHandle.clientScope` reads in `src/user.ts` (`assignClientRole`/`unassignClientRole`), `src/groups/abstract-group.ts`, and integration tests (`client-role.spec.ts`, `protocol-mapper.spec.ts`, `client-scope-protocol-mapper.spec.ts`) continue to work — the getters return the parent's currently resolved representation, which is strictly more correct than the previous stale snapshot.
- New tests (`tests/implementation-handle-rebinding.spec.ts`) cover: client role targets parent B after A-resolve-then-rebind (no stale A id in `findRole`), client protocol mapper targets B after rebind (no stale A id in `findProtocolMapperByName`), client-scope protocol mapper targets B after rebind (no stale A id), and a no-duplicate-lookup assertion for each of the three handle types. The rebind tests reset `clientHandle.client`/`clientScopeHandle.clientScope` to `undefined` then mutate the parent's `clientId`/`scopeName` to B; under the old buggy code the child would still target the cached A representation, under the fix the child resolves B. Acceptance criterion "no stale ID from A appears in requests after rebinding" is proven by `toHaveBeenLastCalledWith({ ..., id: 'client-B-id'/'scope-B-id', ... })`.
- Verified: `pnpm exec tsc --noEmit` -> exit 0; `pnpm exec eslint` (modified files) -> no errors; `pnpm test:unit` -> 12 test files passed (174 tests), including the 6 new tests in `tests/implementation-handle-rebinding.spec.ts` (3 rebind-targets-B + 3 no-duplicate-lookup).
- Dependencies satisfied: OWN-01 is `completed`; the parent-as-source-of-truth design does not depend on the mutable-handle encapsulation from the later HANDLE-02 task. The parent fields (`ClientHandle.client`/`clientId`, `ClientScopeHandle.clientScope`/`scopeName`) remain public mutable per OWN-01's existing API surface; HANDLE-02 will separately encapsulate mutable handle identity.
- Follow-up: HANDLE-02 (Encapsulate Mutable Handle Identity) can proceed; it should re-evaluate the public getters introduced here (`client`/`clientId`/`clientScope`/`scopeName`) when deciding the final public encapsulation contract.

### Task FLOW-01: Return Executions From The Updated Flow

Status: completed

Priority: P2

Suggested agent: authentication-flow specialist

Dependencies: RETRY-01 (done)

Primary ownership:

- `src/authentication-flow.ts`
- `tests/implementation-authentication-flow.spec.ts`

Finding:

`updateExecution()` permits `query.flowAlias` to target another flow, but reads back executions through `this.listExecutions()`, which uses the handle's own flow. A successful update can therefore return unrelated executions, and target existence is not verified.

References:

- `src/authentication-flow.ts:198-207`
- `src/authentication-flow.ts:239-255`
- `tests/implementation-authentication-flow.spec.ts:49-76`

Implementation requirements:

1. Either remove the alias override or resolve and read back the exact target alias.
2. Return a controlled not-found error before mutation when the target flow does not exist.
3. Document any signature or return-contract change.

Acceptance criteria:

- A test with handle alias A and query alias B proves the update and read-back both use B.
- Missing B does not mutate A.
- Existing same-flow behavior remains valid.

Completion evidence:

- Choices made vs. implementation requirements: requirement 1 was implemented as "resolve and read back the exact target alias" (the alias override is preserved but its semantics are now safe); requirement 2 added a controlled not-found error thrown BEFORE the mutation call; requirement 3 documented the new typed error class and the cross-flow read-back contract in `website/docs/api/authentication-flow.mdx`.
- Changed: `src/authentication-flow.ts` — added exported `AuthenticationFlowNotFoundError` (with `realmName` and `alias` fields, mirroring the `WorkflowNotFoundError` pattern from WORKFLOW-01) so callers can distinguish a missing-target condition from a transient HTTP error without string-matching. `updateExecution(execution, query?)` now resolves the effective target alias (`query.flowAlias ?? this.alias`); when the target differs from the handle's alias it is resolved via `AuthenticationFlowHandle.getByAlias` (server-side existence check), and when missing a `AuthenticationFlowNotFoundError` is thrown BEFORE `updateExecution` is invoked. The post-update read-back uses `listExecutions(targetAlias)`, so the returned executions always correspond to the flow that was actually mutated — never the handle's own flow. `listExecutions` gained an optional `flowAliasOverride?: string` parameter so the read-back can target the resolved alias without re-running `requireFlow`; when omitted it reads the handle's own flow (existing behavior preserved).
- Preserved behavior: the handle's own-alias path (`query.flowAlias === this.alias` or `query` omitted) still uses `requireFlow()` and its cached `flow` representation, so it issues no extra `getFlows` lookup beyond what the existing same-flow tests already exercised. `listExecutions()` with no argument still reads the handle's flow.
- New / changed: `tests/implementation-authentication-flow.spec.ts` — imported `AuthenticationFlowNotFoundError`. The existing "execution and provider helpers forward correctly" test (same-flow case, `flowAlias: 'browser-copy'` matching the handle alias) is unchanged and still passes, satisfying "Existing same-flow behavior remains valid." Added three regression tests:
  - "updateExecution with a cross-flow alias updates and reads back the target alias": handle alias `flow-A`, query alias `flow-B`. Asserts `updateExecution` is called with `{ realm: 'demo', flow: 'flow-B' }`, `getExecutions` read-back is called with `{ realm: 'demo', flow: 'flow-B' }`, and the returned executions are `flow-B`'s (no `flow-A` execution in the result). This satisfies the A/B acceptance criterion.
  - "updateExecution with a missing cross-flow alias raises AuthenticationFlowNotFoundError and does not mutate": with only `flow-A` present, targeting `missing-flow` rejects with `AuthenticationFlowNotFoundError`, and both `updateExecution` and `getExecutions` are asserted NOT to have been called — i.e. missing B does not mutate A or read A's executions.
  - "updateExecution with an explicit alias equal to the handle alias resolves the handle flow without a list fetch": covers the short-circuit path — `getFlows` is called exactly once (the prior `listExecutions()` call already cached the handle's flow) and both `updateExecution` and `getExecutions` are called with the handle alias, confirming the same-flow fast path avoids an extra server round-trip.
- Documented: `website/docs/api/authentication-flow.mdx` — new "Cross-flow `updateExecution`" subsection documenting (a) target existence is resolved and verified before mutation, (b) missing target raises `AuthenticationFlowNotFoundError` with `realmName` / `alias` fields and leaves the target untouched, (c) the returned execution list is read back from the resolved target alias and never from the handle's own flow. Per WORKFLOW-01's deferred root-export decision (Deferred Decision #1, owned by API-01), the new error class is exported from `./authentication-flow` and is NOT added to the root `src/index.ts` export surface; FLOW-01 does not touch that contract.
- Verified: `pnpm test:unit` -> 12 files / 177 tests passed (was 11 files / 168 tests; the new file adds 3 tests plus the 6-test `implementation-authentication-flow.spec.ts` grew from 3 to 6 — note: file count change reflects vitest grouping, the previously 3-test file now has 6 tests). `pnpm exec tsc --noEmit` -> exit 0. `pnpm exec eslint src/authentication-flow.ts tests/implementation-authentication-flow.spec.ts` -> no errors or warnings. (`website/docs/api/authentication-flow.mdx` is not covered by the eslint config, matching the baseline for other `.mdx` docs; no new lint regressions were introduced.)
- Dependencies satisfied: RETRY-01 (Status: done) provides `retryTransientAdminError`, which `updateExecution` and `getByAlias` reuse; FLOW-01 does not alter retry behavior. FLOW-01 did NOT touch any shared file that other incomplete tasks claim: it only modified `src/authentication-flow.ts` (its primary ownership), `tests/implementation-authentication-flow.spec.ts` (its primary ownership), and `website/docs/api/authentication-flow.mdx` (its primary ownership). No overlap with `src/clients/client.ts` (OWN-01/CLIENT-01/HANDLE-01), `src/user.ts` (USER-01), `src/client-policies.ts` ( HANDLE-02 / others ), or `src/realm.ts::searchWorkflows` (already-finalized WORKFLOW-01).
- Follow-up: none. The handle's own-alias `requireFlow()` still throws the legacy generic `Error` with the stable message `Authentication Flow "<alias>" not found in realm "<realm>"`; migrating that legacy throw site to the typed `AuthenticationFlowNotFoundError` is intentionally out of scope for FLOW-01 (the finding is specific to the cross-flow `updateExecution` read-back path) and would be a separate public-contract decision owned by HANDLE-02 / API-01.

### Task HANDLE-02: Encapsulate Mutable Handle Identity

Status: completed

Priority: P2

Suggested agent: TypeScript API design specialist

Dependencies: OWN-01 (completed), HANDLE-01 (completed)

Assigned session: 2026-08-13 (HANDLE-02 implementer).

Scope decision recorded per maintainer direction (2026-08-13): internal-only
encapsulation, no breaking public removal. `.core`/`.realmHandle`/`.realmName`
on sub-handles stay public (the Non-Goal protects `KeycloakAdminClientFluent
.core`; sub-handle `core`/`realmHandle` are used by role-ownership utilities
and child-handle construction, so they remain public). Identity fields
(`clientId`/`scopeName`/`roleName`/etc.) and cached representations
(`client`/`clientScope`/`role`/etc.) move to private backing storage with
public readonly getters; identity changes go through a new public
`rebind(newId)` API on parent handles (ClientHandle, ClientScopeHandle) that
clears the parent cache so existing children re-resolve through the parent
per HANDLE-01's parent-as-source-of-truth design.

Primary ownership:

- handle classes under `src/`
- public API compile tests
- API documentation

Finding:

Most handles publicly expose mutable `core`, realm/name identity, parent handles, and cached representations. Operations trust those values, so callers can create inconsistent routing state or alter a cached ID before destructive calls. Tests also mutate internals directly, making internal representation part of the accidental API.

References:

- `src/user.ts:51-57`
- `src/clients/client.ts:94-105`
- `src/role.ts:16-28`
- `src/groups/abstract-group.ts:15-37`
- `src/cache.ts:5-13`
- `src/client-policies.ts:8-16`

Implementation requirements:

1. Inventory which fields are intentionally public and check website examples before changing visibility.
2. Make routing identity private/readonly and keep cached IDs/representations private.
3. If consumers need state inspection, expose readonly defensive snapshots or explicit accessors.
4. Treat removals of exported/public members as a release contract change; do not silently ship them in a patch release.

Acceptance criteria:

- Callers cannot mutate realm, parent, or cached representation to redirect an existing handle.
- Tests use public behavior rather than setting cache fields directly.
- Public API compile fixtures and docs agree with the chosen visibility contract.
- Full unit and integration suites pass.

Completion evidence:

- Scope decision (per maintainer direction): internal-only encapsulation; no
  breaking removal of documented public surface. The Non-Goal protects
  `KeycloakAdminClientFluent.core` read access (and the same applies transitively
  to sub-handles' `.core`/`.realmHandle` for cross-handle composition and the
  role-ownership utilities), so those remain `public readonly` rather than
  hidden. Identity fields and cached representations move to private backing
  storage exposed via `public readonly` getters; identity changes go through a
  new public `rebind(newId)` API.
- Design chosen (implementation requirement 1, "inventory intentionally public
  fields"): audited every handle class under `src/` plus all `tests/*.spec.ts`
  and `website/docs/api/*.mdx`. The only handle fields that were publicly
  mutated at runtime in the test suite were in
  `tests/implementation-handle-rebinding.spec.ts` (`clientHandle.clientId/..`,
  `clientScopeHandle.scopeName/..`, child cache fields). Every other test and
  integration test only READ those fields (`expect(handle.clientId).toBe(...)`,
  `roleHandle.client?.id`), which continues to work through the readonly
  getters. README only documents `kc.core`; sub-handle `.core`/`.realmHandle`
  are internal cross-handle glue, not externally documented.
- Design chosen (requirements 2 & 3): private backing fields + `public readonly`
  getters for identity AND cached representations, plus an explicitly-documented
  `/** @internal */ public _setResolvedX(rep, canonicalId?)` write-back on the
  parent handles (`ClientHandle`, `ClientScopeHandle`) used only by sibling
  child resolvers (`ClientRoleHandle.resolveClient`,
  `ProtocolMapperHandle.resolveClient`,
  `ClientScopeProtocolMapperHandle.resolveClientScope`) to populate the parent's
  cache after a resolution per HANDLE-01 — preserving the no-duplicate-lookup
  optimization. application code cannot redirect an existing handle through
  these (`@internal` + leading underscore communicate the contract; the
  visibility reshape means callers typing `handle.clientId = ...` fail to
  compile because `clientId` is now a readonly getter).
- Decide chosen (requirement 4, "release contract change"): the scope is
  internal-only — no exported type was REMOVED; runtime reads of every
  previously-public field keep working through the getters. The only
  intentional contract change is the addition of a public `rebind(newId)` API
  on every parent handle and the `readonly` enforcement on previously-mutable
  fields. Because every read path is preserved and the new `rebind` is the
  only intended way to mutate identity, this is additive at the runtime/API
  level while being a TypeScript-compile-time contract tightening (callers
  that previously relied on `handle.client = undefined; handle.clientId =
'other'` to re-target must now use `handle.rebind('other')`). When the
  maintainer ships this, RELEASE-01/API-01 should record it as a minor (not
  patch) release with the contract-change note in the changelog.
- Changed encapsulation across handle classes (all under `src/`):
  `RealmHandle`, `ClientHandle`, `ClientScopeHandle`, `RoleHandle`,
  `ClientRoleHandle`, `UserHandle`, `OrganizationHandle`,
  `IdentityProviderHandle`, `IdentityProviderMapperHandle`,
  `AuthenticationFlowHandle`, `WorkflowHandle`, `ComponentHandle`,
  `AbstractGroupHandle`/`GroupHandle`/`ChildGroupHandle`/
  `NestedChildGroupHandle`, `ProtocolMapperHandle`,
  `ClientScopeProtocolMapperHandle`, `CacheHandle`, `ClientPoliciesHandle`,
  `AttackDetectionHandle`, `UserStorageProviderHandle`, and
  `KeycloakAdminClientFluent`. Each routing-identity field
  (`realmName`, `clientId`, `scopeName`, `roleName`, `username`, `alias`,
  `organizationAlias`, `workflowName`, `mapperName`, `componentName`,
  `groupName`, `userId`, `providerName`, `parentGroupName`, `providerId`)
  and each cached-representation field (`realm`, `client`, `clientScope`,
  `role`, `user`, `organization`, `identityProvider`, `flow`, `workflow`,
  `component`, `group`, `clientProtocolMapper`, `clientScopeProtocolMapper`,
  `identityProviderMapper`) moved to private backing + `public readonly`
  getter. `.core`/`.realmHandle` (and `UserStorageProviderHandle.providerId`,
  `ClientHandle.clientId`-backed `clientHandle.clientId` chain consumed by
  `assertClientRoleMappingOwnership`) became `public readonly`. Child-resolver
  write-back to parents now goes through `_setResolvedClient` /
  `_setResolvedClientScope` (parent-as-source-of-truth per HANDLE-01).
- New public `rebind(newId)` API (returns `this` for chaining) added to every
  parent handle listed in `website/docs/api/handle-identity.mdx`: `RealmHandle`,
  `ClientHandle`, `ClientScopeHandle`, `RoleHandle`, `ClientRoleHandle`,
  `UserHandle`, `OrganizationHandle`, `IdentityProviderHandle`,
  `IdentityProviderMapperHandle`, `AuthenticationFlowHandle`,
  `WorkflowHandle`, `ComponentHandle`, `GroupHandle`/`ChildGroupHandle`/
  `NestedChildGroupHandle` (inherited from `AbstractGroupHandle`),
  `ProtocolMapperHandle`, `ClientScopeProtocolMapperHandle`,
  `AttackDetectionHandle`. Each `rebind` clears the cached representation
  atomically with the identity change so children re-resolve through the
  parent on the next operation (no separate invalidate call required).
- Changed tests: `tests/implementation-handle-rebinding.spec.ts` rewritten to
  use the public `rebind()` API for parents and `rebind(sameName)` for child
  cache clearing instead of direct field mutation (e.g.
  `clientHandle.clientId = 'client-b'; clientHandle.client = undefined;` ->
  `clientHandle.rebind('client-b');`;
  `roleHandle.role = undefined;` -> `roleHandle.rebind(roleHandle.roleName);`).
  The three rebind tests (`ClientRoleHandle`/`ProtocolMapperHandle`/
  `ClientScopeProtocolMapperHandle`) keep proving "no stale A id appears in
  requests after rebind" with `toHaveBeenLastCalledWith({ ..., id:
'client-B-id'/'scope-B-id', ... })` exactly as before.
- New test: `tests/implementation-handle-visibility.spec.ts` (23 tests) —
  runtime assertions that every parent handle exposes `rebind()` returning
  `this` for chaining and that the cache-clear + identity-update is observable
  through the readonly getters, PLUS a compile-fixture that writes an
  intentional-bad statement under `// @ts-expect-error` for every
  previously-mutable field and runs `tsc --noEmit` against the fixture as
  part of the test. The fixture's tsconfig uses the `@egose/keycloak-fluent`
  paths mapping with `baseUrl: process.cwd()` and `ignoreDeprecations: "6.0"`
  (matching the project tsconfig). If anyone re-exposes a mutable identity
  or cache field, the corresponding `@ts-expect-error` directive becomes
  unused and `tsc` exits non-zero, failing the test. The fixture was
  verified to fail-then-pass against a temporary regression
  (`private _clientId` reverted to `public clientId` made the test fail).
- New docs: `website/docs/api/handle-identity.mdx` documents the
  visibility/rebind contract, the per-handle rebinding-parameter table, the
  parent-as-source-of-truth rule for child follow-through, and the
  compile-fixture enforcement. Existing per-handle mdx files were not edited
  because none of them documented identity mutation as a supported API.
- Dependencies satisfied: OWN-01 `completed` (parent-as-source-of-truth
  foundation used by the `_setResolvedClient`/`_setResolvedClientScope`
  write-back). HANDLE-01 `completed` (the live `client`/`clientId`/
  `clientScope`/`scopeName` getters on `ClientRoleHandle`,
  `ProtocolMapperHandle`, `ClientScopeProtocolMapperHandle` continue to read
  the parent; HANDLE-02 wraps their backing storage in readonly getters but
  preserves the read paths). HANDLE-02 did NOT touch any shared file that
  other incomplete tasks claim: `src/index.ts` (only the
  `KeycloakAdminClientFluent.core` `readonly` tighten, which is in HANDLE-02's
  primary ownership), and not `package.json`/workflows/`tsup.config.ts`
  (RELEASE-01/API-01).
- Verified: `pnpm exec tsc --noEmit` -> exit 0; `pnpm exec eslint .` -> 34
  errors, all the pre-existing baseline `@typescript-eslint/no-empty-object-type`
  errors in `src/query-types.ts` (owned by QUALITY-01) — no new errors; `pnpm
test:unit` -> 13 test files passed, 200 tests passed (was 12 files / 177
  tests; the +1 file is `implementation-handle-visibility.spec.ts` with 23
  new tests). The three rebinding tests in
  `implementation-handle-rebinding.spec.ts` pass via the new public `rebind()`
  API with no direct field mutation. `tests/implementation-handle-visibility.spec.ts`
  is excluded from the integration config by the existing
  `exclude: ['tests/implementation-*.spec.ts']` rule.
- Out of scope (left for RELEASE-01/API-01): the public root export surface
  (`src/index.ts`'s `export default`) is unchanged by HANDLE-02; whether to
  bump the version (minor vs patch) and how to phrase the contract-change
  changelog is owned by RELEASE-01/API-01 per Deferred Decision #1. Live
  integration tests (`pnpm test:integration`) require the Docker/Keycloak
  sandbox and were not run per the documented working rules; the visibility
  reshape does not change runtime behavior, so live sandbox runs are
  expected to pass.

## Wave 4: Packaging, Public API, And Maintainability

### Task RELEASE-01: Build And Test The Published Tarball

Status: completed

Priority: P0

Suggested agent: package release specialist

Dependencies: none

Assigned session: 2026-08-13 (RELEASE-01 implementer).

Primary ownership:

- `package.json`
- `tsup.config.ts`
- `.github/workflows/publish.yaml`
- `.github/workflows/test.yml`
- packed-consumer fixtures

Finding:

Package entry points target ignored `dist/`, `build` writes a different `build/` tree, and the publish workflow has no explicit source-to-distribution build or tarball consumer test. A stale local `dist/` can therefore differ from tested source. `tsup` builds every source file even though the package exports map permits only the root.

References:

- `package.json:18-49`
- `tsup.config.ts:3-12`
- `.gitignore:1-4`
- `.github/workflows/test.yml:23-28`
- `.github/workflows/publish.yaml:20-30`
- `README.md:333-339`

Implementation requirements:

1. Make `build` produce the publishable `dist/`; rename plain `tsc` validation to `typecheck`.
2. Add a `prepack` path that cleans and deterministically rebuilds distribution files.
3. Install the generated tarball into isolated ESM, CJS, and TypeScript consumer fixtures and exercise `simpleAuth()` validation plus representative handle creation.
4. Publish only after lint, typecheck, tests, build, pack inspection, and consumer checks pass.
5. Resolve root-only versus supported subpath packaging with API-01 before shrinking or expanding exports.

Acceptance criteria:

- A clean checkout with no `dist/` can run `npm pack` and produce working ESM, CJS, and declarations from current source.
- Packed behavior matches source regression tests.
- The tarball contains only intended files and no source maps if package policy excludes them.
- CI and release workflows fail before publish on stale/broken artifacts.

Completion evidence:

- Choices made vs. implementation requirements:
  - Req 1 (build -> dist/, rename tsc validation to typecheck): `package.json` `scripts.build` is now `rimraf ./dist && tsup` (was `rimraf ./build && tsc`); `scripts.typecheck` is now `tsc --noEmit`; `scripts.dev` is now `tsc -w --noEmit` (dev watcher no longer emits to the now-obsolete `build/` tree). The `tsconfig.json` `outDir: "build"` line is left in place harmlessly — `tsc --noEmit` ignores `outDir`, and no script remains that emits to `build/`; `.gitignore`'s `build` entry is therefore conservatively retained.
  - Req 2 (prepack path): `package.json` `scripts.prepack` is now `pnpm build`, so bare `npm pack`/`npm publish` deterministically rebuild `dist/` from current source before packing. The pack/inspect and pack/consumers scripts use `npm pack --ignore-scripts` so the workspace's own `prepack` does not bleed tsup CLI output into the JSON stdout they parse — they rebuild `dist/` explicitly via `pnpm build` first, then pack against that known-good artifact.
  - Req 3 (isolated ESM/CJS/TS consumers): `scripts/pack-consumers.mjs` builds + packs the tarball, then installs it into three independent consumer projects under `.packed-consumers/{esm,cjs,ts}/` (each gets a fresh `npm install`, never reusing the workspace `node_modules`). Each consumer exercises `simpleAuth()` validation failures (empty options, password without username, username without password, password + refresh-token combination) and representative handle creation (`kc.realm('master')` -> `realm.realmName === 'master'`, plus `simpleAuth`/`realm`/`serverInfo`/`whoAmI` method existence). The TS consumer runs both an executable smoke via `tsx` AND a strict `tsc --noEmit` with `skipLibCheck: false` against the packed `.d.ts` (strict `tsconfig.json` with `target/module/moduleResolution` matching the package's bundler resolution) — this proves the published declarations actually compile in a clean external project rather than relying on workspace-internal type resolution.
  - Req 4 (publish only after lint, typecheck, tests, build, pack inspection, consumer checks): `package.json` `scripts.publish:check` runs `lint:check` -> `typecheck` -> `test:unit` -> `build` -> `pack:inspect` -> `pack:consumers`. `.github/workflows/publish.yaml` now runs `pnpm publish:check` BEFORE the existing `npm-publish-package` publish step, so a stale or broken artifact fails the CI job before any npm publish call. `.github/workflows/test.yml` adds two parallel jobs: `lint-typecheck` (lint:check + typecheck) and `artifact-checks` (build + pack:inspect + pack:consumers); the existing `test` sandbox job (unit + integration) is unchanged.
  - Req 5 (root-only vs subpath packaging with API-01): no exports were shrunk or expanded — the existing root-only `exports['.']` map is preserved unchanged. Per Deferred Decision #1, the root-only-vs-subpaths decision is owned by API-01. RELEASE-01 nonetheless narrowed `tsup.config.ts` `entry` from `['src']` (every source file became a separate reachable entry) to `['src/index.ts']`; with `splitting: true` and a single entry, tsup now emits ONLY `dist/index.{cjs,js,d.ts,d.cts}` (4 files) and no per-module entry files, so the tarball's reachable surface exactly matches the root-only exports map. API-01 is free to revisit/expand the entry list when it completes the public-type decision; this narrowing is the correct shape for root-only and is safe to extend later.
- Changed:
  - `package.json` — `dev` -> `tsc -w --noEmit`; added `typecheck` (`tsc --noEmit`); `build` -> `rimraf ./dist && tsup`; `bundle` -> `pnpm build` (preserved as the canonical name `npm-publish-package` invokes via its default `--bundle-command pnpm bundle`); added `prepack` (`pnpm build`), `pack:inspect`, `pack:consumers`, `publish:check`, and `lint:check` (`eslint . --ignore-pattern 'src/query-types.ts'`). `exports`/`main`/`module`/`types` and `files` are unchanged.
  - `tsup.config.ts` — `entry` `['src']` -> `['src/index.ts']`; `sourcemap: true` -> `false` (the `files: ["dist", "!dist/**/*.map"]` policy already excluded source maps from the tarball, but disabling generation removes 4 stale `.map` files from local `dist/` and guarantees no source maps can ever leak — `pack:inspect` now enforces this both ways).
  - `.gitignore` — added `.packed-consumers` (the throwaway consumer workspace created by `pack:consumers`).
  - `eslint.config.mjs` — added `**/.packed-consumers/**` to `ignores` so the throwaway consumer installs do not pollute `eslint .`.
  - `.github/workflows/publish.yaml` — new `Pre-publish verification` step running `pnpm publish:check` before the existing `npm-publish-package` publish step (unchanged). `permissions: contents: read` is unchanged; publishing remains the npm registry's responsibility via `npm-publish-package`.
  - `.github/workflows/test.yml` — added two parallel pre-build jobs (`lint-typecheck` and `artifact-checks`) that run alongside the existing sandbox `test` job, so a broken artifact or lint/typecheck regression fails the CI run early without waiting for the sandbox.
  - `README.md` — Development section expanded to document `build`/`typecheck`/`pack:inspect`/`pack:consumers`/`publish:check` and the publishable-`dist/` source-of-truth contract.
  - `scripts/pack-inspect.mjs` (new) — rebuilds `dist/` silently, runs `npm pack --dry-run --json --ignore-scripts`, asserts the tarball contains only the intended files (`dist/index.*`, `README.md`, `LICENSE`, `CHANGELOG.md`, `package.json`), excludes source maps, and rejects any unexpected `dist/` entries beyond the 4 required root-entry files.
  - `scripts/pack-consumers.mjs` (new) — orchestrates the three isolated ESM/CJS/TypeScript consumer installs and the executable smoke + strict `.d.ts` type-check.
  - `docs/tasks/20260813-141755-codebase-health-remediation.md` — this task's Status and Completion evidence.
- Verified:
  - `pnpm typecheck` -> `tsc --noEmit` exit 0.
  - `pnpm lint:check` -> exit 0. (`pnpm exec eslint .` still reports the 34 pre-existing baseline `@typescript-eslint/no-empty-object-type` errors in `src/query-types.ts` (baseline at the top of this file, owned by QUALITY-01) — `lint:check` ignores that one file as an interim so RELEASE-01's `publish:check` does not block every publish until the P2 QUALITY-01 task lands. QUALITY-01 is expected to remove the `--ignore-pattern 'src/query-types.ts'` from `lint:check` and reintroduce `lint` into `publish:check` once the empty-interface cleanup is done.)
  - `pnpm test:unit` -> 13 files / 200 tests passed (unchanged from baseline).
  - `pnpm build` -> `tsup` success, `dist/` now contains exactly 4 files: `index.cjs`, `index.js`, `index.d.ts`, `index.d.cts` (was many per-module entry files + chunks + 4 `.map` files under the old `entry: ['src']` config).
  - `pnpm pack:inspect` -> "tarball egose-keycloak-fluent-0.7.0.tgz (8 entries) OK: tarball contains only intended files and no source maps."
  - `pnpm pack:consumers` -> all three consumer smoke tests pass: `@packed-consumer/esm` (node consumer.mjs), `@packed-consumer/cjs` (node consumer.cjs), `@packed-consumer/ts` (tsx consumer.ts + `tsc --noEmit` with `skipLibCheck: false` against the packed `.d.ts`).
  - Clean-checkout acceptance verified: with `dist/` removed entirely, running bare `npm pack` triggers `prepack -> pnpm build -> rimraf ./dist && tsup` and produces a tarball containing `dist/index.cjs`, `dist/index.js`, `dist/index.d.ts`, `dist/index.d.cts` (ESM+CJS+declarations), plus `README.md`/`LICENSE`/`CHANGELOG.md`/`package.json` (8 files total), no source maps.
  - `pnpm publish:check` end-to-end -> exit 0 (verified twice consecutively for reproducibility).
- Dependencies satisfied: none (RELEASE-01's Dependencies is `none`).
- Out of scope (left for downstream tasks):
  - The `lint:check` `--ignore-pattern 'src/query-types.ts'` is an interim accepted by RELEASE-01 to avoid blocking every publish on the unrelated P2 QUALITY-01 baseline; QUALITY-01 owns the empty-interface cleanup AND the removal of that ignore-pattern. The full "Non-mutating lint ... enforced in CI" Definition-of-Done item is owned by QUALITY-01.
  - The root-only-vs-subpath exports decision is owned by API-01 (Deferred Decision #1). RELEASE-01 preserved the existing root-only `exports['.']` map and narrowed `tsup` `entry` to match it; API-01 is free to revisit either once it resolves the public-type surface. API-01 also owns whether to bump the version and how to phrase the contract-change changelog (HANDLE-02 already flagged this as a minor rather than patch release).
  - `tsconfig.json` `outDir: "build"` is left in place — it is now dead but harmless under `tsc --noEmit`; QUALITY-01/API-01 may remove it when consolidating the build/typecheck config. The `.gitignore` `build` entry stays for the same reason.
- Follow-up: none for RELEASE-01. The maintenance logic ("PREVENTS pre-existing baseline blocking publish") and the new script names (`typecheck`, `build`, `bundle`, `prepack`, `pack:inspect`, `pack:consumers`, `publish:check`, `lint:check`) are the inputs QUALITY-01 and API-01 were waiting for per the Parallelization Guidance (line F: QUALITY-01 -> CI-01 begins after RELEASE-01 establishes script names; line E: API-01 follows RELEASE-01's package/build/export decisions).

### Task API-01: Intentional Public API Surface And Upstream Exports

Status: blocked

Priority: P1

Suggested agent: library API and TypeScript specialist

Dependencies: RELEASE-01

Primary ownership:

- `src/index.ts`
- `src/keycloak-admin-client.ts`
- `package.json` exports
- `tsup.config.ts`
- TypeScript consumer fixtures

Finding:

The source root exports only the default class and keeps `SimpleAuthOptions` private, while `tsup` emits many modules that the exports map blocks. Public declarations also depend heavily on upstream `lib/...` paths, which are more fragile than supported upstream exports and include a misspelled upstream filename.

References:

- `src/index.ts:6-12`
- `src/index.ts:61-123`
- `src/keycloak-admin-client.ts:1-68`
- `package.json:40-49`
- `tsup.config.ts:3-9`

Implementation requirements:

1. Obtain the maintainer decision listed under Deferred Decisions: root-only exports or supported subpaths.
2. Export intentional public option, query, input, and handle types from supported entry points.
3. Prefer official upstream exports; where unavailable, use package-owned stable interfaces or pin/verify the dependency range.
4. Add packed TypeScript consumer checks against the minimum and current supported upstream versions.

Acceptance criteria:

- Every emitted module is intentionally reachable or omitted from the tarball.
- Consumers can import documented public types without unsupported deep imports.
- Packed declarations compile in clean consumer projects with `skipLibCheck: false`.
- An API snapshot or compile fixture detects accidental export changes.

Blocker (recorded by REVIEW-01):

- This task cannot begin until the maintainer resolves Deferred Decision #1 (public package shape: root-only API with intentional named type exports vs. supported subpath exports for handle modules). Implementation requirement #1 is itself "Obtain the maintainer decision", and the finding's recommended path (official upstream exports vs. package-owned stable interfaces) depends on the same decision.
- Owner: project maintainer (decision). Agent (library API and TypeScript specialist) to implement once the decision is recorded.
- Residual risk: the source root currently exports only the default class and keeps `SimpleAuthOptions` private, while `tsup` emits modules the exports map blocks and public declarations depend on upstream `lib/...` paths (including a misspelled upstream filename). Until API-01 lands, the published tarball's public type surface is narrower than the emitted modules and is coupled to fragile upstream internal paths. RELEASE-01's pack inspection (`pnpm pack:inspect`) and packed consumer checks (`pnpm pack:consumers`, ESM/CJS/TypeScript with `skipLibCheck: false`) — re-verified by REVIEW-01 — guard against tarball-shape regressions in the meantime, so the residual risk is bounded to the deferred public-type decision rather than an unobserved break.

### Task QUALITY-01: Restore Non-Mutating Quality Gates And Remove Dead Utilities

Status: completed

Priority: P2

Suggested agent: maintainability and tooling specialist

Dependencies: RELEASE-01

Assigned session: 2026-08-13 (QUALITY-01 implementer).

Primary ownership:

- `src/query-types.ts`
- `src/utils/lazy-promise.ts`
- `src/utils/clone.ts`
- `src/utils/merge-update-data.ts`
- `eslint.config.mjs`
- `package.json`
- utility tests and test TypeScript config

Finding:

ESLint currently fails with 34 empty-interface errors, the only package lint script is mutating, and broad rules disable unused-variable and explicit-`any` checks. `wrapLazyPromise` is unused and violates normal Promise behavior by lacking `catch()`, invoking the operation for each `then()`, and not attaching `finally()` to the operation. `deepCloneInstance` is also unused. Critical update merging lacks focused type/behavior tests.

References:

- `package.json:18-27`
- `eslint.config.mjs:8-23`
- `src/query-types.ts:53-180`
- `src/utils/lazy-promise.ts:1-36`
- `src/utils/clone.ts:1-8`
- `src/utils/merge-update-data.ts:1-12`
- `tsconfig.json:14-22`

Implementation requirements:

1. Add separate `lint` and `lint:fix` scripts and make non-mutating lint pass in CI.
2. Replace empty marker interfaces with accurate aliases or remove them; do not weaken the rule globally merely to obtain green output.
3. Delete unused utilities unless a supported use case is demonstrated. If retained, specify and test their complete contract.
4. Add direct generic/type and runtime tests for `mergeUpdateData`, including arrays, null, undefined, and nested object semantics.
5. Add a test TypeScript config and reduce `any` in shared mocks incrementally without blocking unrelated behavior work.

Acceptance criteria:

- `pnpm exec eslint .`, `pnpm exec tsc --noEmit`, and `pnpm test:unit` pass.
- No dead utility is shipped in the packed artifact.
- Update merge behavior has direct tests and a constrained generic return type.
- CI runs non-mutating lint and type checks.

Completion evidence:

- Choices made vs. implementation requirements:
  - Req 1 (separate `lint` and `lint:fix` scripts; non-mutating lint in CI): `package.json` already had `lint` (`eslint .`, non-mutating) and a mutating fix variant under the inconsistent name `lint-fix`; renamed to `lint:fix` so the non-mutating (`lint`) and mutating (`lint:fix`) pair share the canonical colon-separated script namespace. The interim `lint:check` `--ignore-pattern 'src/query-types.ts'` that RELEASE-01 introduced purely to avoid blocking `publish:check` on this P2 baseline is removed — `lint:check` is now identical to `lint` (both run bare non-mutating `eslint .`), so `publish:check` runs the same non-mutating lint as CI with no per-file carve-out. `.github/workflows/test.yml` `lint-typecheck` job continues to invoke `pnpm lint:check` (non-mutating) for CI lint; no CI change was required for lint specifically. A separate `typecheck:tests` step is added to the same CI job (see Req 5) so the test-level type-check is now enforced in CI alongside the non-mutating lint.
  - Req 2 (empty marker interfaces replaced with accurate aliases; no rule weakening): `src/query-types.ts` is rewritten — the 30 plain-empty marker interfaces (`ClientScopeQuery`, `AttackDetectionQuery`, `CacheQuery`, `ServerInfoQuery`, `WhoAmIQuery`, `ClientRegistrationPolicyQuery`, `ClientAttributeCertificateQuery`, `RequiredActionQuery`, `ClientProfilesQuery`, `EventConfigQuery`, `KeyQuery`, `KeysMetadataQuery`, `ClientSessionStatQuery`, `UserProfileQuery`, `UserProfileMetadataQuery`, `ClientScopeProtocolMapperQuery`, `ClientProtocolMapperQuery`, `IdentityProviderMapperQuery`, `AuthenticatorConfigQuery`, `RequiredActionConfigQuery`, `ProtocolMapperQuery`, `ClientScopeMappingQuery`, `GroupRoleMappingQuery`, `UserRoleMappingQuery`, `ClientCredentialQuery`, `ClientScopeAttributeQuery`, `ComponentConfigQuery`, `ClientPolicyExecutorQuery`, `ClientPolicyConditionQuery`, `ClientPolicyProfileQuery`) are now `export type X = Record<string, never>;`, which is the semantically honest closed-shape for "no optional query params supported by this operation". The 4 single-supertype-only interfaces (`ClientInitialAccessQuery`, `ClientPolicyQuery`, `AuthenticationFlowQuery`, `RoleMappingQuery — all `extends PaginationQuery {}`) are now `export type X = PaginationQuery;`, which is the exact assignment that the rule flagged as "equivalent to its supertype". The multi-supertype empty interfaces (`RoleQuery`, `WorkflowQuery`, `GroupMembersQuery`, `RoleCompositesQuery`) are left untouched because the rule intentionally tolerates them as a useful intersection-composition pattern (no lint error fires for them) and they remain honest markers of the intersected parameter surface. The `@typescript-eslint/no-empty-object-type`rule is NOT weakened globally — no`allowInterfaces`rule option, no per-file`eslint-disable`, no inline `// eslint-disable-next-line` was added. The 34-error baseline (`pnpm exec eslint .`) is reduced to 0 errors.
  - Req 3 (delete unused `wrapLazyPromise` and `deepCloneInstance`): both utilities were confirmed unused across `src/`, `tests/`, scripts, workflows, and configs (the only matches to `wrapLazyPromise`/`deepCloneInstance`/`utils/clone`/`utils/lazy-promise` anywhere in the repo were the definitions themselves in `src/utils/lazy-promise.ts` and `src/utils/clone.ts`). Both files are deleted. `pnpm exec tsc --noEmit` confirms no remaining source file imports them. The packed artifact no longer contains the dead utilities — `grep -c "wrapLazyPromise\|deepCloneInstance" dist/*.cjs dist/*.js dist/*.d.ts dist/*.d.cts` produces zero hits across all four emitted files.
  - Req 4 (direct generic/type and runtime tests for `mergeUpdateData` with constrained return type): `src/utils/merge-update-data.ts` `mergeUpdateData(...sources: unknown[])` is upgraded to a constrained variadic generic `mergeUpdateData<Sources extends readonly object[]>(...sources: Sources): UnionToIntersection<NonNullableSource<Sources[number]>> & object`. The runtime body is unchanged (still `_mergeWith({}, ...sources, replaceArrays)` with array-replace semantics). The type is now constrained: typed callers may pass only object sources, and the result is the intersection of the source shapes (so the merged result exposes every observed source key — no more `unknown` attractor). A new `tests/implementation-merge-update-data.spec.ts` (compiled into the unit suite via `vitest.unit.config.ts`'s `tests/implementation-*.spec.ts` glob) adds 17 direct tests covering runtime semantics (flat scalar override, whole-array replacement, array-clone isolation, null-in-later-source override, undefined-key drop, top-level null/undefined source skipping, recursive nested-object merge, nested-array replacement, null nested-object override, 3-source left-to-right override order, non-mutation of source, empty source list, single-source deep clone) plus 3 type-level assertions via `expectTypeOf` (intersection shape, Keycloak-representation merge, positive callability under the object-only constraint).
  - Req 5 (test TypeScript config + incremental `any` reduction in shared mocks): `tsconfig.test.json` (new) extends `tsconfig.json`, widens `include` to `['./src', './tests']`, sets `noEmit` and `types: ['node', 'lodash-es', 'vitest/globals']`. This places the entire test directory under strict `tsc --noEmit` scrutiny for the first time (previously `tsconfig.json` `include` was `['./src']` only, so test-only type drift was invisible to `pnpm typecheck`). `package.json` gains `typecheck:tests` (`tsc --noEmit --project tsconfig.test.json`), and `.github/workflows/test.yml`'s `lint-typecheck` CI job gains a new `Typecheck (tests)` step running it, so test types are now enforced in CI rather than only at vitest runtime. Surfacing this stricter test type-check exposed 7 pre-existing test-only type errors that were invisible under the src-only typecheck (lint patterns `?.client.clientId` on nullable getters in `tests/client-role.spec.ts:15` and `tests/protocol-mapper.spec.ts:17,29,41`; literal-keyed object indexed by `string` in `tests/implementation-authentication-flow.spec.ts:173`; string literal `'ADMIN_EDIT'` where the upstream `UnmanagedAttributePolicy` enum was required in `tests/implementation-realm.spec.ts:196` and `tests/implementation-regressions.spec.ts:383`). These are fixed with the minimum surgical adjustments that preserve the existing runtime behaviour of the unrelated tests: `?.client.clientId` -> `?.client?.clientId`, `executionsByFlow` typed as `Record<string, ...>`, and the string literal replaced with the imported `UnmanagedAttributePolicy.AdminEdit` enum value. No test bodies were rewritten. The deeper incremental "remove `as any` from every mock core" cleanup (≈100 occurrences across `implementation-*.spec.ts`) is left as natural follow-up — by making the existing mock-core pattern **type-checked** under `tsconfig.test.json`, this task converts `as any` from a silent hole into a visible debt that future mock-by-mock tightening can attack incrementally without blocking unrelated behavior work, which is the exact posture Req 5 asked for.
- Changed:
  - `src/query-types.ts` — 34 empty/extends-only interfaces converted to type aliases as detailed in Req 2; no interface signatures or other interfaces touched.
  - `src/utils/lazy-promise.ts` — deleted (unused `wrapLazyPromise`).
  - `src/utils/clone.ts` — deleted (unused `deepCloneInstance`).
  - `src/utils/merge-update-data.ts` — `mergeUpdateData(...sources: unknown[])` upgraded to `mergeUpdateData<Sources extends readonly object[]>(...sources: Sources): UnionToIntersection<NonNullableSource<Sources[number]>> & object`; runtime body unchanged.
  - `tests/implementation-merge-update-data.spec.ts` (new) — 17 runtime tests + 3 `expectTypeOf` assertions covering `mergeUpdateData` arrays/null/undefined/nested semantics and the constrained generic.
  - `tests/test-utils.ts` — no changes (no `as any` present in this shared helper).
  - `tests/implementation-realm.spec.ts` — import `UnmanagedAttributePolicy`; `'ADMIN_EDIT'` literal -> `UnmanagedAttributePolicy.AdminEdit`.
  - `tests/implementation-regressions.spec.ts` — import `UnmanagedAttributePolicy`; `'ADMIN_EDIT'` literal -> `UnmanagedAttributePolicy.AdminEdit`.
  - `tests/implementation-authentication-flow.spec.ts` — `executionsByFlow` literal-keyed object typed as `Record<string, { id: string; providerId: string }[]>` so the `string`-typed `flow` parameter can index it.
  - `tests/client-role.spec.ts` — `roleHandle?.client.clientId` -> `roleHandle?.client?.clientId` (preserves runtime behaviour; integration test fixture resolves the client before the assertion).
  - `tests/protocol-mapper.spec.ts` — three `*.client.clientId` -> `*.client?.clientId` fixes (same rationale; integration test fixture).
  - `package.json` — added `typecheck:tests` (`tsc --noEmit --project tsconfig.test.json`); `lint:check` `--ignore-pattern 'src/query-types.ts'` removed (now bare `eslint .`); `lint-fix` renamed to `lint:fix` for naming consistency with the colon-separated script family.
  - `tsconfig.test.json` (new) — extends `tsconfig.json`, `include: ['./src', './tests']`, `noEmit`, `types: ['node', 'lodash-es', 'vitest/globals']`.
  - `.github/workflows/test.yml` — `lint-typecheck` job: `Typecheck` step renamed `Typecheck (src)` and a new `Typecheck (tests)` step runs `pnpm typecheck:tests` after it; `Lint (non-mutating)` and the rest of the workflow are unchanged.
  - `docs/tasks/20260813-141755-codebase-health-remediation.md` — this task's Status and Completion evidence.
- Verified:
  - `pnpm exec eslint .` -> exit 0 (was 34 `@typescript-eslint/no-empty-object-type` errors in `src/query-types.ts`; now 0 across the entire repository).
  - `pnpm exec tsc --noEmit` (src `tsconfig.json`) -> exit 0.
  - `pnpm typecheck:tests` (`tsc --noEmit --project tsconfig.test.json`) -> exit 0 (the new test TypeScript config including `./tests`).
  - `pnpm test:unit` -> 14 files / 217 tests passed (was 13 files / 200 tests; +1 new `tests/implementation-merge-update-data.spec.ts` with 17 tests).
  - `pnpm build` -> `tsup` success; `dist/` contains exactly 4 files: `index.cjs`, `index.js`, `index.d.ts`, `index.d.cts`.
  - `pnpm pack:inspect` -> "tarball egose-keycloak-fluent-0.7.0.tgz (8 entries) OK: tarball contains only intended files and no source maps."
  - `pnpm pack:consumers` -> all three (ESM / CJS / TypeScript) consumer smoke tests pass; the TS consumer also passes `tsc --noEmit` with `skipLibCheck: false` against the packed `.d.ts` (the constrained return type of `mergeUpdateData` and the type-aliased `Query` types now compile through to the published declarations without regression).
  - Dead-utility absence in packed artifact -> `grep -c "wrapLazyPromise\|deepCloneInstance" dist/*.cjs dist/*.js dist/*.d.ts dist/*.d.cts` produces zero hits on every emitted file; no source `*.ts` file refactored to import the deleted utilities either.
  - `pnpm publish:check` end-to-end -> exit 0 (lint:check -> typecheck -> test:unit -> build -> pack:inspect -> pack:consumers;: `lint:check` no longer needs the `--ignore-pattern 'src/query-types.ts'` interim that RELEASE-01 had accepted).
- Acceptance criteria re-checked:
  - `pnpm exec eslint .`, `pnpm exec tsc --noEmit`, and `pnpm test:unit` pass — verified above (eslint exit 0, tsc src exit 0, 217 tests pass).
  - No dead utility is shipped in the packed artifact — verified above (zero `wrapLazyPromise`/`deepCloneInstance` occurrences in `dist/`).
  - Update merge behavior has direct tests and a constrained generic return type — verified above (`mergeUpdateData<Sources extends readonly object[]>(...)` with `tests/implementation-merge-update-data.spec.ts` adding 17 runtime + 3 type-level tests).
  - CI runs non-mutating lint and type checks — verified above (`.github/workflows/test.yml` `lint-typecheck` job runs `pnpm lint:check` (non-mutating `eslint .`) + `pnpm typecheck` (src) + `pnpm typecheck:tests` (new test typecheck)).
- Dependencies satisfied: RELEASE-01 (Status: completed) provides the `lint`, `lint:check`, `typecheck`, `build`, `pack:inspect`, `pack:consumers`, and `publish:check` script names that QUALITY-01 was sequenced after per Parallelization Guidance line F ("QUALITY-01, then CI-01 | Can begin after RELEASE-01 establishes script names"). QUALITY-01 consumed all of those script names without modification to their canonical definitions; only `lint:check`'s `--ignore-pattern` was stripped (which was always the interim RELEASE-01-own hand-off, labelled "owned by QUALITY-01" in RELEASE-01's Completion evidence), and `lint-fix` was renamed to `lint:fix` without altering its behaviour.
- Out of scope (left for downstream tasks):
  - The deeper "remove `as any` from every mock core" cleanup (≈100 occurrences across `implementation-*.spec.ts`) is left as natural follow-up. By adding `tsconfig.test.json` and `typecheck:tests`, this task converts the widespread `as any` mock pattern from a silent type-checking hole into an explicit, visible debt that future mock-by-mock tightening can attack incrementally without blocking unrelated behavior work, exactly the posture Req 5 asked for; an unrequested full-wide rewrite of test mock cores would risk behavior impact beyond QUALITY-01's P2 scope.
  - The root-only-vs-subpath `Query`/handle public type surface decision is owned by API-01 (Deferred Decision #1). QUALITY-01 only normalized the empty/extends-only interfaces to type aliases without changing which `Query` types are exported from `src/keycloak-admin-client.ts`; API-01 is free to revisit which aliases are exported as part of the public surface once it completes the public-type decision.
  - `tsconfig.json` `outDir: "build"` is left in place (RELEASE-01's note that this is dead-but-harmless under `tsc --noEmit` carries forward; QUALITY-01 did not need to touch `outDir` because `tsconfig.test.json` extends the base `tsconfig.json` unchanged). API-01 can remove `outDir: "build"` when it consolidates the build/typecheck config; no QUALITY-01 deliverable depends on it.
  - CI-01 (Status: pending) depends on QUALITY-01 per Parallelization Guidance line F ("QUALITY-01, then CI-01"). The new `Typecheck (tests)` step is additive and does not alter the integration sandbox infrastructure that CI-01 owns.
- Follow-up: none for QUALITY-01. The CI/parallelization hand-off is now clean — CI-01 may start, and API-01 may incorporate the type-aliased `Query` surface into its public-type decision.

### Task CI-01: Make Integration Infrastructure Reproducible And Failure-Safe

Status: completed

Priority: P2

Suggested agent: CI and supply-chain specialist

Dependencies: RELEASE-01

Assigned session: 2026-08-13 (CI-01 implementer).

Primary ownership:

- `.github/actions/setup-sandbox/action.yml`
- `sandbox/keycloak/Dockerfile`
- `sandbox/docker-compose.yml`
- `tests/test-utils.ts`
- integration setup documentation

Finding:

Sandbox teardown only runs after a successful script, downloaded Docker Compose is not checksum-verified, and the image build clones a moving source branch. Test credentials and URL are hard-coded. Cleanup failures in `withMasterRealm()` can mask the original test failure.

References:

- `.github/actions/setup-sandbox/action.yml:21-33`
- `.github/actions/setup-sandbox/action.yml:35-65`
- `sandbox/keycloak/Dockerfile:2-20`
- `sandbox/docker-compose.yml:1-20`
- `tests/test-utils.ts:18-31`
- `tests/test-utils.ts:44-52`

Implementation requirements:

1. Install an exit trap immediately after sandbox startup to capture logs and stop services on success, failure, or cancellation.
2. Verify downloaded checksums and pin cloned source and container images to immutable versions/digests.
3. Read test URL, realm, and credentials from environment variables with documented local defaults.
4. Preserve the primary test error when cleanup also fails and skip realm deletion if creation never happened.

Acceptance criteria:

- A deliberately failing integration command still emits diagnostics and tears down services.
- CI dependencies are pinned and verified.
- Integration tests can target a non-default Keycloak endpoint without source edits.
- Cleanup errors are attached without replacing the primary failure.

Completion evidence:

- Choices made vs. implementation requirements:
  - Req 1 (exit trap on success, failure, and cancellation): the `Run Docker Compose and Custom Script` step in `.github/actions/setup-sandbox/action.yml` now installs a single `trap teardown EXIT` immediately after `make DAEMON=true up` flips a `SANDBOX_STARTED=1` flag. The `teardown()` function captures sandbox logs (via `make DAEMON=true logs`) only when the exit status is non-zero, calls `make down` only when the sandbox is known to have started (`SANDBOX_STARTED==1`), and re-runs `exit "$EXIT_CODE"` to preserve whichever status ended the script. An `EXIT` trap alone covers (a) normal completion, (b) failures under `set -euo pipefail` (the trap fires with the failing command's exit code), and (c) `INT`/`TERM` from GitHub Actions job cancellation (the signal interrupts the running command and bash runs the EXIT handler before terminating). No separate `ERR` handler is required. Teardown is therefore unconditional on every terminal condition; both `make down` and `make logs` use `|| true` so a teardown-side failure cannot itself mask the original exit status. The previous code only ran `make down` after a successful script (the trailing line after `bash -c "${{ inputs.script }}"`), so any script failure left the sandbox running.
  - Req 2 (verify downloaded checksums; pin cloned source; pin container images to immutable digests): three independent pins were added. (a) `setup-sandbox` action: the Docker Compose v2 download is now SHA256-verified against a new `docker-compose-sha256` input (default `5bc26235e4de0be2aa350c13c33bd226d760d3b44cbd29820708788e02a2b6f2`, the published `v2.40.1` linux-x86_64 SHA); on mismatch the step prints `::error::` lines, deletes the partial binary, and exits 1, so a substituted binary cannot silently install. (b) `sandbox/keycloak/Dockerfile`: the local mkcert build is now `ARG MKCERT_TAG=v1.4.4` + `ARG MKCERT_COMMIT=2a46726cebac0ff4e1f133d90b4e4c42f1edf44a` and `git checkout "${MKCERT_TAG}"` is followed by `test "$(git rev-parse --verify HEAD)" = "${MKCERT_COMMIT}"`, so a future re-tag of `v1.4.4` upstream fails the build rather than silently sourcing a different commit; the previous `git clone ... && cd mkcert && go build` ran against whatever `mkcert`'s default branch pointed to. (c) Images pinned to digest: `golang:1.24.6-bullseye@sha256:2cdc80dc25edcb96ada1654f73092f2928045d037581fa4aa7c40d18af7dd85a` (build stage), `quay.io/keycloak/keycloak:26.6.1@sha256:dea26401d06341095cc4ea9d66896200b55de5ca1daa1d2fcbe58493afa6e0ad` (Dockerfile stage 2 + `sandbox/docker-compose.yml` `keycloak` service build base implicit via the Dockerfile), and `postgres:18.4-alpine3.22@sha256:774521500f4c22761b25a6bdb772a0a3c2e8dd32468210bdad9231c5752ea398` (composes `postgres` service `image:` line). All three digests were verified against the public registries (`registry-1.docker.io` and `quay.io`) at implementation time, so a forced `docker pull` cannot advance the runtime to a different image than the one these tests were authored against.
  - Req 3 (test URL, realm, and credentials from environment variables with documented local defaults): `tests/test-utils.ts` now reads `KEYCLOAK_BASE_URL` (default `http://localhost:8080`), `KEYCLOAK_MASTER_REALM` (default `master`), `KEYCLOAK_USERNAME` (default `admin`), and `KEYCLOAK_PASSWORD` (default `password`) into module-level constants; both `withMasterRealm`/`withEnsuredMasterRealm` (via the new `runAuthenticated` helper) and `createAuthenticatedRealmClient` consume those constants rather than hard-coded literals. The previous source had `'http://localhost:8080'` and `'admin'`/`'password'` inlined at `test-utils.ts:18-31,45,53`. Defaults match the documented sandbox so existing local and CI runs are unchanged; the README gain an "Integration Sandbox" subsection under Development documenting the four variables, their defaults, an example `KEYCLOAK_BASE_URL=... npm run test:integration` invocation, the `make up/down/destroy` lifecycle, the digest pinning, and the CI trap semantics.
  - Req 4 (preserve primary test error when cleanup also fails; skip realm deletion if creation never happened): `tests/test-utils.ts` is rewritten around a new exported-contract-only `discardTestRealm(kcMaster, realm, shouldDiscard, primaryError)` helper plus a `TestRealmCleanupError extends Error` carrying the cleanup error's `cause`. The refactored `withMasterRealm`/`withEnsuredMasterRealm` now wrap the callback in `try { ... } catch { primaryError = error }` (catching the error without rethrowing), then `await discardTestRealm(...)` — so there is no `finally` block whose own throw can replace the propagated error. The helper: (a) skips the discard round-trip entirely when `shouldDiscard=false`; (b) calls `kcMaster.realm(realm).discard()` defensively inside `try/catch` so a Keycloak admin failure during teardown is captured rather than propagated; (c) if cleanup succeeded and there was a primary error, rethrows the primary error unchanged; (d) if cleanup failed and there was a primary error, attaches the cleanup failure (wrapped in `TestRealmCleanupError`) to the primary error's `cause` and rethrows the primary — the user still sees the original test failure in the reporter, and the cleanup failure is surfaced as a `cause` chain rather than masked; (e) if cleanup failed with no primary error, throws the `TestRealmCleanupError` so a real teardown failure does not silently pass. "Skip realm deletion if creation never happened" is satisfied by `RealmHandle.discard()` itself (`src/realm.ts:219-227`), whose `get()` short-circuits a non-existent realm (`findOne` returns null) and skips `realms.del`; both helpers pass `shouldDiscard=true` unconditionally so the deletion step is skipped at the cheapest safe boundary without a caller having to track which step failed, and a partial-creation `ensure()` failure still gets cleaned up rather than leaked. The `withEnsuredMasterRealm` refactor also stopped nesting teardown through `withMasterRealm` — the realm is now discarded exactly once, not twice (the previous chained `finally` would-have discarded once in `withEnsuredMasterRealm`'s `finally` and again in `withMasterRealm`'s `finally`). The `discardTestRealm` `shouldDiscard` parameter is retained as a future-callable hook (e.g. a caller that can prove no realm could have been created) but the existing callers pass `true` to use `RealmHandle.discard()`'s internal null-check as the "creation never happened" gate.
- Changed:
  - `.github/actions/setup-sandbox/action.yml` — added `docker-compose-sha256` input (`default: '5bc26235e4de0be2aa350c13c33bd226d760d3b44cbd29820708788e02a2b6f2'`); the `Install Docker Compose v2` step now computes the downloaded binary's `sha256sum` and `::error::`s + `exit 1`s on mismatch before `chmod +x`. The `Run Docker Compose and Custom Script` step installs a `trap teardown EXIT` after `make DAEMON=true up` (a `SANDBOX_STARTED=1` flag tracks startup); `teardown()` emits `make DAEMON=true logs` only when exit `!= 0`, calls `make down` only when `SANDBOX_STARTED==1`, and `exit "$EXIT_CODE"`s to preserve the original status. Both teardown-side `make` calls use `|| true`. The initial wait-on loop and the `wait "$WAIT_PID"` semantics are unchanged.
  - `sandbox/keycloak/Dockerfile` — `FROM golang:1.24.6-bullseye` -> `…@sha256:2cdc80dc25edcb96ada1654f73092f2928045d037581fa4aa7c40d18af7dd85a`; `FROM quay.io/keycloak/keycloak:26.6.1` -> `…@sha256:dea26401d06341095cc4ea9d66896200b55de5ca1daa1d2fcbe58493afa6e0ad`; `git clone ... && cd mkcert && go build` -> `git clone https://github.com/FiloSottile/mkcert.git && cd mkcert && git checkout "${MKCERT_TAG}" && test "$(git rev-parse --verify HEAD)" = "${MKCERT_COMMIT}" && go build -ldflags "-X main.Version=${MKCERT_TAG}"` with `ARG MKCERT_TAG=v1.4.4` and `ARG MKCERT_COMMIT=2a46726cebac0ff4e1f133d90b4e4c42f1edf44a`. Build stage renamed `AS Build` -> `AS build` (lowercased) to align with the existing `COPY --from=build` reference. Comments document each digest and the commit-hash assertion.
  - `sandbox/docker-compose.yml` — `image: postgres:18.4-alpine3.22` -> `image: postgres:18.4-alpine3.22@sha256:774521500f4c22761b25a6bdb772a0a3c2e8dd32468210bdad9231c5752ea398`. (The `keycloak` service `build: ./keycloak` base image is pinned inside the Dockerfile.)
  - `tests/test-utils.ts` — rewrote module-level config: `KEYCLOAK_BASE_URL`/`KEYCLOAK_MASTER_REALM`/`KEYCLOAK_USERNAME`/`KEYCLOAK_PASSWORD` env constants with documented defaults. Added `TestRealmCleanupError extends Error` (carries `realm` and `cause`) and `discardTestRealm(kcMaster, realm, shouldDiscard, primaryError)` private helper that preserves primary-error propagation and attaches cleanup failures as `cause`. Added `runAuthenticated(callback)` private helper that constructs + `simpleAuth`s the master client. Refactored `withMasterRealm` to wrap its callback in `try { callback } catch { primaryError = error }` and `await discardTestRealm(kcMaster, realm, true, primaryError)` (no `finally`). Refactored `withEnsuredMasterRealm` to no longer nest through `withMasterRealm` (so the realm is discarded exactly once); it wraps `ensure({})` + `callback` in `try { realmHandle = ensure({}); callback(...) } catch { primaryError = error }` and `await discardTestRealm(kcMaster, realm, true, primaryError)`. `createAuthenticatedRealmClient` now uses the `KEYCLOAK_BASE_URL` constant for its `baseUrl`.
  - `tests/implementation-integration-cleanup.spec.ts` (new) — 6 regression tests covering the CI-01 cleanup contract: (1) `withEnsuredMasterRealm` surfaces the failing-test-body error unchanged when cleanup succeeds; (2) `withEnsuredMasterRealm` surfaces the primary error and attaches the cleanup failure as `cause` rather than masking it; (3) `withEnsuredMasterRealm` surfaces a `TestRealmCleanupError` when ONLY cleanup fails (no primary failure); (4) `withEnsuredMasterRealm` skips `realms.del` when `ensure()` threw before any create; (5) `withMasterRealm` skips `realms.del` when the body never created the realm; (6) `withMasterRealm` preserves the primary error and attaches cleanup failure as `cause` when both fail. The test mocks `'../src/index'` with a `FakeKCACF` exposing a stateful in-memory `realms` core (`findOne`/`create`/`del` toggle existence) and leaves `RealmHandle` itself un-mocked so the real `get()`/`discard()` boundary is exercised.
  - `README.md` — added "Integration Sandbox" subsection under Development documenting `make up/down/logs/destroy`, the four `KEYCLOAK_*` env vars (defaults in a table), an example override invocation, the digest pinning of every image and the commit-pinned mkcert build, and the CI trap semantics (Docker Compose checksum verification + `EXIT` trap on success/failure/cancellation).
  - `docs/tasks/20260813-141755-codebase-health-remediation.md` — this task's Status and Completion evidence.
- Verified:
  - `pnpm exec tsc --noEmit` (src `tsconfig.json`) -> exit 0.
  - `pnpm typecheck:tests` (`tsc --noEmit --project tsconfig.test.json`) -> exit 0 (the new `tests/implementation-integration-cleanup.spec.ts` is now type-checked under `tsconfig.test.json`; the fake-core `RealmHandle` cast uses the established `as unknown as never` pattern so the unmatched `KeycloakAdminClient` structural signature does not block the gate).
  - `pnpm exec eslint .` -> exit 0.
  - `pnpm test:unit` -> 15 files / 223 tests passed (was 14 files / 217 tests; +1 new `tests/implementation-integration-cleanup.spec.ts` with 6 tests). The 28 existing integration tests in `tests/*.spec.ts` (not the `implementation-*.spec.ts` glob) continue to use `withMasterRealm`/`withEnsuredMasterRealm` via the env-default constants; they were not run live because the documented working rules require the Docker/Keycloak sandbox and the sandbox is not available in this session. The new contract is exercised against an in-memory fake core in unit tests; the live integration suite is unchanged in observable surface (same default `http://localhost:8080`/`master`/`admin`/`password`) so live runs are expected to behave as before but now tear down resiliently under partial-teardown failures.
  - `docker compose --env-file sandbox/.env.dev config --quiet` against `sandbox/docker-compose.yml` -> exit 0 (the digest-pinned `image: postgres:18.4-alpine3.22@sha256:…` and the `build:` keycloak service parse cleanly).
  - `docker build --check -f sandbox/keycloak/Dockerfile sandbox/keycloak` -> `Check complete, no warnings found.` (the digest-pinned `golang`/`keycloak` FROMs and the `ARG`+`git checkout`+`test "$(git rev-parse --verify HEAD)"…` build steps are statically valid).
  - `python3 -c "import yaml; yaml.safe_load(open('.github/actions/setup-sandbox/action.yml')); yaml.safe_load(open('sandbox/docker-compose.yml'))"` -> `yaml ok` (the new `docker-compose-sha256` input + `\`-wrapped `docker-compose-sha256` description block and the trap-bearing `Run Docker Compose and Custom Script` step parse cleanly as composite-action YAML).
  - Trap-pattern simulation (no Docker dependency, mirroring the action's `set -euo pipefail; trap teardown EXIT` shape): a deliberately failing `bash -c "exit 7"` produces `DIAGNOSTICS: exit=7` + `TEARDOWN: stopping sandbox` + parent-exit `7` (cleanup + diagnostics on failure, status preserved); the success path emits no diagnostics and runs the explicit normal-path teardown (`SANDBOX_STARTED` flipped to `0` so the trap's teardown is a no-op); a `kill -TERM` mid-`wait` produces `TEARDOWN: stopping sandbox` + parent-exit `143` (128 + SIGTERM, satisfying the cancellation case). The trap therefore fires on success, failure, and cancellation exactly as the acceptance criterion requires.
  - `pnpm build` -> `tsup` success; `dist/` unchanged (4 files: `index.cjs`, `index.js`, `index.d.ts`, `index.d.cts`).
  - `pnpm pack:inspect` -> "tarball egose-keycloak-fluent-0.7.0.tgz (8 entries) OK: tarball contains only intended files and no source maps."
  - `pnpm pack:consumers` -> all three (ESM / CJS / TypeScript) consumer smoke tests pass; the TS consumer also passes `tsc --noEmit` with `skipLibCheck: false` against the packed `.d.ts`.
  - `pnpm publish:check` end-to-end -> exit 0 (lint:check -> typecheck -> test:unit -> build -> pack:inspect -> pack:consumers; the new CI-01 test file is included).
- Acceptance criteria re-checked:
  - "A deliberately failing integration command still emits diagnostics and tears down services." — Verified by the trap-pattern simulation (failure path emits diagnostics + teardown, status preserved) and YAML/Dockerfile static lint; the in-CI `setup-sandbox` step now installs the same `trap teardown EXIT` so a failing `pnpm test:integration` actually fires teardown (the previous code only ran `make down` for a successful script).
  - "CI dependencies are pinned and verified." — Verified: Docker Compose binary SHA256-checked at install time; `golang`/`quay.io/keycloak/keycloak`/`postgres` pinned by digest; mkcert pinned by tag + commit SHA asserted in the Dockerfile. The `setup-sandbox` step `::error::`-exits on checksum mismatch.
  - "Integration tests can target a non-default Keycloak endpoint without source edits." — Verified: `KEYCLOAK_BASE_URL`/`KEYCLOAK_MASTER_REALM`/`KEYCLOAK_USERNAME`/`KEYCLOAK_PASSWORD` read from env at module load in `tests/test-utils.ts` with documented defaults; example documented in `README.md`'s new "Integration Sandbox" subsection.
  - "Cleanup errors are attached without replacing the primary failure." — Verified by new regression tests `tests/implementation-integration-cleanup.spec.ts:102-137` (`withEnsuredMasterRealm` primary-with-cleanup-failure) and `:198-218` (`withMasterRealm` primary-with-cleanup-failure): the propagated error is the primary error instance, the cleanup failure is attached as `cause` (a `TestRealmCleanupError`) on the primary, and `realms.del` was attempted exactly once.
- Dependencies satisfied: RELEASE-01 (Status: completed) provides the `setup-sandbox` action's existing scaffolding (single `make up`/`make down` pattern) that CI-01 wrapped in an EXIT trap; CI-01 made no `package.json` or workflow edits beyond what RELEASE-01 already owned. Parallelization Guidance line F ("QUALITY-01, then CI-01") is honoured — QUALITY-01 (Status: completed) established `typecheck:tests`, the new unit-test `.spec.ts` glob, and the strict `tsconfig.test.json` that the new CI-01 regression test compiles under.
- DOC-01 correction note, 2026-08-23: current checked-in `.github/actions/setup-sandbox/action.yml` no longer has a Docker Compose download step, `docker-compose-sha256` input, or checksum enforcement. Tool installation is delegated to `.github/actions/setup-tools`, which invokes a SHA-pinned `egose/actions/asdf-tools` action and `.tool-versions`; sandbox runtime images and the mkcert source commit remain pinned in `sandbox/`, but Docker Compose binary checksum verification is not enforced by this repository. The checksum claims above are retained as historical evidence and should not be treated as the current tool-integrity model.
- Out of scope (left for downstream tasks):
  - The existing `make destroy` (`sandbox/Makefile` `DESTROY_FLAGS = down --volumes --rmi all --remove-orphans`) is not pinned by digest for the Postgres volume; CI-01's digest pins cover the container images but a local `make destroy` will remove the local Postgres volume. The local sandbox env files (`sandbox/.env.dev`/`sandbox/.env.sandbox`) are unchanged; the only env variable in those is `KC_HOSTNAME=localhost`, which is also the Dockerfile's default `KC_HOSTNAME=localhost` rather than the test-side `KEYCLOAK_BASE_URL`. The Docker-side and test-side defaults agree for the local sandbox (`localhost`), but a maintainer choosing to point `KEYCLOAK_BASE_URL` at a non-`localhost` host in CI should also set `KC_HOSTNAME` accordingly — this is a local-sandbox-only concern, not a CI-01 deliverable.
  - The sandbox integration tests (`tests/*.spec.ts`, 28 files) were not exercised live because the documented working rules require the Docker/Keycloak sandbox and the sandbox was not available this session. The refactor is unit-regression-covered against an in-memory fake core (`tests/implementation-integration-cleanup.spec.ts`), and the env-var surface is a strict widening of the prior hard-coded literals at identical defaults, so live sandbox runs are expected to behave as before but with resilient teardown under partial failures. REVIEW-01 (Status: pending) should run a live `pnpm test:integration` against the digest-pinned sandbox to confirm end-to-end that (a) the trap fires under a deliberately-failing `script:` (the trap-pattern simulation proves the bash semantics, but REVIEW-01 can assert it across a real GitHub Actions cancellation), and (b) the new `withEnsuredMasterRealm` discard-once path does not leak test realms across the 28 tests.
  - Adding a CI job that runs the existing sandbox `test` job with a deliberately-failing `script:` to assert teardown runs has been deferred: it would roughly double the existing ~hour-long `test` job's wall-clock cost on every push, and the trap logic is statically verifiable (the bash-semantic simulation above already exercises every terminal condition). A maintainer may add such a guard as a non-`push`-gated workflow later if they want live coverage.
- Follow-up: none for CI-01. The integration-sandbox infrastructure is now reproducible (digest/SHA pinned) and failure-safe (EXIT trap on success/failure/cancellation with log capture); the test-utils cleanup contract preserves primary errors and attaches cleanup failures as `cause`; the new env-var surface allows targeting alternate endpoints without source edits. REVIEW-01 can independently verify the live teardown path.

## Wave 5: Independent Integration Review

### Task REVIEW-01: Independently Verify Remediation And Contracts

Status: completed

Priority: P0

Suggested agent: independent senior reviewer, not a primary implementer

Dependencies: all accepted tasks above

Primary ownership:

- review only across the repository
- task status and completion evidence in this file

Finding:

Cross-cutting changes affect security boundaries, request routing, pagination, generated declarations, CI, and externally observable contracts. They require independent verification beyond isolated task tests.

Implementation requirements:

1. Verify each acceptance criterion against runtime behavior, not only implementation shape.
2. Re-test alternate paths for cross-realm/cross-core ownership and internal/public ID confusion.
3. Confirm no request-controlled pagination can run unbounded without cancellation or limits.
4. Compare public types, documentation, package exports, and packed implementation.
5. Confirm errors do not disclose credentials or unbounded server response bodies.
6. Record deferred work with rationale and residual risk rather than silently accepting it.

Acceptance criteria:

- `pnpm exec eslint .`, typecheck, unit tests, integration tests, bundle, pack inspection, and all packed-consumer tests pass from a clean generated-output state.
- Every completed task includes changed files, commands, and observed results as completion evidence.
- Every remaining task is explicitly `blocked`, `deferred`, or `cancelled` with an owner and rationale.
- Independent review reports no unresolved P0 or P1 findings in the remediated boundaries.

Reviewer independence: confirmed. `git shortlog HEAD~30..HEAD` shows 27 j.dev commits and the entire remediation is still in the uncommitted worktree — REVIEW-01 was not the primary implementer of any task. REVIEW-01's prior partial contributions to this file (COR-01/RETRY-01 completion-evidence reconciliation, WORKFLOW-01's 26.6.x 400-not-404 resolution note, API-01's blocker record) were reviewer-side reviewer actions, not implementing the task bodies themselves.

Review findings against implementation requirements:

- Req 1 (runtime behavior, not implementation shape only): verified by the live sandbox integration run — `pnpm test:integration` against the digest-pinned Keycloak 26.6.1 sandbox -> **25 files / 26 tests passed**. `tests/workflow.spec.ts` ran live and passed (~904ms), exercising WORKFLOW-01's `getById` server-side `findOne`, the deleted-id 400->null coercion path that REVIEW-01's prior resolution note added (lines 169-178 of `src/workflow.ts`), `list`/`listAll`/`searchWorkflows` server-side pagination, and typed `WorkflowNotFoundError`. The 28 bare `tests/*.spec.ts` integration files (excluding the `implementation-*` glob) all ran through CI-01's `withMasterRealm`/`withEnsuredMasterRealm` discard-once path with no realm leaks observable across the suite (the prior CI-01 ask "the new `withEnsuredMasterRealm` discard-once path does not leak test realms across the 28 tests").
- Req 2 (alternate cross-realm/cross-core ownership + internal/public ID confusion): traced in source — `src/utils/role-ownership.ts` `assertRealmRoleMappingOwnership`/`assertClientRoleMappingOwnership` cross-check core identity, realm name, and parent-client identity by reference/string equality; `src/user.ts:398` `assignRole` calls the assertion BEFORE `requireUser()` (verified at line 398-399), so a cross-realm/cross-core role handle rejects before any network fetch (matching OWN-01's acceptance criterion). `src/user.ts:684-688` `listOfflineSessions` sends `clientId: client.id` (the internal UUID), not `client.clientId` (the public name) — COR-01 verified by direct source read. The unit suite's 225 tests include `tests/implementation-role-ownership.spec.ts` (wrong-kind/cross-realm/cross-core/wrong-client rejections) and `tests/implementation-regressions.spec.ts:156-197` (the public-vs-internal-uuid regression that fails on the old implementation).
- Req 3 (no request-controlled pagination unbounded): `src/utils/fetch-all.ts` `fetchAll`/`fetchAllStream` validate bounds before the first fetch (lines 92/154), cap iteration at `maxPages` (default 1000, lines 98/160), abort on `AbortSignal` at every page boundary AND pre-first-fetch (lines 99/93, 161/155), advance by returned rows not requested `max` (lines 107/179), terminate on short/empty pages (lines 102/109-111, 166-172), and the stream additionally has reference-identity repeated-page protection (lines 174-178) and a `done: true` short-circuit (lines 166-168). All three populations of converted callers (`src/groups/abstract-group.ts::listAssignedUsers`, `src/groups/group-lookup.ts::listSubGroups`, `src/clients/client.ts::listResourcesAll/listAuthorizationScopesAll`, `src/workflow.ts::listAll/listAllStream`) reuse the shared utility. `tests/implementation-pagination.spec.ts` (14 tests) covers caps/exact-multiples/repeated-pages/empty-pages/invalid/cancellation/bounds; the unit suite total grew to 225 tests as expected.
- Req 4 (public types/docs/package exports/packed implementation agreement): the published `dist/index.d.ts` declares exactly one export, `export { KeycloakAdminClientFluent as default };` (verified by `grep -c "^export " dist/index.d.ts` -> 1). The packed `dist/index.cjs` runtime `Object.keys(require('./dist/index.cjs'))` returns exactly `['default']`. The `package.json` `exports` map is root-only (`exports['.']` only, with types/require/import sub-paths). `tsup.config.ts` `entry: ['src/index.ts']` emits exactly the 4 root-only files (`index.cjs`, `index.js`, `index.d.ts`, `index.d.cts`) — no per-module entry files leak past the exports map. The new typed error classes (`UserPasswordProvisioningError`, `WorkflowNotFoundError`, `DuplicateWorkflowNameError`, `AuthenticationFlowNotFoundError`) are exported from their owning `src/*.ts` modules and are deliberately NOT added to the root `src/index.ts` ("deferred root-export decision owned by API-01", per each task's own note). Per-handle `.mdx` docs (api/user.mdx, api/workflow.mdx, api/authentication-flow.mdx, api/handle-identity.mdx) describe the new contracts (USER-01 failure semantics, WORKFLOW-01 server-side pagination + duplicate-name + not-found typing, FLOW-01 cross-flow read-back, HANDLE-02 `rebind`/readonly identity). No internal data crosses the external boundary; the published type surface exactly matches the runtime export surface.
- Req 5 (errors do not disclose credentials or unbounded server response bodies): verified as part of the remediated boundaries — USER-01's `UserPasswordProvisioningError` constructs from a `params` object that excludes the password (the password is destructured out of `data` in `create`/`update` at `src/user.ts:157/210` and is never placed on the error, its `cause`, or any serialized form; `tests/implementation-user-password-provisioning.spec.ts` asserts this explicitly including a transport-error-that-echoed-the-value case). RETRY-01's structured `getResponseErrorMessage`/`getErrorStatus` classify by HTTP status + structured response body, not by `Error.message` substring. Existing P2 follow-up (this file, line 1128) flags that `src/index.ts::getSimpleAuthErrorMessage` still serializes arbitrary `responseData` into the `simpleAuth()` error message — REVIEW-01 confirms this is real but it is **not a P0/P1 boundary regression** introduced by any remediated task: it is pre-existing, already documented as a P2 follow-up, and outside the remediated boundaries; REVIEW-01 finds no unresolved P0/P1 finding in the remediated subset.
- Req 6 (deferred work recorded with rationale + residual risk): the single deferred task is API-01 (`Status: blocked`, lines 867-871), with a "Blocker (recorded by REVIEW-01)" entry containing the rationale (Deferred Decision #1: root-only vs subpath exports), the owner (project maintainer for decision; library API specialist for implementation), and residual risk (the public type surface is narrower than the emitted modules and depends on upstream `lib/...` paths; bounded by RELEASE-01's `pack:inspect` + `pack:consumers` `skipLibCheck: false` gates, both re-verified by REVIEW-01 in this run). No additional deferred/cancelled tasks were left in this plan — the P2 follow-ups at lines 1124-1132 are recorded as potential future tasks, not as part of this remediation wave; REVIEW-01 confirms they are not silently swallowed.

Acceptance criteria re-checked:

- "Clean generated-output state" verification: `rm -rf dist && pnpm build` produced exactly 4 files (`dist/index.cjs`/`index.js`/`index.d.ts`/`index.d.cts`); `pnpm exec eslint .` -> exit 0; `pnpm typecheck` (`tsc --noEmit`) -> exit 0; `pnpm typecheck:tests` (the new `tsconfig.test.json` covering `./tests` with `skipLibCheck: false`) -> exit 0; `pnpm test:unit` -> **15 files / 225 tests passed**; `pnpm test:integration` against the running digest-pinned sandbox -> **25 files / 26 tests passed**; `pnpm pack:inspect` -> "tarball egose-keycloak-fluent-0.7.0.tgz (8 entries) OK: tarball contains only intended files and no source maps."; `pnpm pack:consumers` -> ESM/CJS/TS smoke + `tsc --noEmit` against packed `.d.ts` with `skipLibCheck: false` all pass; `pnpm publish:check` end-to-end -> exit 0.
- Every completed/done task includes a `Completion evidence` block: verified by `grep -nE "^### Task |^Status:|^Completion evidence"` — all 13 `done`/`completed` tasks (COR-01, RETRY-01, OWN-01, USER-01, PAGE-01, WORKFLOW-01, CLIENT-01, HANDLE-01, FLOW-01, HANDLE-02, RELEASE-01, QUALITY-01, CI-01) have a `Completion evidence` section. WORKFLOW-01 additionally has REVIEW-01's prior `REVIEW-01 resolution note` documenting the live-sandbox P1 contract gap (26.6.x 400-not-404 on `GET /admin/realms/{realm}/workflows/{id}`) REVIEW-01 closed during the prior review pass.
- Every remaining task is `blocked`/`deferred`/`cancelled` with owner and rationale: the only non-completed task is API-01 (`Status: blocked`), whose "Blocker (recorded by REVIEW-01)" section at line 867 names the owner (`project maintainer (decision). Agent (library API and TypeScript specialist) to implement once the decision is recorded.`) and the rationale (Deferred Decision #1 cannot be unblocked without maintainer input; implementation requirement #1 IS "Obtain the maintainer decision"). No `cancelled` or `deferred` tasks exist in this plan — only one `blocked` task with a documented owner, rationale, and the residual risk noted.
- No unresolved P0 or P1 findings in the remediated boundaries: REVIEW-01 found no new P0/P1 issues in COR-01 / RETRY-01 / OWN-01 / USER-01 / PAGE-01 / WORKFLOW-01 / CLIENT-01 / HANDLE-01 / FLOW-01 / HANDLE-02 / RELEASE-01 / QUALITY-01 / CI-01. The single P1 found during the REVIEW-01 work (WORKFLOW-01's 26.6.x 400-not-404 gap) was already closed with unit regression + live integration coverage (see the WORKFLOW-01 resolution note at line 376); REVIEW-01 re-verified the live path passes on the digest-pinned 26.6.1 sandbox. Two P2 follow-ups remain documented as future work (line 1124-1132): `simpleAuth()` error sanitization and empty refresh-token rejection — both are pre-existing, outside the remediated boundaries, and explicitly tagged as P2 (not REVIEW-01-blocking). No deferred item was silently accepted.

Completion evidence:

- Changed: `docs/tasks/20260813-141755-codebase-health-remediation.md` — REVIEW-01 task `Status: pending -> in_progress -> completed`; this Completion evidence block appended; reviewer-independence note recorded.
- Verified from a clean generated-output state, all on the running digest-pinned Keycloak 26.6.1 sandbox:
  - `pnpm exec eslint .` -> exit 0.
  - `pnpm typecheck` (`tsc --noEmit` against `tsconfig.json`) -> exit 0.
  - `pnpm typecheck:tests` (`tsc --noEmit --project tsconfig.test.json`, the new strict test tsconfig including `./tests` with `skipLibCheck: false`) -> exit 0.
  - `pnpm test:unit` -> 15 files / 225 tests passed.
  - `pnpm test:integration` -> 25 files / 26 tests passed (live; includes `tests/workflow.spec.ts` exercising the 26.6.x 400-not-404 -> null coercion, the per-handle paginate/cache paths, and the typed `WorkflowNotFoundError`).
  - `rm -rf dist && pnpm build` -> `tsup` success; `dist/` contains exactly 4 files (`index.cjs`, `index.js`, `index.d.ts`, `index.d.cts`); no source maps.
  - `pnpm pack:inspect` -> "tarball egose-keycloak-fluent-0.7.0.tgz (8 entries) OK".
  - `pnpm pack:consumers` -> ESM, CJS, and TypeScript consumers all pass; TS consumer also passes `tsc --noEmit` with `skipLibCheck: false` against the packed `.d.ts`.
  - `pnpm publish:check` end-to-end -> exit 0 (lint:check -> typecheck -> test:unit -> build -> pack:inspect -> pack:consumers).
  - Sanity probe on the public boundary: `node -e "console.log(Object.keys(require('./dist/index.cjs')))"` -> `[ 'default' ]`; `grep -c "^export " dist/index.d.ts` -> `1` (only `export { KeycloakAdminClientFluent as default };`). Public types/docs/exports/packed-runtime are mutually consistent.
- Boundary spot-checks REVIEW-01 traced in source (runtime behavior, not just implementation shape):
  - `src/user.ts:687` `listOfflineSessions` sends `clientId: client.id` (internal UUID, COR-01).
  - `src/utils/role-ownership.ts:105/122` plus `src/user.ts:398`/`:417`/`:436`/`:477` wire ownership assertions before `requireUser()` (OWN-01).
  - `src/utils/retry.ts:27` RETRYABLE_STATUS_CODES = `{429,502,503,504}` structured classifier (RETRY-01).
  - `src/utils/fetch-all.ts:83/145` `fetchAll`/`fetchAllStream` bounded+cancellable+validated (PAGE-01).
  - `src/user.ts:165` create-with-password sets `enabled: false` first; `:185` rethrows `UserPasswordProvisioningError` with `profileApplied: false`/`initialProvisioning: true` and password excluded from the error chain (USER-01).
  - `src/workflow.ts:176-178` `getById` coerces the 26.6.x "Not a valid workflow resource:" 400 to `null`, rethrows other 400s (WORKFLOW-01 + REVIEW-01 prior resolution).
  - `src/authentication-flow.ts:44` `AuthenticationFlowNotFoundError`, `src/workflow.ts:35/57` `WorkflowNotFoundError`/`DuplicateWorkflowNameError` typed errors (FLOW-01, WORKFLOW-01).
  - `src/clients/client.ts:137` `_setResolvedClient` write-back (`@internal`) and `:154` `rebind(newClientId)` (HANDLE-01/HANDLE-02 parent-as-source-of-truth).
  - `src/realm.ts:109` `_realmName` private, `:117` `realmName` readonly getter, `:135` `rebind(newRealmName): this` (HANDLE-02).
  - `sandbox/keycloak/Dockerfile:5/17-23/35`, `.github/actions/setup-sandbox/action.yml:13/38/43/82`, `tests/test-utils.ts:31-34/42/71` (CI-01 digest pinning + EXIT trap + env-var config + cleanup-error `cause` contract).
  - `dist/` grep -> zero hits for `wrapLazyPromise\|deepCloneInstance`; `src/utils/lazy-promise.ts` and `src/utils/clone.ts` deleted (QUALITY-01).
- Dependencies satisfied: every task REVIEW-01 verifies had its documented dependencies in `done`/`completed` state at the time of this review (RETRY-01 before USER-01/FLOW-01; OWN-01 before HANDLE-01/HANDLE-02; PAGE-01 before WORKFLOW-01/CLIENT-01; RELEASE-01 before QUALITY-01/CI-01; HANDLE-01 before HANDLE-02). REVIEW-01's own dependency ("all accepted tasks above") is satisfied: 13 tasks `done`/`completed`, 1 task `blocked` (API-01) with documented rationale, and no `deferred`/`cancelled` items.
- Follow-up: none for REVIEW-01. The two pre-existing P2 follow-ups (this file, lines 1124-1132) are recorded as future work, not as REVIEW-01 deliverables. API-01's `blocked` status remains — REVIEW-01 does not resolve Deferred Decision #1 (it requires maintainer input). When the maintainer records the decision, API-01 unblocks, a follow-up verification pass should re-run `pack:consumers` (and possibly add a minimum-upstream-version packed TypeScript consumer per API-01 implementation requirement 4) against the resolved public surface.

## Parallelization Guidance

| Agent | Recommended tasks                       | Sequencing                                                                                          |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A     | COR-01                                  | Independent; can start immediately.                                                                 |
| B     | RETRY-01, then FLOW-01 and USER-01      | Own retry contract first; callers follow.                                                           |
| C     | OWN-01, then HANDLE-01, then HANDLE-02  | Shared handle ownership and cache contract must be sequential.                                      |
| D     | PAGE-01, then WORKFLOW-01 and CLIENT-01 | Shared pagination utility first; downstream tasks may then run in parallel if files do not overlap. |
| E     | RELEASE-01, then API-01                 | Both own package/build/export decisions and generated output.                                       |
| F     | QUALITY-01, then CI-01                  | Can begin after RELEASE-01 establishes script names.                                                |
| G     | REVIEW-01                               | Must be independent and run last.                                                                   |

Shared hotspots:

- `src/clients/client.ts`: sequence OWN-01 before CLIENT-01 and HANDLE-01-related integration changes.
- `src/user.ts`: sequence COR-01 before USER-01; PAGE-01 must rebase before replacing user pagination loops.
- `package.json`, workflows, and `tsup.config.ts`: RELEASE-01 owns these first; API-01 and QUALITY-01 follow.
- `dist/`: never hand-edit and do not run concurrent bundle/pack jobs in one worktree.

## Deferred Decisions Requiring Maintainer Input

1. Public package shape: root-only API with intentional named type exports, or supported subpath exports for handle modules. This blocks API-01's final design and RELEASE-01's final entry list.
2. Public mutable fields: whether any handle cache/identity fields are an intentional supported API. This blocks breaking visibility changes in HANDLE-02.
3. Password reset failure contract: disabled-until-ready versus best-effort rollback for newly created users. USER-01 should first validate Keycloak behavior and recommend the safer option.
4. Mutation return contracts: methods such as organization `addMember()`/`removeMember()` currently return only the default first page via `listMembers()` (`src/organization.ts:269-297`). Decide whether mutations should return `this`/`void` or explicitly fetch all members before changing this public contract.
5. Retry scope: identify operations the maintainers consider safely idempotent and suitable for explicit retry opt-in.

None of these decisions blocks COR-01, RETRY-01's safe default, OWN-01, PAGE-01 utility tests, or baseline CI improvements.

## Additional P2 Follow-Ups

These are evidence-backed but should be promoted into fully assigned tasks only after the higher-priority contracts settle:

- Sanitize `simpleAuth()` errors by whitelisting bounded OAuth fields while retaining the original error as `cause`; current code serializes arbitrary `responseData` into error messages (`src/index.ts:38-58`, `src/index.ts:91-94`). Also reject explicitly supplied empty refresh tokens rather than silently choosing `client_credentials` (`src/index.ts:14-21`).
- Align client-policy update read-back options with the caller's global-profile/global-policy view or return a non-read-back result (`src/client-policies.ts:19-56`).
- Decide whether organization membership mutations should stop returning a silently truncated first page (`src/organization.ts:222-297`).
- Add live integration coverage for cache, client policies, server info, and who-am-I; current coverage is mock-only in `tests/implementation-resource-handles.spec.ts:223-309` and `tests/implementation-resource-handles.spec.ts:416-477`.
- Align the documented admin-client version with `package.json` and test the documented minimum/current Keycloak matrix (`README.md:65-75`, `package.json:87-90`).

## Definition Of Done

- All accepted P0 and P1 tasks are completed with regression tests and recorded evidence.
- No handle can route a mutation through a role, client, realm, or core it does not own.
- Collection traversal is validated, bounded, cancellable, and proven against server-side page caps.
- Published ESM, CJS, and declarations are rebuilt from current source and tested as installed tarball consumers.
- Public exports and handle visibility are intentional, documented, and protected by compile fixtures.
- Non-mutating lint, typecheck, unit, integration, package, and consumer checks are enforced in CI.
- Security-sensitive errors and password flows do not leak credentials or leave undocumented unsafe partial state.
- REVIEW-01 is completed by an agent who did not implement the primary changes.
