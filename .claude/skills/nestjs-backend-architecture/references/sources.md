# Sources

Fetched 2026-10-23. Principle and layering: see also `../../ddd-conventions/references/sources.md`.

## Dependency direction
- Palermo, The Onion Architecture 1-3 (2008): https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/ (coupling points inward; interfaces defined inward, implemented outward)
- R. Martin, The Clean Architecture (2012): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html (dependency rule; only simple data crosses boundaries)
- Cockburn, Hexagonal Architecture: https://alistair.cockburn.us/hexagonal-architecture/
- Microsoft, Common web application architectures: https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures (folder-only separation is allowed for small apps but nothing enforces direction)
- Fowler, Repository: https://martinfowler.com/eaaCatalog/repository.html ; OrmHate: https://martinfowler.com/bliki/OrmHate.html

## When not to add layers
- Microsoft, DDD-oriented microservice: https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice
- Khorikov, Should you abstract the database?: https://enterprisecraftsmanship.com/posts/should-you-abstract-database/
- NestJS CQRS recipe (simple CRUD does not need it): https://docs.nestjs.com/recipes/cqrs

## NestJS
- Modules: https://docs.nestjs.com/modules
- Custom providers (abstract class as token): https://docs.nestjs.com/fundamentals/custom-providers
- Circular dependency: https://docs.nestjs.com/fundamentals/circular-dependency
- Mongoose: https://docs.nestjs.com/techniques/mongodb (service + `@InjectModel`, schema class as type)
- Validation: https://docs.nestjs.com/techniques/validation
- Exception filters: https://docs.nestjs.com/exception-filters
- Guards: https://docs.nestjs.com/guards

## Community examples
- Domain-Driven Hexagon: https://github.com/Sairyss/domain-driven-hexagon
- brocoders nestjs-boilerplate (Mongoose schema -> mapper -> domain entity): https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/architecture.md

## Enforcement tools
- eslint-plugin-boundaries: https://github.com/javierbrea/eslint-plugin-boundaries
- dependency-cruiser: https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-tutorial.md
- ESLint no-restricted-imports: https://eslint.org/docs/latest/rules/no-restricted-imports
- Nx enforce-module-boundaries (project-level only, not folders inside one app): https://nx.dev/docs/features/enforce-module-boundaries

## Caveats
- No verified 2024-2026 article on Mongoose schema vs domain entity.
- "An ORM is already a repository" applied to Mongoose is inference.
- NestJS docs pages did not state a v11/v12 version.
- GitHub repository dates were not visible.
