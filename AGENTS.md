# gm-vocabulary — AGENTS.md

Personal vocabulary app: Angular SPA + NestJS API + MongoDB in an Nx monorepo.
Docs describe the current implementation, not an approved roadmap. Do not infer
product requirements or historical decisions from plausible code. Keep code and
its relevant documentation aligned in the same change. Do not load the whole
docs set into every task; source, contracts and focused tests confirm context.

## Stack
- Node 24 (CI 24.15.0), npm 11.6.1 (`npm ci`), Nx 23.2, TypeScript ~6.0 strict
- Angular 22 / NestJS 12 / Mongoose 9 / MongoDB 7 (Compose image)
- Unit and API integration tests: Vitest 4; browser E2E: Playwright 1.62 (Chromium)

## Commands (from package.json / CI)
- install: `npm ci`; env: copy `.env.example` to `.env`, set `JWT_SECRET`
- run: `npm run docker:up` (everything), or MongoDB + `npm run start:server` + `npm start`
- build: `npm run build` · lint: `npm run lint` · types: `npm run typecheck`
- unit: `npm run test:ci` · import rules: `npm run test:boundaries`
- API integration: `MONGODB_URI=mongodb://127.0.0.1:27028/gm_structure_local JWT_SECRET=x npm run test:api:e2e`
- browser: `npm run e2e`
- one project: `npx nx test gm-vocabulary --watch=false`, `npx nx test api --run`
- CI order: lint → boundaries → typecheck → unit → build → API integration → Playwright

## Map
- `apps/gm-vocabulary/` — Angular app (own AGENTS.md)
- `apps/api/` — NestJS API (own AGENTS.md)
- `apps/gm-vocabulary-e2e/` — Playwright tests (own AGENTS.md)
- `apps/*/INSIGHTS.md` — per-module findings log; `.claude/skills/engineering-insights/` — skill that writes it
- `tools/eslint/` — local `folder-boundaries` rule and its tests
- `docs/` — project context; `.agents/skills/` — vendored Angular skill

## Conventions (non-default)
- Product code lives in the owning app. A new library needs a concrete independent
  consumer or build boundary; never one library per screen, schema or layer.
- Relative imports only. `@gm-vocabulary/*` aliases were removed and are rejected.
- Tests, templates and styles sit beside the owning code.
- Boundaries (enforced by `local/folder-boundaries`): frontend ↔ API forbidden;
  shared UI/forms ↛ features; auth ↛ vocabulary; words ↔ collections allowed.
- No facade or repository abstraction added for symmetry.

## Gotchas
- API integration tests throw unless `MONGODB_URI` is loopback `gm_structure_*`
  and `JWT_SECRET` is set. Use disposable data for Playwright as well.
- `docker:up` runs `npm ci` inside the containers on every start.
- Files in `docs/architecture/` other than project-structure and the ADR are
  historical; their verification results do not prove checks pass now.
- Auth is an intermediate design (JWT in localStorage); see known issues.

## Do not touch
- `package-lock.json` — change only through npm.
- `.env` — secrets; never read or commit.
- `.agents/skills/`, `skills-lock.json` — vendored, hash-locked.
- `dist/ .nx/ out-tsc/ playwright-report/ test-results/` — generated, gitignored.
- Mongo model names `Auth`/`Word`/`WordCollection` and collections `users`/`words`/
  `wordgroups`: the repo has no migration files or tooling, so a rename orphans
  existing data. Pinned by `apps/api/test/contracts.e2e-spec.ts`.
- Retained contracts: `/api` prefix, ports 3000/4200, outputs `dist/apps/api` and
  `dist/gm-vocabulary/browser`, Vercel SPA rewrite.

## Read when…
- Read `README.md` when setting up, running the project or choosing checks.
- Read `docs/README.md` first when a task needs project context beyond one module.
- Read `docs/product.md` when changing observable behavior.
- Read `docs/architecture/project-structure.md` when changing imports, state, API or persistence.
- Read `docs/architecture/adr/0001-simplify-workspace-retain-nx.md` when questioning the workspace layout.
- Read `docs/known-issues.md` when fixing a bug or assessing risk.
- Read `docs/open-questions.md` when a requirement or policy is ambiguous.
- Read the module's own `AGENTS.md` before editing in `apps/*`; it loads when you touch its files.
- Read the module's `INSIGHTS.md` (next to its `AGENTS.md`) before changing it; at the end of
  substantial work run `/engineering-insights` (`.claude/skills/`). Capture is append-only.
