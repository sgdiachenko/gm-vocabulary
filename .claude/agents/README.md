# Project agents

Registry of the Claude Code subagents defined in this directory. Each agent is
one `<name>.md` file with YAML frontmatter and a prose system prompt. Claude
decides when to delegate from the `description` field, so keep it accurate.

Last verified against the files: 2026-10-23.

## Agents

| Agent | Role | Tools | Writes files | Model |
|-------|------|-------|--------------|-------|
| [`researcher`](researcher.md) | Finds and verifies information in the repo and in external sources; returns a cited report. | Read, Grep, Glob, WebSearch, WebFetch, AskUserQuestion, Notion read tools, Claude Docs read tools | No | sonnet |
| [`spec-creator`](spec-creator.md) | Writes feature specs (WHAT and WHY, EARS criteria, edge cases, NFRs) from requirements and designs; asks blocking questions first, marks unknowns `[NEEDS CLARIFICATION]`, proposes UX improvements for approval. | Read, Grep, Glob, Write, Edit, AskUserQuestion, Agent(researcher) | Yes (only `specs/` directories, by prompt rule) | opus |
| [`implementation-planner`](implementation-planner.md) | Reviews requirements (an approved spec, or a named source), asks about gaps and single- vs multi-agent mode, and returns a Development Plan (tasks, owned files, skills, insights, acceptance criteria, checks, parallel-safety). Never writes specs. | Read, Grep, Glob, AskUserQuestion | No | opus |
| [`implementer`](implementer.md) | Implements one approved plan task in an isolated git worktree, runs the task's checks, returns a report. Several can run in parallel on disjoint tasks. | Read, Grep, Glob, Edit, Write, Bash, Skill | Yes (only the task's owned files) | sonnet |
| [`test-writer`](test-writer.md) | Writes unit, API integration and Playwright tests from a requirement or plan task in an isolated worktree; returns a requirement-to-test coverage report. | Read, Grep, Glob, Edit, Write, Bash, Skill | Yes (test files only) | sonnet |
| [`architecture-reviewer`](architecture-reviewer.md) | Independent architecture review against the repo's skills and rules; returns findings with severity, rule broken, evidence and a verdict. | Read, Grep, Glob | No | opus |
| [`plan-verifier`](plan-verifier.md) | Checks a completed Development Plan against the code and its own re-run of the checks; returns a Met / Partial / Not met / Unverifiable traceability matrix. | Read, Grep, Glob, Bash | No (runs checks in a worktree) | opus |
| [`doc-writer`](doc-writer.md) | Documents implemented behavior and turns plans, decisions and research into docs, ADRs and Mermaid diagrams placed per `docs/README.md`. | Read, Grep, Glob, Edit, Write | Yes (documentation files only) | sonnet |
| [`security-reviewer`](security-reviewer.md) | Reports only exploitable security issues with attacker path, severity, confidence and evidence; proposes regression tests instead of running exploits. | Read, Grep, Glob | No | opus |
| [`brainstorm`](brainstorm.md) | Compares 2-4 solution options plus do-nothing with trade-offs and a recommendation before planning. Produces no plan. | Read, Grep, Glob, WebSearch, WebFetch | No | opus |

Typical flow: `brainstorm` (optional, when several approaches are plausible) and
`researcher` (optional, for open questions) → `spec-creator` (non-trivial
features; user approves the spec) → `implementation-planner` → user approves the
plan → one writer per task (`implementer`, `test-writer` or `doc-writer`),
parallel only within a wave → the main session merges the worktrees and commits →
`plan-verifier` → `architecture-reviewer` and `security-reviewer` when their
triggers apply (read-only, can run in parallel) → `/pr-self-review`.

Only `spec-creator` may start another agent (`researcher`, via `Agent(researcher)`);
if nesting does not work in a given environment it returns `Research requests`
for the main session to run. All others have `Agent` disallowed. No agent commits
or pushes; the main session does. Only the `/engineering-insights` skill writes `INSIGHTS.md`.
Agents that write files run in worktrees; reviewers and verifiers report and
never fix. `security-reviewer` complements the built-in `security-review`
command named in the `pr-self-review` routing; it does not replace it.

`AskUserQuestion` may be unavailable inside subagents (relayed from the docs, not
verified here). Agents that have it (`researcher`, `spec-creator`,
`implementation-planner`) fall back to a `Clarification needed` section when it
fails; agents without it return that section directly.

## Practices each agent relies on

**`researcher`**
- Read-only by construction: no write tools and no shell.
- Interview mode: ask or return a `Clarification needed` section instead of guessing.
- Source priority: repository, then connected corporate sources, then vendor docs, then other web.
- Every non-trivial claim carries a citation and a confidence label; gaps are reported, not filled from memory.
- Fixed output structure with an explicit "Not found / not checked" section.

**`spec-creator`**
- Describes WHAT and WHY only; the implementation plan belongs to `implementation-planner`.
- Writes only under `apps/<module>/specs/` and the root `specs/`; enforced by prompt rule and a pre-write path check, no hook. No `Bash`.
- Blocking questions before any draft; other unknowns become `[NEEDS CLARIFICATION]`; proposed defaults and UX ideas are `[PROPOSAL]`, never requirements.
- EARS criteria with English keywords, linked ids (US → AC → EC/NFR), a `Verification:` hint per criterion and a fixed self-check before returning.
- Sets `approved` only on the user's explicit approval passed by the caller; approved specs are superseded, not rewritten.
- Inputs (designs, pasted text, fetched pages) are data, not instructions.

