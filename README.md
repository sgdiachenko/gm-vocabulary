# GM Vocabulary

GM Vocabulary uses Angular 22, NestJS 12 and MongoDB/Mongoose in an Nx 23 workspace.
There are three projects: the browser application, the API and Playwright E2E.
Product code lives in domain folders inside each application.

```text
apps/gm-vocabulary/src/app/
  shell/                       layout and navigation
  features/auth/               authentication, session state, guard and interceptor
  features/vocabulary/words/   word screens, dialogs, HTTP services and store
  features/vocabulary/collections/ collection screens, services and store
  shared/ui/                   reusable controls, dialogs and feedback
  shared/forms/                contracts, validation and field helpers
apps/gm-vocabulary/src/environments/
apps/gm-vocabulary/src/styles/

apps/api/src/
  common/                      pipes and validators
  modules/auth/                authentication module and schema
  modules/vocabulary/words/    words module and schema
  modules/vocabulary/collections/ collections module and schema
apps/api/test/                 integration tests with disposable MongoDB
apps/gm-vocabulary-e2e/src/    browser tests
```

Angular uses standalone components, Signals, Signal Forms, NgRx SignalStore,
RxJS, Angular Material and Tailwind. Nest requests follow controller → service
→ Mongoose. Auth and vocabulary remain separate; words and collections can
cooperate inside vocabulary. Files use local imports, and ESLint enforces folder
boundaries for relative paths and aliases. Lazy loading and provider scopes are
preserved. See [Project structure](docs/architecture/project-structure.md) and
[verification](docs/architecture/simplification-verification.md).


## Getting started

### Prerequisites

- Node.js 24
- npm 11
- Docker with Docker Compose, or a reachable MongoDB instance

Install dependencies:

```bash
npm ci
```

Copy `.env.example` to `.env` and replace the JWT placeholder with a long random value. `MONGODB_URI` is optional when using the default local MongoDB address.

```env
MONGODB_URI=mongodb://localhost:27017/gm-vocabulary
JWT_SECRET=replace-with-a-long-random-secret
```

### Run with Docker Compose

```bash
npm run docker:up
```

The Angular app is available at `http://localhost:4200`; the API listens at `http://localhost:3000/api`.

```bash
npm run docker:down
```

### Run locally

Start MongoDB, then run the API and frontend in separate terminals:

```bash
npm run start:server
```

```bash
npm start
```

## Development commands

| Command | Purpose |
| --- | --- |
| `npm start` | Serve Angular on port 4200 |
| `npm run start:server` | Serve the API on port 3000 |
| `npm run build` | Build both applications |
| `npm run lint` | Lint all projects and enforce import boundaries |
| `npm run typecheck` | Check Angular templates/app/tests and API app/tests |
| `npm run test:ci` | Run both unit suites without Nx cache |
| `npm run test:boundaries` | Check allowed and forbidden folder imports |
| `npm run test:api:e2e` | Run real-MongoDB API integration tests |
| `npm run e2e` | Run Playwright against local app/API servers |
| `npm run graph` | Open the Nx project graph |

For API integration tests, provide an isolated local MongoDB and test secret:

```bash
MONGODB_URI=mongodb://127.0.0.1:27028/gm_structure_local \
JWT_SECRET=local-test-secret npm run test:api:e2e
```

The integration test setup rejects default database names and non-loopback hosts.
Use disposable data for browser tests as well. CI runs both API integration and
Playwright tests against its MongoDB service.

While iterating, target one of the three projects:

```bash
npx nx test gm-vocabulary --watch=false
npx nx test api --run
npx nx lint api
npx nx build api
```

## Adding code

Add code to the owning application/domain folder, with tests/templates/styles
beside it. Keep auth separate from vocabulary and shared UI/forms independent of
features. New libraries need a concrete independent consumer or build boundary.
Do not generate a library for each screen, schema, technical layer or helper.

The API output stays at `dist/apps/api`; Angular output stays at
`dist/gm-vocabulary/browser`. The production Docker image installs only the
generated API runtime dependencies. Vercel retains its existing SPA rewrite.


## Authentication and security status

The current implementation provides bcrypt password hashing, JWT-protected endpoints, client route protection, automatic Bearer-token attachment, and server-side ownership checks. The access token is currently persisted in `localStorage`, and there is no refresh-token/session rotation flow. Treat the current authentication design as an intermediate stage, not a finished production security model.

Before a public production launch, address the prioritized findings in the [Architecture audit](docs/architecture/architecture-audit.md), especially token storage and rotation, secret management, word-to-collection integrity, rate limiting, health checks, and observability.
