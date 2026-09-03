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

- `libs/api/auth/feature` owns the JWT module, guard, identity decorator, and authenticated request contracts.
- `libs/api/users/feature` owns signup and login use cases.
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