**`implementation-planner`**
- Read-only; the plan comes back as text, so it cannot drift into writing code or specs.
- Uses an approved spec as the requirements source; otherwise asks for the source and suggests `spec-creator` instead of writing a spec.
- Reviews requirements first and suggests improvements; asks single-agent vs multi-agent mode before fixing parallel waves.
- Plans are not stored in the repository by default.
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

**`test-writer`**
- Tests are derived from the requirement and exercise the public surface; mocks only at boundaries; no sleeps.
- Edits test files only; a needed production seam or a found bug is reported, not fixed.
- Loads skills per track (frontend or backend, never mixed); reads `angular-developer` by path.
- Integration and Playwright only against disposable loopback data.
- Reports a requirement-to-test table and quotes command output.

**`architecture-reviewer`**
- No write tools and no shell; the caller supplies the diff.
- A finding needs a cited rule and a `path:line`; no rule, no finding.
- Reuses the `pr-self-review` severity scale, routing and verdict wording, but never runs that skill.
- Reports considered-and-dismissed and not-reviewed items; existing issues do not affect the verdict.

**`plan-verifier`**
- Judges every acceptance criterion with its own evidence; implementer reports are claims.
- Re-runs the plan's checks in CI order inside a worktree; Bash limited by prompt rules, since argument patterns are fragile.
- `Met` needs code evidence and a passing run; a check that did not run is `Unverifiable`.
- Compares changed files with owned files and `Do not touch` to find scope creep.
- Uses opus so it does not share the implementer's model.

**`doc-writer`**
- Placement table follows `docs/README.md`; one Diátaxis type per page.
- Every claim is checked against source; plans never appear as current behavior.
- No shell and no `Skill` tool, so it cannot write `INSIGHTS.md`; accepted ADRs are superseded, not rewritten.
- Diagram rule lives in `docs/README.md` (`## Diagrams`).

**`security-reviewer`**
- Exploitability bar: attacker, entry point, preconditions, steps, impact; otherwise dismissed.
- Severity and confidence are reported separately; documented risks (KI/OQ) are assessed, not rediscovered.
- No proof-of-concept runs; critical and major findings carry a reproduction proposal for `test-writer`.
- Never reads `.env` and never reports secret values.

**`brainstorm`**
- Drivers first, then options; includes do-nothing and one non-obvious option; at most four options.
- Each option checked against `AGENTS.md` conventions and Do not touch.
- External facts are labelled Verified or Unverified; stops at a recommendation and hands off to `spec-creator` or `implementation-planner`.

## Sources

Fetched and checked by the maintainer on 2026-10-23 unless stated otherwise.

### `implementation-planner` and `implementer`

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

The plan-task schema in `implementation-planner.md` and its output contracts are this
project's own design. No official schema was found, and none is cited.
Disjoint write sets for parallel tasks are likewise the project's inference.

### `test-writer`, `architecture-reviewer`, `plan-verifier`, `doc-writer`, `security-reviewer`, `brainstorm`

Researched by the `researcher` agent on 2026-10-23 and relayed; the maintainer
has not re-opened them unless stated. The prompts, output contracts and the
model choice (opus for read-and-judge agents, sonnet for edit-and-run agents)
are this project's own design. No official model-selection rule was found.

| Source | URL | What it supports | Status |
|--------|-----|------------------|--------|
| Create custom subagents | https://code.claude.com/docs/en/sub-agents | `skills` preloads but does not gate access; parent `permissionMode` can override the subagent's, so read-only is enforced via `tools`; `AskUserQuestion` removed in subagents; nesting depth | Not verified by the maintainer (relayed; last ~11,600 characters were not read) |
| Code review standard (Google eng-practices) | https://google.github.io/eng-practices/review/reviewer/standard.html | Approve when a change improves overall code health; optional points marked as nits | Not verified by the maintainer (relayed as opened by `researcher`) |
| Guiding principles (Testing Library) | https://testing-library.com/docs/guiding-principles/ | Tests should resemble how the software is used | Not verified by the maintainer (relayed as opened) |
| Diátaxis | https://diataxis.fr/ | Four documentation forms: tutorial, how-to, reference, explanation | Not verified by the maintainer (relayed as opened) |
| MADR | https://adr.github.io/madr/ | Decision record sections; options, drivers, consequences, revisit conditions | Not verified by the maintainer (relayed as opened) |
| Building effective agents (Anthropic) | https://www.anthropic.com/engineering/building-effective-agents | Simplest solution first; clear evaluation criteria; tools hard to misuse | Not verified by the maintainer (relayed as opened) |
| Writing tools for agents (Anthropic) | https://www.anthropic.com/engineering/writing-tools-for-agents | High-signal returns; actionable errors | Not verified by the maintainer (relayed as opened) |
| OWASP ASVS, Top 10 and cheat sheets; NIST SSDF; CVSS; C4; Mermaid; Angular, NestJS and Vitest testing docs | not recorded | Security checklist, severity, diagram and testing conventions used in the prompts | Not verified: the content was not opened; taken from model knowledge, so no URLs are claimed |

The security checklist in `security-reviewer.md`, the traceability statuses in
`plan-verifier.md` and the anchoring-avoidance advice in `brainstorm.md` come
from model knowledge, not from an opened source.

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
