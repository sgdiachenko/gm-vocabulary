# Placement matrix (examples from the current repo)

Paths are relative to `apps/gm-vocabulary/src/app`. "Legacy" = existing convention, shown for orientation; new files follow SKILL.md rule 5.

| Need | Put it | Repo example |
|---|---|---|
| New routed page | `features/<domain>/<feature>/<page>/<page>-container.ts` + html/scss/spec | legacy: `features/vocabulary/words/words-page/words-page.container.ts` |
| Child presentational component | next to its parent feature | `features/vocabulary/words/words-table/` |
| Generic UI used by 2+ features | `shared/ui/<name>/` | `shared/ui/button/`, `shared/ui/table/` |
| Reusable form field | `shared/ui/form-fields/<name>/` taking `input.required<Field<T>>()` | `shared/ui/form-fields/input/` |
| Form-only helpers (validators, messages) | `shared/forms/` | `strict-email-validator.util.ts`, `form-field-validation-messages.const.ts` |
| Feature HTTP client | `<feature>/<name>-api` service | `words-api.service.ts` |
| Feature orchestration | `<feature>/<name>` service | `words.service.ts` |
| Feature state | `<feature>/<name>.store.ts` (SignalStore, root) | `words.store.ts` |
| Table column definitions | `.const.ts` beside the table | `words-table-columns.const.ts` |
| Domain types | `<feature>/contracts/<type>.ts` | `features/vocabulary/words/contracts/word.ts` |
| Dialog input data | beside the dialog | `word-edit-dialog-data.ts` |
| Functional guard / interceptor | owning feature folder | `features/auth/auth-guard.ts` |
| Environment values | `environments/` | `environment.vocabularyApiUrl` |

## Decision flow for a new piece of code
1. Does it render UI? Yes: component. Routed: container. Otherwise presentational.
2. Does it call HTTP? Put it in the feature's API service only.
3. Does it hold shared state? Feature SignalStore.
4. Does it need DI? Service. No DI: pure function in a `.util.ts`.
5. Is it a fixed value or label? `.const.ts` or `.enum.ts`.
6. Is it a data shape? `contracts/`.
7. Is it used by a second feature? Move to `shared/<topic>/`, not before.
