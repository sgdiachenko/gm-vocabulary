# Report template

```
# PR self-review: <branch> @ <short HEAD>
Scope: <branch|staged|working-tree> · Mode: <full|quick> · Files: <n> · +<a>/-<d>

## Verdict: <NOT READY TO MERGE | READY WITH CHANGES | READY>
Blockers: <n critical> · To fix: <n major> · Other: <n minor/info>

## Findings (new)
| # | Severity | Category | Location | Rule (source) | Evidence | Suggested fix | Conf. |
|---|---|---|---|---|---|---|---|

## Existing issues touched (do not affect verdict)
- <id> <file> — <known-issues ref>

## Checks
| Check | Result |
|---|---|
| lint | passed / failed / skipped: reason |
| typecheck | ... |
| test:boundaries | ... |
| unit tests (<project>) | ... |
| skills applied | <names> |
| skills skipped | <name: reason> |

## Not checked
<build, API integration, Playwright, anything skipped, and why>

## PR description snippet
Self-review: <verdict>, <n> findings (<c> critical, <m> major). Not checked: <list>.
```

Gate file (`--gate`): same content, plus `HEAD: <full sha>` and `Generated: <UTC time>`, written to `.claude/pr-review/<branch>.md`.
