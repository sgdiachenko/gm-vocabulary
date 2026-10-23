---
name: ddd-conventions
description: Domain language, bounded contexts and DDD-lite rules shared by the frontend and the API. Use when naming domain concepts, deciding which context code belongs to, adding a feature that touches words, collections or auth, or deciding whether a business rule deserves a domain function, value object or aggregate. Not for folder placement (use frontend-architecture or nestjs-backend-architecture).
---

# DDD conventions (DDD-lite)

Strategic DDD (language, contexts) is the default. Tactical DDD (aggregates, value objects, repositories) is opt-in, because the domain is small CRUD and the sources advise tactical patterns only for complex business rules. Glossary and context map: `references/glossary-and-contexts.md`. Sources: `references/sources.md`.

Rules apply to NEW code. Existing code is not renamed or restructured on harness work. Do not invent product requirements; terms and rules below come from current code and docs only.

## Rules
1. **Ubiquitous language.** Use the glossary terms in code, tests, UI strings and docs. A new domain term is added to the glossary in the same change. Do not introduce synonyms.
2. **Two bounded contexts.** Identity (auth) and Vocabulary (words, collections). Identity never depends on Vocabulary (lint-enforced). Vocabulary uses Identity only through its public contract: the authenticated user id.
3. **Contexts do not share entities.** Cross-context data travels as ids or plain contract types, never as another context's persistence class or store.
4. **Folders follow the domain**, not technology: a feature or module is named after a domain concept (see the placement skills for exact layout).
5. **Business rules are explicit.** A rule that is more than a field check (ownership, eligibility, uniqueness, state transition) lives in a named, framework-free function or class, unit-tested, with the rule stated in its name. It is not buried in a component, controller or inline query.
6. **Tactical patterns only for real invariants.**
   - Domain function: default for a rule.
   - Value object: when a value has validation or behavior reused in 2+ places.
   - Aggregate: only when several objects must change together under one invariant. Not needed for plain CRUD.
   - Repository, mapper, facade: not by default (root AGENTS.md: no abstraction added for symmetry).
7. **Domain code is framework-free.** Frontend domain code imports no Angular; backend domain code imports no Nest or Mongoose. Services, stores and components call it; it calls nothing outward.
8. **Contracts are pinned.** Mongo model names, collection names and response shapes stay as they are (`apps/api/test/contracts.e2e-spec.ts`).

## Known language split (do not fix)
The UI and the folders say "collections"; backend and store files say `word-group*` and `WordCollection`; MongoDB uses `wordgroups`. Use "collection" in new UI-facing and folder names, keep `WordCollection`/`word-group*` where they already exist, never rename pinned names.

## Checklist
- Used glossary terms; added new ones to the glossary.
- Code stays inside its context; no cross-context entity import.
- Any non-trivial rule is a named pure function with a unit test.
- No repository, mapper or aggregate added without a stated invariant.
- Then follow `frontend-architecture` or `nestjs-backend-architecture` for placement.
