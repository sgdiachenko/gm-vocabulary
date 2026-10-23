# api — AGENTS.md

## Stack
- NestJS 12, @nestjs/mongoose + Mongoose 9, @nestjs/jwt, bcrypt 6
- class-validator 0.15 / class-transformer
- Vitest 4 + supertest; webpack build via Nx

## Commands
- build: `npx nx build api` (output `dist/apps/api`)
- test: `npx nx test api --run` (`src/**/*.spec.ts`)
- integration: `MONGODB_URI=mongodb://127.0.0.1:27028/gm_structure_local JWT_SECRET=x npm run test:api:e2e`
- lint: `npx nx lint api`
- types: `npx tsc --noEmit -p apps/api/tsconfig.app.json` (and `tsconfig.spec.json`)
- run: `npm run start:server` (needs MongoDB and `JWT_SECRET`)

## Map
- `src/main.ts`, `src/app.module.ts` — bootstrap, `/api` prefix, global ValidationPipe
- `src/common/` — pipes and validators
- `src/modules/auth/` — auth module, schema, JWT guard, DTOs
- `src/modules/vocabulary/{words,collections}/` — module, controller, service, entity, DTOs
- `test/` — real-MongoDB integration tests (`*.e2e-spec.ts`)

## Conventions (non-default only)
- Flow is controller → service → Mongoose; no repository layer.
- ValidationPipe transforms DTOs, whitelists fields and rejects unknown properties.
- Environment access uses bracket syntax: `process.env['X']`.
- Services scope operations by the authenticated owner; JWT guard plus owner
  scoping is the trust boundary, not the client route guard.
- Boundaries: auth ↛ vocabulary; common ↛ domain modules; other domains ↛
  vocabulary entities; words ↔ collections allowed.

## Gotchas
- Integration setup refuses any URI that is not loopback `gm_structure_*`.
- Word create/update does not verify destination collection ownership (KI-01);
  collection delete leaves child words (KI-02, OQ-01). Do not change silently.
- Collection reads populate words; lists are unpaged.

## Do not touch
- Models `Auth`/`Word`/`WordCollection`. `Word` has no explicit `collection`, so
  Mongoose derives `words` from the class name; renaming the class changes the
  collection. `users`/`wordgroups` are set via `@Schema({ collection })`.
  No migration files or tooling exist; a rename or field change needs a data
  migration that must be planned first; agree it with the user before changing.
- `Dockerfile` stages `development`/`build`/`production`; Compose uses `development`.

## Read when…
- Read `README.md` (planned, not yet created) when it exists and you need API setup detail.
- Read `docs/` here when it holds a file for the area you change (currently empty);
  project-wide context is in the root `docs/README.md`.
- Read the relevant file in `specs/` before implementing a feature in this module.
- Read `INSIGHTS.md` before changing this module; append a new entry when you learn
  something non-obvious.
