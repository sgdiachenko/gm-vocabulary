# Open questions

Reviewed: 2026-10-17. These are unresolved choices, not approved plans or implemented
features. The assigned IDs let future tasks refer to a question without repeating
the whole project investigation.

| ID | Decision needed | Current evidence / why it matters |
|---|---|---|
| OQ-01 | On collection deletion, reject while non-empty, detach words or cascade-delete? What atomicity/retry behavior is required? | Current remove only deletes the collection; KI-02. Decide before changing persistence behavior |
| OQ-02 | Should assigning a word to a collection require ownership only? How should missing, foreign or shared destinations be rejected? | Current validation checks identifier shape, not destination ownership; KI-01. Existing shared-copy behavior must be considered separately |
| OQ-03 | What session storage, expiry, refresh, logout and revocation model should a public deployment use? | Current localStorage JWT flow is an intermediate design; KI-03/OQ-04 |
| OQ-04 | Which API origins may receive credentials, and what abuse/configuration controls are required before launch? | Current interceptor has no origin restriction; config validation and rate limits remain gaps |
| OQ-05 | What dataset sizes, query latencies and browser-memory budgets should drive pagination/index/cache decisions? | Current client filters and populated lists are suitable only within an unmeasured envelope |
| OQ-06 | Should repeated shared-copy requests be idempotent, and how should users manage duplicates? | Current copy creates independent new words; no established deduplication policy |
| OQ-07 | What deployment/recovery evidence is required to call a release ready? | Hosting settings, health, observability, backup/restore and rollback checks are not verified here |
| OQ-08 | Which learning workflow should come next, and how will usefulness be evaluated? | Current vocabulary management/preview is implemented; SRS, quizzes and learning-outcome claims are not |

When a decision is made, record its acceptance and rationale in the appropriate
feature spec or significant ADR, implement and verify it, then resolve the linked
question/issue. Do not invent an owner, deadline or historical rationale.
