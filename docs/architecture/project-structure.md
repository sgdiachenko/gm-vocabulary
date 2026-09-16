# Project structure

This workspace uses a grouped Nx layout. Deployable applications stay thin under `apps/`, while product code is grouped first by business domain and then by architectural role under `libs/`.

## Applications

- `apps/gm-vocabulary` owns Angular bootstrap, root providers, root routes, global styles, and deployment assets.
- `apps/api` owns Nest bootstrap and root infrastructure composition.
- `apps/gm-vocabulary-e2e` owns cross-application Playwright scenarios.

## Angular libraries

- `libs/gm-vocabulary/feature-shell` owns the authenticated application layout and navigation shell.
- `libs/gm-vocabulary/auth` owns authentication UI, feature orchestration, state/API access, and contracts.
- `libs/gm-vocabulary/vocabulary` owns word screens, editors, presentational tables, state/API access, and contracts.
- `libs/gm-vocabulary/collections` owns collection screens, editors, state/API access, and contracts.
- `libs/shared/ui` owns reusable presentational components and UI feedback helpers.
- `libs/shared/util` owns reusable types, validation, and framework-light helpers.
- `libs/shared/util-environments` owns compile-time frontend environment values.

Angular projects use `feature`, `ui`, `data-access`, and `util` type tags. Feature libraries may compose lower layers; UI libraries depend only on UI/util libraries; data-access libraries depend only on data-access/util libraries; util libraries depend only on util libraries.

## API libraries

- `libs/api/auth/feature` owns signup/login controllers and services, the JWT module, guard, identity decorator, and authenticated request contracts.
- `libs/api/auth/data-access` owns the `Auth` Mongoose schema.
- `libs/api/words/feature` and `libs/api/collections/feature` own HTTP controllers and application services.
- `libs/api/words/data-access` and `libs/api/collections/data-access` own Mongoose schemas.
- `libs/api/shared/util` owns reusable Nest pipes and validators.

Mongoose schemas are separate from feature modules so words and collections can use each other's models without a circular project dependency.

## Public APIs and dependency rules

Cross-project imports must use the aliases declared in `tsconfig.base.json`; imports into another project's `src/lib` implementation are forbidden. Scope and type constraints are enforced by `@nx/enforce-module-boundaries` in the root ESLint configuration.

Do not create empty `ui`, `data-access`, or `util` projects for symmetry. Add a project when it establishes a real ownership, dependency, testing, or caching boundary.

## Generating new Angular projects

Use a unique Nx project name and an explicit import path:

```bash
npx nx g @nx/angular:library libs/gm-vocabulary/<domain>/<type> \
  --name=gm-vocabulary-<domain>-<type> \
  --importPath=@gm-vocabulary/<domain>/<type> \
  --tags=scope:gm-vocabulary,domain:<domain>,type:<type> \
  --standalone=false --skipModule --strict
```

New projects should receive a project-local test target. Components should be generated into the owning library with `@nx/angular:component`, standalone APIs, the `gm` selector prefix, and tests enabled.

## Authentication boundary

`Auth` stores credentials and a display username in MongoDB's existing `users` collection. Renaming the model does not change account `_id` values. Words and collections retain their `userId` owner references; their Mongoose `ref` is `Auth`. Future user profiles/preferences and billing data belong to separate domains and refer to the same stable account ID.

The API exposes `POST /api/auth/signup` and `POST /api/auth/login`. Frontend and backend must be deployed together because the former `/api/user/*` endpoints are removed. Signup requires a nonblank username (trimmed, not unique) and returns public account data without the password or a token. Login still uses email/password and returns a token, expiry, userId, and username. A successful login fills a missing or blank legacy username from the part of email before `@` and persists it; existing names are preserved. No bulk database migration is required.

The frontend distinguishes `LoginCredentials`, `SignupRequest`, `SignupResponse`, and `LoginResponse`. Signup returns to the login form without authenticating. Login establishes the session and displays the username beside Logout. Username is restored from local storage and cleared on logout. Sessions saved before this change remain valid without a username; the header displays the name after the next successful login.
