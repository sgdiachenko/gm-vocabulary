# Known issues and limitations

Reviewed: 2026-10-17. Static source observations; no runtime checks were run for
this documentation change. Historical findings are retained only where the
relevant current source still supports them.

| ID | Observation and scope | Evidence / next verification |
|---|---|---|
| KI-01 | Word create/update converts groupId without verifying that the destination collection exists and belongs to the user | [Words service](../apps/api/src/modules/vocabulary/words/words.service.ts): create/update; verify foreign and missing destinations at API level |
| KI-02 | Collection deletion removes the collection but leaves the child-word policy unresolved | [Collection service](../apps/api/src/modules/vocabulary/collections/word-collections.service.ts): remove/TODO; policy choice is OQ-01 |
| KI-03 | Bearer credentials persist in localStorage; no refresh rotation or server revocation flow is present | [Auth lifecycle](../apps/gm-vocabulary/src/app/features/auth/auth.service.ts), [API auth](../apps/api/src/modules/auth/auth.service.ts); not a completed production session design |
| KI-04 | The auth interceptor adds credentials to any outgoing request when a token exists; it does not restrict destination origin | [Interceptor](../apps/gm-vocabulary/src/app/features/auth/auth-interceptor.ts); assess before introducing third-party HTTP calls |
| KI-05 | Runtime config has no startup schema validation; development Compose uses a placeholder JWT secret | [App module](../apps/api/src/app.module.ts), [Compose](../docker-compose.yml); development defaults are not production secret management |
| KI-06 | Read lists are unpaged; collection reads populate words; explicit owner/group indexes are not defined in the reviewed schemas | [Words](../apps/api/src/modules/vocabulary/words/words.service.ts), [collections](../apps/api/src/modules/vocabulary/collections/word-collections.service.ts), [word schema](../apps/api/src/modules/vocabulary/words/word.entity.ts), [collection schema](../apps/api/src/modules/vocabulary/collections/word-collection.entity.ts); externally created DB indexes are unknown |
| KI-07 | Health/readiness, application metrics/tracing, structured logging/redaction, auth throttling and restore verification are not established by this checkout | [Entrypoint](../apps/api/src/main.ts), [composition](../apps/api/src/app.module.ts), [historical audit](architecture/architecture-audit.md); absence of evidence is not a deployment assessment |
| KI-08 | Root entity stores append loaded arrays in some paths; repeated fetch without reset can duplicate state | [Words store](../apps/gm-vocabulary/src/app/features/vocabulary/words/words.store.ts), [collection store](../apps/gm-vocabulary/src/app/features/vocabulary/collections/word-groups.store.ts); static risk, not reproduced here |

## Verification limits

The [verification record](architecture/simplification-verification.md) reports
earlier local passes and an initial-bundle warning. Those results do not assert
current CI, preview, production settings or runtime performance. No new passing
test count, benchmark or deployment result is claimed here.

Issues are not accepted product requirements. Preserve unrelated behavior during
a refactor, but do not treat a listed defect as an invariant to retain forever.
Close an issue only with the relevant change and evidence of verification.
