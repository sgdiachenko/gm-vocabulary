# Severity

Judge by impact of the change, not by how much a rule is liked.

## critical (blocks merge)
- Renames or alters pinned Mongo model names (`Auth`, `Word`, `WordCollection`), collections (`users`, `words`, `wordgroups`) or response shapes in `apps/api/test/contracts.e2e-spec.ts`.
- Breaks a lint boundary (`local/folder-boundaries`) or reintroduces `@gm-vocabulary/*` aliases.
- Queries on user data without owner scoping, or weakens auth/guard behavior.
- Reads or commits `.env`, secrets, or tokens; edits `package-lock.json` without a dependency change; edits `.agents/skills/` or `skills-lock.json`.
- `lint`, `typecheck`, unit tests or `test:boundaries` fail.

## major (fix before merge unless justified)
- Violates a rule of a routed skill in new code: mongoose/entity import in a controller or DTO, new `process.env`, business rule inside a component or controller, new repository/mapper/library without a stated reason, cross-context entity import.
- Behavior or structure change without docs/skill update.
- New logic without a spec.

## minor
- Naming, file placement within the right feature, small docs gaps, formatting not caught by tooling.

## info
- Observations, questions, existing backlog items (`docs/known-issues.md`).

Confidence: `high` (evidence is direct), `medium`, `low`. Low-confidence critical findings are reported as major with the uncertainty stated.
