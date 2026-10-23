---
name: pr-self-review
description: Self-review of local changes before opening a pull request. Analyzes the git diff, routes changed files to the repo's own skills (frontend, backend, DDD, docs) and to deterministic checks, then reports structured findings with severity and a merge-readiness verdict. Use when the user runs /pr-self-review or asks to review their changes before a PR. Manual invocation only; read-only, it never edits code.
---

# PR self-review

Read-only. Never edit, stage, commit or push. Report only; fixes are the user's decision. Routing table: `references/routing.md`. Severity rules: `references/severity.md`. Output format: `references/report-template.md`.

## Arguments
- Scope: `branch` (default: `main...HEAD` plus uncommitted and untracked), `staged`, or `working-tree`.
- `--quick`: deterministic checks only, no skill-based analysis.
- `--gate`: also write the verdict file (step 8).

## Steps
1. **Diff.** Collect the changed file list and the diff for the chosen scope (`git diff --name-status`, `git diff`, `git ls-files --others --exclude-standard`). If the diff is empty, say so and stop.
2. **Discover skills.** Read `description` of every `.claude/skills/*/SKILL.md` and `.agents/skills/*/SKILL.md`. Use `references/routing.md` as a hint, but any discovered skill whose description matches a changed area is also in scope. Never run `engineering-insights` or this skill.
3. **Deterministic checks** for touched areas only (see routing). Run `npm run lint`, `npm run typecheck`, `npm run test:boundaries`, and `npx nx test <project> --run` for touched projects. Do not run `build`, API integration or Playwright without asking (slow, need MongoDB). A check you did not run is listed as `skipped: <reason>`, never as passed.
4. **Skill analysis** (skip with `--quick`). For each routed skill, read its SKILL.md and apply its rules to the added and changed lines only. Legacy code the diff does not touch is not a finding.
5. **Extra checks** (all scopes):
   - *Contracts:* the diff changes Mongo model names, `@Schema({ collection })`, or response shapes pinned by `apps/api/test/contracts.e2e-spec.ts`.
   - *Docs sync:* behavior, structure or rules changed without a matching update in `docs/`, `AGENTS.md` or the relevant skill (repo rule: code and docs change together).
   - *Do-not-touch:* any changed path in the root AGENTS.md "Do not touch" list (`package-lock.json` not via npm, `.env`, `.agents/skills/`, `skills-lock.json`, generated dirs).
6. **New vs backlog.** Mark each finding `new` (introduced by this diff) or `existing` (already in `docs/known-issues.md` or untouched legacy). Only `new` findings affect the verdict; `existing` ones are listed once, collapsed.
7. **Verdict.** Any `new` critical: `NOT READY TO MERGE`. Else any `new` major: `READY WITH CHANGES`. Else `READY`. Print blockers first.
8. **Gate (only with `--gate`).** Write `.claude/pr-review/<branch>.md` with verdict, `git rev-parse HEAD`, UTC time and findings. A verdict is stale if HEAD differs. Overriding a `NOT READY` verdict requires an explicit user instruction, recorded with its reason. Hooks are out of scope for now.

## Rules
- Every finding carries evidence (file:line quote or command output). No evidence, no finding.
- Do not invent rules; cite the skill or doc that states each one.
- Be explicit about what was not checked.
