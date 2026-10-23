---
name: engineering-insights
description: Records non-obvious, evidence-backed findings in the INSIGHTS.md of the module being worked on (apps/api, apps/gm-vocabulary, apps/gm-vocabulary-e2e). Use after a non-trivial fix, a dead end, a confirmed tool or library quirk, a surprising codebase convention, or at the end of a substantial session; also when the user runs /engineering-insights. Not for trivial edits, renames, formatting, or facts already visible in the code or docs.
---

# Engineering insights

1. Pick the module whose files the finding is about; its `INSIGHTS.md` sits in the module root. Read that file fully first. Never load other modules' files.
2. Keep a finding only if a reader of the code would not see it and you confirmed it (command, test, or `file:line`). Not a guess, not generic advice, not already in `AGENTS.md` or `docs/` (check `docs/known-issues.md`, `docs/open-questions.md`). If nothing qualifies, write nothing and say so.
3. Duplicate or contradiction with an existing entry: do not add a second copy; add a dated correction note under the old entry instead.
4. Show the proposed text and target section, then append it using the entry template in the file. Append only; never rewrite or delete existing entries (cleanup is a separate reviewed commit).
5. Sections: What Works, What Doesn't Work (dead ends and antipatterns, include the reason), Codebase Patterns, Tool & Library Notes, Recurring Errors & Fixes, Session Notes, Open Questions.
6. Capture as you go: one entry as soon as a fix is confirmed. Wrap-up: after a substantial task (roughly 30+ min with a real problem, decision or discovery) add the entries plus one dated line in Session Notes. Trivial edits produce nothing.
7. Never record secrets (tokens, passwords, `.env` values), personal data, or guesses; describe such values by name only.
8. Entries are drafts for human review in Git, not verified truth.

Entry must be actionable cold, without the chat. Weak: "be careful with auth config". Strong: state the symptom, the file and line, and what to do or avoid.
