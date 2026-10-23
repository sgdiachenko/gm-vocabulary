# Layering matrix (apps/api/src)

"Allowed" is what new code may import. Legacy code may violate rows marked (legacy).

| Layer / file kind | May import | Must not import |
|---|---|---|
| Pure domain logic (`*.rules.ts`-style function or class, no DI) | TypeScript only, other pure domain code | `@nestjs/*`, `mongoose`, entities, DTOs |
| DTO (`dto/*.dto.ts`) | class-validator, class-transformer, `@nestjs/mapped-types`, `common/validators` | `mongoose`, entities, services |
| Entity (`*.entity.ts`) | `@nestjs/mongoose`, `mongoose` | services, controllers, DTOs |
| Service (`*.service.ts`) | Nest common, `@InjectModel`, `mongoose` types, own entity, DTOs, pure domain code, `ConfigService`, auth contracts | controllers, other contexts' entities |
| Guard / pipe / decorator | Nest, `@nestjs/jwt`, `ConfigService` | `mongoose` (legacy: `parse-object-id.pipe.ts` does), entities |
| Controller (`*.controller.ts`) | Nest, DTOs, own service, guards, decorators, pipes | `@nestjs/mongoose`, entities (legacy: imports `Types` from mongoose) |
| Module (`*.module.ts`) | everything it composes, `MongooseModule.forFeature` for its own entities | other modules' entities (legacy: words <-> collections) |
| `common/` | Nest, class-validator | `modules/**` (lint-enforced) |

## Cross-module rules (lint-enforced)
- `modules/auth` -> `modules/vocabulary`: forbidden.
- `common` -> `modules`: forbidden.
- modules outside `vocabulary` -> `vocabulary/**/*.entity.ts`: forbidden.
- frontend <-> API: forbidden.

## Examples in the repo
- Service with model injection: `modules/vocabulary/words/words.service.ts`.
- Request DTO with validation: `modules/auth/dto/signup.dto.ts`.
- Guard: `modules/auth/guards/jwt-auth.guard.ts`; current user: `modules/auth/decorators/current-user.decorator.ts`.
- Hand-built response object (preferred over raw documents): `AuthService.signup/login` in `modules/auth/auth.service.ts`.
- Pinned contracts: `apps/api/test/contracts.e2e-spec.ts`.
