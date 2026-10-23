# gm-vocabulary-e2e — AGENTS.md

## Stack
- Playwright 1.62 (`@playwright/test`), Chromium only
- Config lives at the repo root: `playwright.config.ts` (`testDir` is this app's `src/`)

## Commands
- run: `npm run e2e` (also `npm run e2e:ui`, `npm run e2e:headed`)
- Playwright starts `nx serve api` and `nx serve gm-vocabulary` itself and reuses
  running servers outside CI. Needs MongoDB, `MONGODB_URI` and `JWT_SECRET`.

## Map
- `src/auth.spec.ts` — signup, login, redirects, validation
- `src/collections.spec.ts`, `src/words.spec.ts`, `src/navigation-copy.spec.ts` — vocabulary flows

## Conventions (non-default only)
- Each test registers its own unique user (timestamp + random email); keep tests independent.
- Use role/placeholder locators, as the existing specs do.
- Tests run fully parallel locally and with 1 worker plus 2 retries in CI.

## Gotchas
- Tests write real data. Use a disposable local MongoDB, never a shared or production URI.
- The API readiness probe is `GET /api/words` returning 401; the root `/api` returns 404.
- `playwright-report/` and `test-results/` are generated and gitignored.
- Locators match visible text (for example `h1` "Login", button "Signup"); changing
  UI copy in the app breaks specs, so update them together.

## Do not touch
- `playwright-report/`, `test-results/` — generated output.

## Read when…
- Read `README.md` (planned, not yet created) when it exists and you need E2E setup detail.
- Read `docs/` here when it holds a file for the area you change (currently empty);
  project-wide context is in the root `docs/README.md`.
- Read the relevant file in `specs/` before implementing a feature in this module.
- Read `INSIGHTS.md` before changing this module; append a new entry when you learn
  something non-obvious.
