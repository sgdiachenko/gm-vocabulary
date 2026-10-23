---
name: frontend-architecture
description: Where to put new frontend code in apps/gm-vocabulary and how to split it. Use when adding or moving a component, page, dialog, service, store, constant, enum, util/helper, model/type, form, guard, interceptor or route, when deciding whether to split a component, or when reviewing frontend structure. Covers placement, naming, component split and business-logic layering only; for Angular API usage (signals, forms, DI, routing, testing) use angular-developer instead.
---

# Frontend architecture and code placement

Scope: `apps/gm-vocabulary/src/app`. Angular API details live in `.agents/skills/angular-developer`; import boundaries are enforced by `local/folder-boundaries` (`npm run test:boundaries`) and are not repeated here. Details and examples: `references/placement-matrix.md`. Sources: `references/sources.md`.

## Rules for new code
Existing code is not refactored on harness work. Follow these for new files; do not mass-rename legacy ones.

1. **Feature-first.** Group by feature (`features/<domain>/<feature>/`), never by code type. No top-level `components/`, `services/`, `utils/`, `helpers/` folders.
2. **Colocate.** `.ts`, `.html`, `.scss`, `.spec.ts` share a folder and base name. Logic-bearing units get a `.spec.ts`.
3. **Place by consumers.** One feature uses it: keep it in that feature. A second feature needs it: move it to `shared/<topic>/` (`ui`, `forms`, or a new topic folder). `shared/` never imports `features/`. No `core/` folder. No new Nx libraries (root AGENTS.md).
4. **One concept per file**, named after its main identifier in kebab-case. Never `utils.ts`, `helpers.ts`, `common.ts`, `constants.ts`, `types.ts`.
5. **Naming of new files:** no type suffix for components, directives, pipes and services (`word-card.ts` → `WordCard`); the class name carries the role. Keep `.spec.ts`, and the existing `.const.ts`, `.enum.ts`, `.util.ts` suffixes for non-class files. Routed pages: class `<Name>Container`, file `<name>-container.ts`.
6. **Where each kind goes**

| Kind | Location |
|---|---|
| Routed page | `<feature>/<page>/` as a container |
| Presentational component | folder of the owning feature, or `shared/ui/<name>/` if generic |
| Dialog | component + `<name>-data.ts` (+ form file) in one folder |
| HTTP calls | `<feature>-api` service, nothing else |
| Orchestration | feature service: calls API, writes the store |
| State | one SignalStore per feature slice, root-provided; stores never call other stores |
| Pure domain logic | exported function in `<action>.util.ts` beside its consumer, unit-tested |
| Constants | `<name>.const.ts` beside the consumer, narrow in scope |
| Enums | `<name>.enum.ts` |
| Models / DTOs | `contracts/` in the feature, one type per file |
| Form model + validation | beside the form; validation rules in one schema |
| Injection tokens | `<name>.token.ts` (+ `provideX()` if configurable) |
| Guards / interceptors | functional, in the feature that owns them |
| Routes | `app.routes.ts`, lazy `loadComponent`; extract `<feature>.routes.ts` only when it grows unwieldy |

## Business logic
Components do presentation: bind inputs/outputs, handle events, derive view state with `computed`. They hold no HTTP and no domain rules. Logic needing DI belongs in a service; logic that does not need DI is a pure function. Do not drive business logic from `effect`. Keep writable signals private; expose `asReadonly()` or `computed`; mutate through methods.

## Splitting components
Split when one of these holds: the component has more than one responsibility; the template is long or deeply nested (about 150+ lines); a `@for` item has its own logic; a part is reused or independently testable. Do not split just to shrink files.
- **Container:** injects services/stores, passes data down, handles outputs.
- **Presentational:** `input()`/`output()`/`model()` only; no store, no HTTP.
- Shared UI is generic: no domain names, no feature imports.

## Legacy facts to know, not to fix
- Collections code uses the `word-group*` name (matches the `wordgroups` Mongo collection); do not rename.
- Existing files use `.component`/`.container`/`.service`/`.store` suffixes; three files lack them. Editing an existing file keeps its name and style. Every new file follows rule 5, even when it is added to a legacy folder. Never rename or restructure legacy files as a side effect of other work.
- `words-table.service.ts` and `shared/ui/snack-bar/` mix concerns; do not copy that pattern.
- KI-08 (stores append arrays, refetch can duplicate) and KI-04 (interceptor not origin-limited): see `docs/known-issues.md`.
- Auth localStorage keys (`AuthParameterEnum`) must not be renamed.

## Checklist before finishing
- New file sits in the owning feature, or in `shared/` with 2+ consumers.
- No generic file names; one concept per file; spec beside it.
- No domain logic in a component; no HTTP outside `*-api`.
- If structure rules changed, update `docs/architecture/project-structure.md` in the same change.
- Run `npm run lint` and `npm run test:boundaries`.
