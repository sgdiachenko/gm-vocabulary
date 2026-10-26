# Routing

Hint table. Discovery of skills in step 2 may add more. Paths match changed files.

| Changed paths | Skills to apply | Deterministic checks |
|---|---|---|
| `apps/gm-vocabulary/src/**` | `frontend-architecture`, `ddd-conventions`, `angular-developer` (`.agents/skills`) | `npm run lint`, `npm run typecheck`, `npx nx test gm-vocabulary --watch=false` |
| `apps/api/src/**` | `nestjs-backend-architecture`, `ddd-conventions` | `npm run lint`, `npm run typecheck`, `npx nx test api --run` |
| `apps/api/test/**` | `nestjs-backend-architecture` | ask before `test:api:e2e` (needs loopback `gm_structure_*` MongoDB and `JWT_SECRET`) |
| `apps/gm-vocabulary-e2e/**` | that module's AGENTS.md | ask before `npm run e2e` |
| `tools/eslint/**` | root AGENTS.md boundaries | `npm run test:boundaries`, `npm run lint` |
| `package.json`, lockfile, `*.config.*`, `project.json` | root AGENTS.md "Do not touch" | `npm run typecheck`, `npm run build` (ask) |
| `docs/**`, `**/AGENTS.md`, `.claude/**` | docs-sync check; skill format (frontmatter name/description) | none |
| any non-trivial code change | built-in `code-review` (correctness); `security-review` when auth, env, tokens or dependencies change | none |

Notes:
- Read each module's `AGENTS.md` before judging files in it.
- If a routed skill file does not exist, record `skipped: skill not found`.
