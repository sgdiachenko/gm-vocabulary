# Express comparison API

For the decision-level comparison, see [NestJS and Express architecture trade-offs](../../docs/architecture/nest-vs-express.md).

This is an alternative implementation of the current Nest API for architectural comparison. It was recovered from commit `3335c19` (the last revision before the Express-to-Nest migration) and adapted to the current Nx workspace and current `/api/auth`, `/api/words`, and `/api/collections` contract. The original code had older routes and authorization bugs; this variant deliberately matches the current Nest behavior instead of preserving those defects.

## Run

Start MongoDB, set `JWT_SECRET` and optionally `MONGODB_URI` in the root `.env` file, then run `npx nx serve api-express`. It listens on port 3001 by default so it can run beside the Nest API on port 3000. Set `PORT=3000` when running one API at a time with the unchanged frontend. The two servers use the same MongoDB collections; use separate databases if running experiments with both at once.

Run `npx nx test api-express` and `npx nx lint api-express` for this project's checks. This comparison target runs directly from JavaScript source; it does not create a deployable production bundle.

## Compare the implementation

| Concern | Express version | Nest version |
| --- | --- | --- |
| Composition | `src/app.js` calls route factories and supplies models and a JWT middleware | `AppModule` imports feature modules; Nest resolves providers |
| Routes | Express `Router` in `auth.js`, `words.js`, and `collections.js` | Decorated controllers in `libs/api/*/feature` |
| Authentication | `authenticate()` middleware attached to routers | `JwtAuthGuard` on controllers and `@CurrentUser()` |
| Validation | Explicit functions in `validation.js` called by handlers | DTO decorators and global `ValidationPipe` |
| Persistence | Plain Mongoose schemas in `models.js`, manually passed to routes | `MongooseModule.forFeature()` and `@InjectModel()` |
| Errors | Explicit `HttpError` and `errorHandler()` | Nest exception classes and exception pipeline |

Both versions still need application-level ownership rules. In both, updates and deletes filter by authenticated `userId`. They also share two outstanding product invariants: assigning `groupId` does not verify collection ownership, and deleting a collection can leave words pointing to it. Neither framework solves these automatically.
