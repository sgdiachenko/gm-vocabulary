---
name: nestjs-backend-architecture
description: Layering, dependency direction and code placement for apps/api (NestJS + Mongoose). Use when adding or changing a controller, service, DTO, entity/schema, module, guard, pipe, filter, config or business rule in the API, or when reviewing backend structure and imports. Covers structure and boundaries only; domain language and contexts are in ddd-conventions.
---

# NestJS backend architecture

Scope: `apps/api/src`. The principle from Onion/Clean architecture is kept: source dependencies point inward and inner code never imports outer code. The full structure (domain entities, repositories, mappers) is not used, because the domain is small CRUD and root AGENTS.md forbids abstractions added for symmetry. Import matrix: `references/layering-matrix.md`. Sources: `references/sources.md`.

Rules apply to NEW code. Existing code is not refactored on harness work.

## Real layers
presentation (controller, DTO, guard, pipe) -> application (service) -> persistence (`@Schema` entity + `@InjectModel`). Modules compose them. Pure domain logic is optional and sits beside its service.

## Rules for new code
1. **Direction.** Controller calls service; service calls the Mongoose model. Controllers, DTOs, guards and pipes do not import `mongoose`, `@nestjs/mongoose` or `*.entity.ts`. Only services and `*.module.ts` do.
2. **No repository by default.** Service plus `@InjectModel` is the documented NestJS path. Add a port only for a real second implementation or a needed test seam; then use an abstract class as the injection token.
3. **Business rules.** A rule needing no DI is a pure function or class in the module folder with no Nest or Mongoose imports, unit-tested. The service orchestrates it. Ownership scoping always includes the authenticated user id in the query.
4. **DTOs.** Request DTOs use class-validator; ids are strings in DTOs and converted in the service. New endpoints return explicit response DTOs (plain objects), not Mongoose documents, so `userId`, `__v` and virtuals do not leak.
5. **Config.** Inject `ConfigService`; no new `process.env` access; fail at startup on missing required values.
6. **Modules.** One module per domain feature: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.entity.ts`, `dto/`, plus `guards/`, `decorators/` where needed. Share across modules through `exports`, not by registering another module's schema. Avoid `forwardRef`. No barrel `index.ts` for modules or providers.
7. **Context boundary.** Auth never imports vocabulary; `common/` imports no domain module; other modules do not import vocabulary `*.entity.ts` (all lint-enforced).
8. **Errors.** Throw `HttpException` subclasses (e.g. `NotFoundException`); use `APP_FILTER` only if translation is needed. Foreign-owner access returns 404.
9. **Tests.** Colocated `*.spec.ts` for controllers and services; integration tests in `apps/api/test/` against real MongoDB (loopback `gm_structure_*`, `JWT_SECRET` set). Prefer testing pure domain functions directly over mocking Mongoose methods.
10. **Pinned contracts.** Never rename `Auth`/`Word`/`WordCollection` or collections `users`/`words`/`wordgroups`, and keep response shapes in `test/contracts.e2e-spec.ts`. Any such change needs a planned data migration agreed with the user.

## Legacy facts to know, not to fix
- Controllers and `common/pipes/parse-object-id.pipe.ts` import `Types` from mongoose.
- Word and collection controllers return raw Mongoose documents (leaking `userId`, `__v`).
- `JWT_SECRET` and `PORT` come from `process.env`; `MONGODB_URI` from `ConfigService`; no startup validation (KI-05).
- `WordsService` injects the `WordCollection` model; each vocabulary module registers the other's schema.
- Ownership and copy rules are inline Mongo queries.
- `docs/architecture/project-structure.md` says controllers call "Mongoose models"; in code only services do.

## Enforcement
Lint (`local/folder-boundaries`, `npm run test:boundaries`) covers only the cross-module rules in item 7. Intra-module layer rules (rule 1) are convention. Adding them (e.g. `eslint-plugin-boundaries` or `no-restricted-imports` with per-folder overrides) is a separate reviewed change to `tools/eslint`.

## Checklist
- Controllers and DTOs have no mongoose/entity imports.
- Rule is a named pure function if it is more than a field check.
- Every owner-scoped query filters by the authenticated user id.
- No new `process.env`, repository, mapper or `forwardRef` without a stated reason.
- Spec beside the code; contracts untouched; update docs in the same change if rules changed.
- Run `npm run lint`, `npm run test:boundaries`, `npx nx test api --run`.
