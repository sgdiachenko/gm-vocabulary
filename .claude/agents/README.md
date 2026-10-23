# Project agents

Registry of the Claude Code subagents defined in this directory. Each agent is
one `<name>.md` file with YAML frontmatter and a prose system prompt. Claude
decides when to delegate from the `description` field, so keep it accurate.

Last verified against the files: 2026-10-23.

## Agents

| Agent | Role | Tools | Writes files | Model |
|-------|------|-------|--------------|-------|
| [`researcher`](researcher.md) | Finds and verifies information in the repo and in external sources; returns a cited report. | Read, Grep, Glob, WebSearch, WebFetch, AskUserQuestion, Notion read tools, Claude Docs read tools | No | sonnet |
| [`planner`](planner.md) | Turns a requirement into a structured Development Plan (tasks, owned files, skills, insights, acceptance criteria, checks, parallel-safety). Returns the plan as text. | Read, Grep, Glob | No | opus |
| [`implementer`](implementer.md) | Implements one approved plan task in an isolated git worktree, runs the task's checks, returns a report. Several can run in parallel on disjoint tasks. | Read, Grep, Glob, Edit, Write, Bash, Skill | Yes (only the task's owned files) | sonnet |

Typical flow: `researcher` (optional, for open questions) → `planner` → user
approves the plan → one `implementer` per task, parallel only within a wave →
the main session merges the worktrees and runs `/pr-self-review`.

None of the agents can spawn other agents. No agent commits or pushes; the main
session does. Only the `/engineering-insights` skill writes `INSIGHTS.md`.

## Practices each agent relies on

**`researcher`**
- Read-only by construction: no write tools and no shell.
- Interview mode: ask or return a `Clarification needed` section instead of guessing.
- Source priority: repository, then connected corporate sources, then vendor docs, then other web.
- Every non-trivial claim carries a citation and a confidence label; gaps are reported, not filled from memory.
- Fixed output structure with an explicit "Not found / not checked" section.

**`planner`**
- Read-only; the plan comes back as text, so it cannot drift into writing code.
- Preloads the skills that implementers will follow, so the plan complies with them: `ddd-conventions`, `frontend-architecture`, `nestjs-backend-architecture`, `angular-developer`.
- Follows the repo's own routing from `AGENTS.md`; loads only the docs the task needs.
- Selects engineering insights per touched module with targeted grep, never by reading every `INSIGHTS.md`.
- Self-contained tasks: exclusive `owned_files`, out-of-scope, exact checks, testable acceptance criteria.
- Parallel tasks only with disjoint write sets and no shared contract.

**`implementer`**
- One approved task per run; stops if required task fields are missing or `Do not touch` needs a user decision.
- `isolation: worktree`, and `worktree.baseRef: "head"` in [`.claude/settings.json`](../settings.json) so the worktree branches from the current local `HEAD` (commit before launching).
- Loads only the skills named in the task, so frontend and backend sets are not mixed.
- Reads only the insights assigned to the task; proposes new entries in its report.
- Runs the task's checks and reports evidence (command and result), not assertions.
- No `Agent` tool, no commits, no pushes, no dependency changes.

## Sources

Fetched and checked by the maintainer on 2026-10-23 unless stated otherwise.

### `planner` and `implementer`

| Source | URL | What it supports | Status |
|--------|-----|------------------|--------|
| Create custom subagents (Claude Code docs) | https://code.claude.com/docs/en/sub-agents | Frontmatter fields `name`, `description`, `tools`, `disallowedTools`, `skills`, `isolation`, `maxTurns`; "Claude uses each subagent's description to decide when to delegate tasks."; `isolation: worktree` | Verified (first 100,000 of about 111,000 characters read) |
| Run parallel sessions with worktrees | https://code.claude.com/docs/en/worktrees | Subagents in their own worktrees via `isolation: worktree`; `worktree.baseRef` `"fresh"` (default) vs `"head"`; gitignored files such as `.env` are not copied | Verified |
| Best practices for Claude Code | https://code.claude.com/docs/en/best-practices | Self-contained specs naming files, scope and a verification step; "Give Claude a check it can run"; evidence over assertions; separate reviewer; hooks are deterministic | Verified |
| Configure permissions | https://code.claude.com/docs/en/permissions | "Bash permission patterns that try to constrain command arguments are fragile." (reason no Bash allow-list or hook is used) | Verified for that statement only |
| How we built our multi-agent research system (Anthropic Engineering, 2025-06-13) | https://www.anthropic.com/engineering/multi-agent-research-system | "Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries." | Verified for that statement and date; it is about research agents, not coding agents |

Claims taken from the same pages that were relayed by the `researcher` agent but
not re-read by the maintainer: skills are injected in full into the subagent;
`AGENTS.md`/`CLAUDE.md` load in subagents; subagent nesting depth and the
advice to omit `Agent` from `tools`; `PreToolUse` hooks as a Bash backstop.
Treat them as unverified until re-checked.

The plan-task schema in `planner.md` and its output contracts are this
project's own design. No official schema was found, and none is cited.
Disjoint write sets for parallel tasks are likewise the project's inference.

### `researcher`

No sources were recorded when this agent was written, and none are claimed here.
Its definition contains only a dated note on which connectors were available.
If you can name the references it was based on, add them with a verification
status.

## Adding a new agent

1. **Check you need one.** Add an agent for a role with its own tool limits, output contract or isolation. A one-off prompt, or a procedure the main session should run itself, is a skill or a plain prompt instead.
2. **Create `.claude/agents/<name>.md`.** The file name equals `name:`. Only `name` and `description` are required. A file with a missing `name` or `description`, or invalid YAML, is silently skipped.
3. **Write a focused `description`:** what it is, when to use it, what it returns, what it never does. Claude uses it to decide delegation.
4. **Grant least privilege.** List only the `tools` the role needs. Add `disallowedTools: Agent` unless nesting is intended. Unknown frontmatter fields are ignored without an error, so check the field spelling against the sub-agents page above.
5. **Choose context.** Use `skills:` to preload skills the agent always needs, or the `Skill` tool plus per-task instructions to load them on demand. Root and module `AGENTS.md` load automatically. State what the agent must read and what it must never read (`.env`, generated output).
6. **Define the output contract** in the prompt: fixed structure, evidence rules, and an explicit "not found / not checked" section.
7. **Write hard limits** at the end of the prompt: what it never edits, runs or spawns.
8. **Add isolation** (`isolation: worktree`) if it writes files and may run in parallel with others.
9. **Register it here:** add a row to the Agents table, a short list of the practices it relies on, and its sources. Mark every link `Verified` only after you opened it; otherwise write `Not verified` or omit the link.
10. **Keep docs aligned:** update the `.claude/agents/` line in the root `AGENTS.md` Map if the set of agents changes.
11. **Test it:** run `/agents` to confirm it is listed, then give it a small real task and check that it respects its tool limits and output format.
12. **Commit** the agent and this README together.
