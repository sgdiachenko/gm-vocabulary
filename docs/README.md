# Project context

Reviewed: 2026-10-17. Start here, then read only the section relevant to the task.
These documents describe the current implementation, not a new approved roadmap.

| Read when | Document |
|---|---|
| Understanding the product or changing observable behavior | [Product and user scenarios](product.md) |
| Changing modules, imports, state, API or persistence | [Current architecture and file map](architecture/project-structure.md) |
| Understanding why the workspace was simplified | [ADR 0001](architecture/adr/0001-simplify-workspace-retain-nx.md) |
| Investigating an existing defect or assessing risk | [Known issues and limitations](known-issues.md) |
| A requirement, policy or design choice is unresolved | [Open questions](open-questions.md) |
| Running the project or selecting checks | [Root README](../README.md) |

## Architecture history

ADR 0001 is the existing accepted decision to retain Nx and move product code
into application-local feature folders. Do not invent additional historical ADRs.
For a significant new decision, add a record with context, alternatives,
decision, consequences, status, date and evidence. Supersede an older record
explicitly instead of rewriting its history. Small changes do not need an ADR.

[Architecture audit](architecture/architecture-audit.md) and
[simplification audit](architecture/simplification-audit.md) describe earlier
states. [Simplification verification](architecture/simplification-verification.md)
contains historical results, not proof that checks pass on the current checkout.

## Keep the minimum current

- A behavior change updates the relevant product scenario and code/tests together.
- A boundary or data-flow change updates the architecture map; add an ADR only
  when the decision has lasting consequences.
- A confirmed defect goes in known issues; an unresolved choice goes in open
  questions. Closing one requires evidence, not merely a proposed fix.
- Keep feature-specific detail beside its owning module when it becomes useful;
  link it here rather than copying it across documents.
- Record checks actually run. Do not turn configuration, plans or historical
  test results into claims of current verification or production readiness.
