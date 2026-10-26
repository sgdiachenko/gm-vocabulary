---
name: workflow-retro
description: Retrospective of a finished Claude Code session or multi-agent workflow. Reads the session transcripts (orchestrator and sub-agents), reports which agents ran and in what order, tokens by type, cache use, retries, time, parallelism, repeated reads and wasted actions, estimates API-equivalent cost, judges result quality, and proposes improvements to skills and agents. Writes a detailed report to docs/retros/ and one ledger row per run. Use when the user runs /workflow-retro or asks for a workflow retrospective or cost analysis. Manual invocation only; never edits skills, agents or code.
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/collect.mjs *)
---

# Workflow retro

Manual only. Output language of every written file: English. Never edit product code, skills or agents; propose harness changes as text for the user to approve. Output template: `references/report-template.md`.

## Arguments
- Session: id prefix or `latest` (default). `latest` is usually the current session, so say which session was analyzed and that its tail (this retro) is excluded.
- `--no-write`: chat report only, no files.
- `--refresh-prices`: force the price-table refresh question even when no signal fired.

## Steps
1. **Collect.** Run `node ${CLAUDE_SKILL_DIR}/scripts/collect.mjs <session>` from the repo root. It prints JSON of numbers, timestamps, tool names and repo-relative paths. Do not open the raw `.jsonl` files and never print prompt, reply or tool-result text. Never read `.env`.
2. **Trust check before any claim.** Report the `reconciliation` block: transcript sums vs Claude Code's `cost-state` per model, with the unattributed remainder. Say plainly that the remainder is unexplained; do not guess a cause. Usage is counted once per `message.id`; orchestrator and each sub-agent are separate streams and are summed once.
3. **Facts (Measured).** Table of streams in start order: type, label, start, wall seconds, API calls, input, output, cache-read, cache-write, cache-hit ratio, tool counts and errors. Add session totals, retry seconds, peak parallel agents, and critical path (longest stream plus the orchestrator work around it).
4. **Cost.** The script prices every stream (`estimatedUsd`, per model in `byModel`) from `scripts/prices.json`: official list prices (source URL and fetch date inside), with the 5-minute vs 1-hour cache-write split, Haiku's long-prompt tier and web searches. Show per-agent USD, then the session total from `costState.totalUsdEstimated`, all as **estimated at API list prices, not a bill**. The gap between transcript USD and the Claude Code figure is the unattributed usage (step 2); price it from `reconciliation.unattributed` and show it as its own line. If a model is missing in `prices.json` its USD is `N/A`: fetch the official pricing page, update the file with the new fetch date, and tell the user. Fast mode, US-only inference and batch are not repriced; report `nonStandardSpeed` counts. Real payment: `N/A` (Max subscription, fixed fee; enterprise seat price is not in the logs).
5. **Waste and difficulty (Inferred, label each).** Use `repeatedReads`, `crossStreamReads`, `repeatedOtherCalls`, `toolErrors`, retry seconds and the share of orchestrator tokens spent on briefs and hand-backs. Known blind spot: files read through `Bash` (`cat`, `sed`) are invisible to the script, so absence of repeats is not proof. Each inferred item needs the number that triggered it.
6. **Quality.** Judge the result yourself, as `success | partial | fail` with a one-sentence reason and the evidence: checks that passed (only if their output is in the session), `plan-verifier` verdicts, rework, rejected output, user corrections. If evidence is missing write `unknown`, not `success`. Quality is a judgment, not a measurement; the user may overrule it.
7. **Recommendations.** For each: target skill or agent, the change, the evidence number, and expected effect marked **Forecast** with formula and assumptions. A forecast is never written as a saving that happened. Compare cost per successful workflow only when the ledger has comparable earlier runs of the same workflow kind; otherwise `N/A`. All harness changes are proposals awaiting approval.
8. **Write (unless `--no-write`).**
   - Report: `docs/retros/<YYYY-MM-DD>-<slug>.md` (new file per run; never overwrite).
   - Ledger: append exactly one row to `docs/retros/ledger.md`, same columns as its header. Never edit or delete older rows; a correction is a new row that cites the old one.
   - Put only numbers, 8-char session ids, repo-relative paths and your own wording in these files. No quotes from the chat, no absolute paths, no secrets.
9. **Insights (propose only).** For a finding tied to one module, read that module's `INSIGHTS.md`, `docs/known-issues.md`, `docs/open-questions.md` and `docs/retros/ledger.md`. Keep it only if it is confirmed (command output or `file:line`), not already recorded, and not a duplicate or contradiction. Show module, target section and text, then wait. On approval run `engineering-insights`; do not append to `INSIGHTS.md` directly.

## Rules
- Prices come only from `scripts/prices.json`. Read `priceCheck` in the collector output every run; it needs no network. If `refreshNeeded` is true (table older than 30 days, a model missing from the table, or a model's Claude Code USD outside the computed range) or `--refresh-prices` was passed: say which signal fired, ask the user whether to fetch the official pricing page, and only after yes fetch it, show the differences, and edit `prices.json` (new `fetched` date) with approval. Otherwise do not ask and do not fetch. A `weak` range (tiered model) is a weaker check; say so. Calibration on session `67099d75` (2026-10-26): Haiku $0.2397 computed vs $0.2396 reported; Sonnet transcripts $2.3645 plus the priced unattributed usage ≈ $2.63 reported.
- Label every number Measured, Estimated, Inferred or Forecast. Missing data is `N/A` with the reason.
- Do not double count: report the dedupe rule and the reconciliation gap every time.
- Cost per run is not the goal alone; weigh it against quality, and say when one run cannot support a conclusion.
- Do not claim a hook, billing export or plugin runtime exists. Paths: scripts use `${CLAUDE_SKILL_DIR}` (substituted in this file only; it is not an environment variable in Bash). If packaged as a plugin, persistent data would go under `${CLAUDE_PLUGIN_DATA}`; until then history lives in `docs/retros/`.
