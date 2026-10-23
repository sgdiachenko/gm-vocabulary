# Sources

Checked 2026-10-23. Official pages are Angular 22.x docs.

## Official
- Angular Style Guide: https://angular.dev/style-guide (feature grouping, colocated specs, no generic file names, one concept per file, `inject()`, member ordering)
- Angular best practices for AI: https://angular.dev/ai/develop-with-ai and https://angular.dev/assets/context/best-practices.md (signals, `@Service`, OnPush default, lazy routes, Signal Forms)
- Angular CLI MCP server: https://angular.dev/ai/mcp
- Creating and using services: https://angular.dev/guide/di/creating-and-using-services
- Defining dependency providers: https://angular.dev/guide/di/defining-dependency-providers
- Route guards: https://angular.dev/guide/routing/route-guards
- Component inputs: https://angular.dev/guide/components/inputs
- Content projection: https://angular.dev/guide/components/content-projection
- Resource API: https://angular.dev/guide/signals/resource
- Signal Forms: https://angular.dev/guide/forms/signals/overview
- Testing: https://angular.dev/guide/testing
- Nx folder structure: https://nx.dev/docs/kb/folder-structure
- Nx project dependency rules: https://nx.dev/docs/kb/project-dependency-rules
- Nx enforce module boundaries: https://nx.dev/docs/features/enforce-module-boundaries
- Nx, Architecting Angular applications (2025-03-18): https://nx.dev/blog/architecting-angular-applications

## Community (older than 2024, use with care)
- M. Steyer, NgRx Signal Store and your architecture (2023-12): https://www.angulararchitects.io/?p=23822
- M. Steyer, Strategic design with Sheriff (2023-07): https://www.angulararchitects.io/en/?p=7366
- M. Steyer, Angular Signals and your architecture, 5 options (2023-05): https://www.angulararchitects.io/blog/angular-signals-your-architecture-5-options

## Caveats
- No official guidance exists for where to put constants, mappers, validators or models; those rules are this project's own convention.
- Nx advises keeping most code in libraries; this repo deliberately keeps a single app without libs (root AGENTS.md).
- Suffix-less naming follows the v22 style guide examples; older guides (v18/v19) required `.component`/`.service`.
- The stability status of `resource`/`httpResource` in v22 is not stated on the guide page.
