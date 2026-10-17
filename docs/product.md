# Product and user scenarios

Reviewed: 2026-10-17. Reverse-engineered behavior baseline for the current
personal project, not a retrospective claim about approved original requirements.

## Purpose

GM Vocabulary lets a learner organize words with optional translations and
descriptions, group them into collections, reuse shared content and preview
selected vocabulary. It is not currently a documented LMS or spaced-repetition
system; learning efficacy and production usage have not been measured here.

## Supported scenarios

| Scenario | Current behavior | Implementation |
|---|---|---|
| Create an account and sign in | Signup validates account input and hashes the password; login returns a time-limited JWT and identity | [API auth](../apps/api/src/modules/auth/auth.service.ts) |
| Open a protected page | Client guard directs unauthenticated users to auth; API independently verifies Bearer credentials | [Routes](../apps/gm-vocabulary/src/app/app.routes.ts), [API guard](../apps/api/src/modules/auth/guards/jwt-auth.guard.ts) |
| Resume or end a session | Browser restores unexpired persisted auth, schedules expiry logout and handles 401; there is no refresh/revocation flow | [Auth lifecycle](../apps/gm-vocabulary/src/app/features/auth/auth.service.ts), [interceptor](../apps/gm-vocabulary/src/app/features/auth/auth-interceptor.ts) |
| Manage personal vocabulary | Add, list, edit and bulk-delete words; mutations use authenticated owner identity | [Words controller](../apps/api/src/modules/vocabulary/words/words.controller.ts), [service](../apps/api/src/modules/vocabulary/words/words.service.ts) |
| Organize collections | Create, list, edit, bulk-create and delete collections; reads populate associated words | [Collection controller](../apps/api/src/modules/vocabulary/collections/word-collections.controller.ts), [service](../apps/api/src/modules/vocabulary/collections/word-collections.service.ts) |
| Browse shared collections | Authenticated readers can access shared collections; shared does not mean anonymous public access | [Collection reads](../apps/api/src/modules/vocabulary/collections/word-collections.service.ts) |
| Copy shared words | Copy words from another user's shared collection into new records owned by the current user, without the source groupId | [Copy implementation](../apps/api/src/modules/vocabulary/words/words.service.ts) |
| Filter personal words | Filter loaded words by collection and word/translation text in client state | [Words store](../apps/gm-vocabulary/src/app/features/vocabulary/words/words.store.ts) |
| Preview vocabulary | Navigate selected words and toggle word/translation/description visibility | [Preview](../apps/gm-vocabulary/src/app/features/vocabulary/words/words-preview-dialog/words-preview-dialog.ts) |
| Sign in with a legacy account | A missing/blank username is backfilled during login in the existing users collection | [Auth service](../apps/api/src/modules/auth/auth.service.ts), [integration contracts](../apps/api/test/contracts.e2e-spec.ts) |

## Boundaries and gaps

- Browser visibility is not authorization. Server identity and owner-scoped
  operations remain the security boundary, with the current gaps below.
- Word-to-collection ownership and collection deletion semantics are not fully
  enforced. See [known issues](known-issues.md); do not describe current CRUD as
  complete referential integrity or tenant isolation.
- A copied word is an independent record, not a subscription to source updates.
  Idempotent retry and duplicate prevention are not established guarantees.
- Current list/filter behavior does not demonstrate large-dataset scalability.
- OIDC/SSO, role management, audit trails, SRS, quizzes, payments, offline sync
  and other future capabilities are not established by this baseline.

For changes, define intended behavior and acceptance criteria in the task or
feature specification. Update this baseline after implementation is verified;
do not silently promote ideas or open questions to supported features.
