# Retro report template

File: `docs/retros/<YYYY-MM-DD>-<slug>.md`. Fill every section; write `N/A (<reason>)` instead of omitting.

```markdown
# Retro: <workflow name> — <YYYY-MM-DD>

- Session: <8-char id> · branch <branch> · analyzed by workflow-retro
- Scope: <what the workflow was for, one sentence>
- Result quality: <success|partial|fail|unknown> — <one-sentence reason and evidence>

## Data trust
- Dedupe: usage counted once per message.id; <n> transcripts read
- Reconciliation (transcripts vs Claude Code cost-state, per model): <table>
- Unattributed remainder: <numbers>; cause: unknown

## Streams (start order)
| # | Type | Label | Start | Wall s | API calls | Input | Output | Cache read | Cache write | Hit % | Tool errors |

Totals · peak parallel agents · retry seconds · critical path

## Cost
- Estimated at API list prices (not a bill): $<x> by model <split>
- Real payment: N/A (<subscription>)
- Per-agent cost: N/A (logs give per-model totals)

## Complexity and waste (Inferred, with trigger numbers)
## Recommendations
| # | Target | Change | Evidence | Forecast (formula, assumptions) | Needs approval |

## Insight candidates
| Module | Section | Text | Evidence | Duplicate check |
```

## Ledger columns

`| Date | Session | Workflow | Agents (types×count) | Input | Output | Cache read | Cache write | Est. USD | Wall s | Retry s | Peak parallel | Quality | Report | Note |`

One row per run, append only.
