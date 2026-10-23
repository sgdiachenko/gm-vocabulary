# api — INSIGHTS

Lessons, gotchas and decisions learned while working in this module.
Read before changing the module; append a new entry after non-obvious findings
(see the `engineering-insights` skill, `/engineering-insights`).
Record facts with evidence; do not duplicate `docs/` or `AGENTS.md`.

Maintenance: append-only. Entries are agent drafts reviewed by a human in Git.
Review monthly for stale or contradicting entries; around 200+ entries signal
quality is dropping, so split by domain. Delete or rewrite only in a separate
reviewed commit, never during capture.

## Entry template

### YYYY-MM-DD — short title
- **Context:** what task or symptom led here
- **Finding:** what was non-obvious
- **Evidence:** file, command or test that shows it
- **Action:** what to do or avoid next time

## What Works

## What Doesn't Work

## Codebase Patterns

## Tool & Library Notes

## Recurring Errors & Fixes

### 2026-10-23 — Missing JWT_SECRET: login returns 500, every protected route returns 401
- **Context:** diagnosing an API that boots fine but rejects all requests; relates to KI-05 (no startup config validation) but adds the symptoms.
- **Finding:** `JwtModule.register({})` has no secret, so the secret is read from `process.env` per call in two places with different failure modes. `login()` throws a plain `Error('JWT_SECRET is not configured')` (HTTP 500). `JwtAuthGuard` passes `secret: undefined` to `verifyAsync`, and its catch-all turns that into `UnauthorizedException('Authentication failed')` (401), indistinguishable from a bad token. `signup` does not touch the secret.
- **Evidence:** `src/modules/auth/auth.module.ts:11`, `src/modules/auth/auth.service.ts:35-39`, `src/modules/auth/guards/jwt-auth.guard.ts:23-29`. Read from code; not reproduced by a running request.
- **Action:** when all protected routes give 401 with otherwise valid tokens, or login gives 500, check `JWT_SECRET` in the API process environment first (Compose/`.env`). Unit specs must set and restore it (see `auth.service.spec.ts:9-34`).

## Session Notes

## Open Questions
