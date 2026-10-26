# Cross-module specs

Feature specifications that affect more than one module. A feature that affects a
single module keeps its spec in that module's `specs/` directory
(`apps/<module>/specs/`).

Written by the `spec-creator` agent (see [`.claude/agents/spec-creator.md`](../.claude/agents/spec-creator.md)).
A spec describes WHAT and WHY; the implementation plan comes from
`implementation-planner` after the spec is approved.

- File name: `YYYY-MM-DD-<feature-slug>.md`
- Spec ID: `SPEC-NN`, numbered across all `specs/` directories in the repository
- Status: `draft` → `approved` (only after explicit user approval) → `implemented`
- A changed decision is a new spec with `Supersedes:`, not a rewrite

## Index

| Spec ID | Title | Status | Modules | File |
|---------|-------|--------|---------|------|
