# gm-vocabulary (Angular app) — AGENTS.md

## Stack
- Angular 22 (standalone, Signals, Signal Forms), Angular Material/CDK 22
- NgRx SignalStore 22, RxJS 7.8, Tailwind 4 + SCSS
- Unit tests: `@angular/build:unit-test`, `**/*.spec.ts` under `src/`

## Commands
- run: `npm start` (port 4200; needs the API on 3000)
- build: `npx nx build gm-vocabulary --configuration=production`
- test: `npx nx test gm-vocabulary --watch=false`
- lint: `npx nx lint gm-vocabulary`
- types: `npm run typecheck` (also checks API; Angular part uses `ngc --noEmit`)

## Map
- `src/app/shell/` — layout and navigation
- `src/app/features/auth/` — auth service, store, guard, interceptor, auth page
- `src/app/features/vocabulary/{words,collections}/` — pages, dialogs, API services, stores, `contracts/`
- `src/app/shared/ui/`, `shared/forms/` — reusable controls and form helpers
- `src/environments/`, `src/styles/` — environment files, Sass helpers

## Conventions (non-default only)
- Selector prefix `gm`; generated components use SCSS and `OnPush`.
- Pages are `*.container` components, routed with `loadComponent` (keep lazy).
- Per feature: orchestration service + HTTP API service + root-provided SignalStore.
- `shared/` must not import `features/`; `features/auth` must not import `vocabulary`.
- Relative imports only; aliases are rejected by ESLint.
- Production budgets: initial 500kB warn / 1MB error; component style 4kB / 8kB.

## Gotchas
- `environment.ts` holds the production API URL; the development build swaps in
  `environment.development.ts` via file replacement.
- Stores append loaded arrays in some paths; refetch without reset can duplicate (KI-08).
- Interceptor attaches the token to any request when one exists (KI-04); review
  before adding third-party HTTP calls.
- The route guard is navigation assistance only; the server enforces access.

## Do not touch
- `.agents/skills/` at the repo root — vendored Angular skill, hash-locked.
- `localStorage` keys (`AuthParameterEnum`) in `features/auth/` unless the task is
  auth: a renamed key means stored sessions are no longer restored.

## Read when…
- Read `README.md` (planned, not yet created) when it exists and you need app setup detail.
- Read `docs/` here when it holds a file for the area you change (currently empty);
  project-wide context is in the root `docs/README.md`.
- Read `.agents/skills/angular-developer/SKILL.md` when writing or reviewing Angular code.
- Read the relevant file in `specs/` before implementing a feature in this module.
- Read `INSIGHTS.md` before changing this module; treat entries as hints to verify.
  After substantial work, propose an append via `/engineering-insights` only if
  there is a new confirmed non-obvious finding.
