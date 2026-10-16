# Project structure

The workspace contains three Nx projects: `gm-vocabulary`, `api`, and
`gm-vocabulary-e2e`. Product code lives in the application that owns it. Nx still
orchestrates builds, lint, tests, development servers, and backend packaging.

```text
apps/
├── gm-vocabulary/
│   └── src/
│       ├── app/
│       │   ├── app.ts, app.config.ts, app.routes.ts
│       │   ├── shell/page-wrapper/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── auth-page/, auth-form/, contracts/
│       │   │   │   └── services, store, guard, interceptor
│       │   │   └── vocabulary/
│       │   │       ├── words/
│       │   │       │   ├── words-page/, word-edit-dialog/
│       │   │       │   ├── words-table/, words-preview-dialog/, contracts/
│       │   │       │   └── services and store
│       │   │       └── collections/
│       │   │           ├── collections-page/, single-collection-page/
│       │   │           ├── collection-edit-dialog/, contracts/
│       │   │           └── services and store
│       │   └── shared/
│       │       ├── ui/       controls, table, dialogs, feedback and error helpers
│       │       └── forms/    form contracts, validation and field helpers
│       ├── environments/
│       └── styles/           shared Sass helpers and reset
├── api/
│   ├── src/
│   │   ├── main.ts, app.module.ts
│   │   ├── common/pipes/, common/validators/
│   │   └── modules/
│   │       ├── auth/         module, controller, service, entity, DTOs, guards
│   │       └── vocabulary/
│   │           ├── words/       module, controller, service, entity, DTOs
│   │           └── collections/ module, controller, service, entity, DTOs
│   └── test/                real-MongoDB API integration tests
└── gm-vocabulary-e2e/src/   Playwright tests
tools/eslint/               folder boundary rule and regression tests
```

Tests, templates and component styles sit beside the owning code. Imports are
relative and point to the required file; library aliases and library barrels
have been removed. Route components remain lazy-loaded.

## Boundaries

`eslint.config.js` retains Nx project checks and enables the local folder rule:

- Frontend and backend cannot import each other.
- Shared UI/forms cannot import features.
- Auth cannot import vocabulary on either platform.
- API common helpers cannot import domain modules.
- Other backend domains cannot import vocabulary entities.
- Words and collections may use each other's existing contracts, services and
  components within vocabulary.

The rule resolves relative imports and TypeScript aliases, checks re-exports,
dynamic imports and type imports, and rejects removed `@gm-vocabulary/*`
aliases. `npm run test:boundaries` exercises allowed and forbidden examples.

Do not add a facade, repository abstraction, or library solely for symmetry.
Keep services and stores separate until an independent behavior change justifies
changing their responsibilities.

## Compilation, tests and cache

`tsconfig.base.json` enables `strict` and `strictTemplates`; application and
specification compilation retain the other existing strict checks.
`npm run typecheck` checks Angular templates/application/tests and API
application/tests/configs. API environment accesses use bracket syntax to retain
`noPropertyAccessFromIndexSignature` without changing behavior.

- Angular has one unit target, discovering `**/*.spec.ts` inside its source root.
- API has one unit target, discovering `src/**/*.spec.ts`.
- `test:api:e2e` discovers only `test/**/*.e2e-spec.ts`, uses production prefix
  and ValidationPipe settings, and preserves Nest decorator metadata.
- E2E setup refuses a missing/default database URI. Use a disposable loopback
  MongoDB URI with a database name beginning `gm_structure_` and a test JWT secret.

Nx test inputs include application sources, specs and configs. Shared inputs
include root TypeScript/package/lockfile/Nx configs; lint additionally includes
the root ESLint config and local rule files. Build production inputs exclude
unit and integration tests. Existing Nx plugins and generators are retained.

## Runtime and deployment

Angular routes, providers, session storage keys, timers and cleanup stay with
their original owners. Auth remains separate from vocabulary. Nest retains
`AuthModule`, `WordsModule`, `WordCollectionsModule`, and the current model
registrations, including both vocabulary schemas where required.

Mongo model names remain `Auth`, `Word`, `WordCollection`; physical collections
remain `users`, `words`, `wordgroups`. References and the `words` populate virtual
remain unchanged. No data migration is required.

Build outputs remain `dist/apps/api` and `dist/gm-vocabulary/browser`. Docker,
Compose service names/volumes, API prefix, ports, production environment URL and
Vercel SPA rewrites retain their existing contracts. Development environment
replacement now points to `apps/gm-vocabulary/src/environments`.

See [ADR 0001](adr/0001-simplify-workspace-retain-nx.md), the
[implementation plan](simplification-plan.md), and the
[verification record](simplification-verification.md). Earlier architecture
audits describe the pre-migration workspace and remain historical evidence.
