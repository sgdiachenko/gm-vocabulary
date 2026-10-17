# Project context map

Start with [docs/README.md](docs/README.md); read only relevant linked context.
- Behavior or feature changes: [product scenarios](docs/product.md).
- Imports, state, API or persistence changes: [architecture/file map](docs/architecture/project-structure.md) and relevant ADR.
- Bug fixes or risk assessment: [known issues](docs/known-issues.md).
- Ambiguous requirements or policy: [open questions](docs/open-questions.md).
- Run/check commands: [README](README.md); historical verification is not a current pass.

Keep code and its relevant documentation aligned. Do not infer approved product
requirements or historical decisions from plausible implementation details.
Do not copy this entire documentation set into every task. Existing source,
contracts and focused tests must confirm context relevant to the change.
