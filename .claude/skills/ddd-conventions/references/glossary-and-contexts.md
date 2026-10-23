# Glossary and context map

Derived from current code and docs (2026-10-23). It describes what exists, not an approved roadmap. Extend it only from code or from an explicit user decision.

## Contexts
| Context | Backend | Frontend | Pinned persistence |
|---|---|---|---|
| Identity | `apps/api/src/modules/auth` | `features/auth` | model `Auth`, collection `users` |
| Vocabulary | `apps/api/src/modules/vocabulary/{words,collections}` | `features/vocabulary/{words,collections}` | models `Word` (collection `words`), `WordCollection` (collection `wordgroups`) |

Dependencies: Vocabulary -> Identity (authenticated user id, JWT guard, current-user decorator). Identity -> Vocabulary is forbidden by `local/folder-boundaries`. Inside Vocabulary, words and collections may use each other's contracts; today the API modules register each other's schemas (legacy, not a pattern to copy).

## Terms
| Term | Meaning in code | Where |
|---|---|---|
| User / Auth | An account with email, username, password hash; authenticates with a JWT | `Auth` entity, `features/auth` |
| Authenticated user | Id of the caller, set by the JWT guard; every vocabulary query is scoped to it | `CurrentUser`, `AuthenticatedUser` |
| Word | A vocabulary entry owned by a user, optionally in one collection | `Word` entity, `features/vocabulary/words` |
| Collection | A user-owned group of words | UI and folders: "collections"; code: `WordCollection`, `word-group*`; DB: `wordgroups` |
| Owner scoping | Rule: users only read or change their own words and collections; foreign access returns 404 | services; pinned by contracts test |
| Copy words | Duplicates words for the user without the source collection link | `WordsService`, contracts test |

## Known open items (do not resolve silently)
- Deleting a collection leaves its words (KI-02, OQ-01).
- Destination collection ownership is not verified on word create/update (KI-01).
See `docs/known-issues.md` and `docs/open-questions.md`.
