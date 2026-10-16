# План безпечного спрощення GM Vocabulary

Дата: 2026-10-15. Статус: **Implemented locally; external release verification pending**.

Джерела: [аудит](simplification-audit.md), [ADR](adr/0001-simplify-workspace-retain-nx.md).
Baseline: 956e0ada86c14ea9202bd417b2efefd53a42c785. Перед виконанням перевірити актуальний HEAD, локальні зміни й applicable AGENTS.md.

## Прогрес реалізації

Усі structural етапи 1–5 виконано. Локальні baseline/final checks, Docker та isolated Compose пройдено; подробиці й уточнення статичного аудиту — у [verification record](simplification-verification.md). Відкриті лише зовнішні deployment settings, preview/staging та remote CI. Початковий Compose baseline до moves не запускався; це явно зафіксовано.

## Мета і межі

Скоротити 28 Nx projects до 3, перенести 25 libraries у звичайні папки застосунків. Зберегти поведінку, API, MongoDB, deployment outputs і потрібні quality checks.

2026-10-15 користувач обрав новий чат із GPT-6.1 Sol для поетапної реалізації запропонованого варіанта A. Це авторизує реалізацію цього scope після підготовки документів, починаючи з baseline. Не потрібні повторні дозволи на кожний звичайний крок у погодженому scope. Push, merge і production deployment окремо не авторизовано.

Робочий checkout: /Users/sdiachenko/web-dev/projects/gm-vocabulary/gm-vocabulary. Батьківський каталог містить кілька інших проєктів; не працювати в gm-vocabulary-api, gm-vocabulary-angular-spa чи gm-vocabulary-react. Під час передачі HEAD робочого checkout відповідав baseline; існувала untracked .claude/, яку не змінювати і не додавати до structural changes.

Не входять у scope: зміна auth/session strategy, ownership semantics, collection deletion policy, state management, PostgreSQL, observability stack, microservices, dependency upgrades або package manager.

## Цільове розміщення

```text
apps/
├── gm-vocabulary/
│   ├── project.json
│   └── src/
│       ├── main.ts
│       ├── environments/
│       ├── styles/
│       └── app/
│           ├── app.ts / app.config.ts / app.routes.ts
│           ├── shell/
│           ├── features/
│           │   ├── auth/
│           │   │   ├── auth-page/ / auth-form/
│           │   │   ├── auth.service.ts / auth-api.service.ts / auth.store.ts
│           │   │   ├── auth-guard.ts / auth-interceptor.ts
│           │   │   └── contracts/
│           │   └── vocabulary/
│           │       ├── words/
│           │       │   ├── words-page/ / word-edit-dialog/
│           │       │   ├── words-table/ / words-preview-dialog/
│           │       │   ├── words.service.ts / words-api.service.ts / words.store.ts
│           │       │   └── contracts/
│           │       └── collections/
│           │           ├── collections-page/ / single-collection-page/
│           │           ├── collection-edit-dialog/
│           │           ├── word-group.service.ts / word-groups-api.service.ts
│           │           ├── word-groups.store.ts
│           │           └── contracts/
│           └── shared/
│               ├── ui/
│               └── forms/
├── api/
│   ├── Dockerfile / project.json
│   ├── src/
│   │   ├── main.ts / app.module.ts
│   │   ├── common/pipes/ / common/validators/
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── auth.module.ts / auth.controller.ts / auth.service.ts
│   │       │   ├── auth.entity.ts / dto/ / guards/ / decorators/ / interfaces/
│   │       └── vocabulary/
│   │           ├── words/
│   │           │   └── words.module.ts / words.controller.ts / words.service.ts / word.entity.ts / dto/
│   │           └── collections/
│   │               └── word-collections.module.ts / word-collections.controller.ts / word-collections.service.ts / word-collection.entity.ts / dto/
│   └── test/
└── gm-vocabulary-e2e/
```

Slash-separated entries позначають сусідні файли/папки, а не додаткову вкладеність. Tests/templates/styles переносити разом із owning code. Зберегти поточні назви класів і файлів, якщо інше не потрібне для усунення конкретного конфлікту.

### Межі imports

- Frontend не імпортує backend і навпаки.
- Shared UI/forms не імпортують features.
- Auth не залежить від vocabulary.
- Зовнішні backend domains не імпортують vocabulary schemas/models.
- Words/collections можуть використовувати явно визначені поточні contracts/services/components усередині vocabulary; не оголошувати їх незалежними libraries зі взаємною project dependency.
- Реалізувати правила для aliases і relative imports; одне обмеження лише на custom aliases залишає обхід через relative path.
- Public exports створювати тільки коли вони потрібні споживачу; нові facades/classes не потрібні.

## Етапи та acceptance gates

### 0. Baseline і карта deployment

- [x] Перевірити HEAD/dirty state, не скидати й не перезаписувати чужі зміни.
- [x] Зафіксувати toolchain, effective TS/template settings і список test files.
- [x] Запустити lint/typecheck/unit/build без Nx cache; recorded pre-existing failures відокремити.
- [x] Запустити Playwright та API E2E з окремою disposable MongoDB.
- [ ] Перевірити production Docker build/start та Compose на ізольованому test environment; не використовувати production DB і не видаляти існуючий Mongo volume.
- [ ] Записати зовнішні Render/Vercel root/build/start/output settings без секретів.

Gate: відтворюваний baseline або явний перелік обмежень. Не переносити невідомі failures у статус «перевірено».

### 1. Перевірки критичних сценаріїв

- [x] Додати integration tests, яких бракує для DI, validation, schemas і populate.
- [x] Test bootstrap відтворює production prefix/ValidationPipe; не створювати великий bootstrap framework.
- [x] Перевірити auth, CRUD, ownership, shared read/copy та bulk з реальною MongoDB.
- [x] Зафіксувати відомі defects окремо від очікуваних інваріантів.

Gate: tests покривають ризики реєстрації моделей і контрактів, а не лише mock method calls. Не закріплювати відомий security defect як бажану поведінку.

### 2. Angular auth і shell

- [x] Перенести auth files/specs та shell, оновити imports.
- [x] Зберегти routes/lazy loading, service scopes, storage keys, timers і interceptor behavior.
- [x] Зберегти type/template checks; annotation-only fixes відокремити від logic changes.

Gate: auth unit/browser scenarios, frontend typecheck/build; жодного пропущеного spec.

### 3. Angular vocabulary і shared

- [x] Перенести words/collections, зберігши subscriptions/store cleanup та provider lifetime.
- [x] Перенести shared UI/forms, helpers/styles і environments.
- [x] Оновити file replacements, Sass imports і всі assets/style references.
- [x] Залишити service/store responsibilities незмінними.

Gate: unit tests, words/collections/navigation/copy scenarios, production/development builds, SPA deep links.

### 4. Backend

- [x] Перенести modules/services/controllers/DTO/schemas/specs.
- [x] Зберегти AuthModule, WordsModule, WordCollectionsModule і model registrations.
- [x] Зберегти Auth/Word/WordCollection model names, users/wordgroups collections, refs і populate.
- [x] Прибрати old aliases із Vitest/TypeScript після перенесення всіх споживачів.

Gate: API unit/integration tests з MongoDB, DI startup, production build та production image smoke test.

### 5. Консолідація workspace

- [x] Прибрати бібліотечні configs/barrels лише коли немає споживачів.
- [x] Залишити gm-vocabulary, api, gm-vocabulary-e2e у Nx inventory.
- [x] Консолідувати unit test targets, зберігши всі specs.
- [x] Додати folder-level import restrictions і перевірити їх на прикладах заборонених imports.
- [x] Переглянути cache inputs/outputs; перевірити source-only, spec-only і config-only зміни.
- [x] Не видаляти Nx plugins за самим фактом відсутності explicit executor: перевірити inferred targets та generators.

Gate: 3 projects, повний test discovery, немає stale aliases, усі потрібні checks працюють.

### 6. Release verification і документація

- [x] Зберегти dist/apps/api і dist/gm-vocabulary/browser, root scripts та порти.
- [ ] Пройти CI, Docker production smoke, Compose smoke і preview/staging deployment.
- [x] Оновити project-structure.md/README; історичний аудит позначити історичним без стирання історії.
- [ ] Записати commands/results/limitations у PR; не вигадувати runtime results.

Gate: підтверджено ті самі workflows та поведінку; deployment approval, якщо потрібне, залишається фінальним кроком після готового reviewable результату.

## Команди baseline

Виконувати з repository root, перевіривши актуальні scripts і потрібне test environment. Команди наведено як план; у цьому аудиті вони не запускалися.

```bash
npm ci
npm run lint -- --skip-nx-cache
npm run typecheck
npx tsc --noEmit -p apps/api/tsconfig.app.json
npm run test:ci
npm run build -- --skip-nx-cache
npm run test:api:e2e
npm run e2e -- --skip-nx-cache
docker build --target production -f apps/api/Dockerfile -t gm-vocabulary-api:structure-check .
```

Перед npm ci перевірити відповідність runtime/package manager репозиторію; встановлення не повинно непомітно переписувати lockfile. Production image додатково потрібно запустити з тестовою MongoDB/env і зробити HTTP smoke — успішного docker build недостатньо.

## Матриця регресій

| Область | Перевірка |
| --- | --- |
| Auth | Signup/login/username, existing account, restore, expiry, logout, invalid bearer |
| API contract | Routes/methods/status codes/response shapes/validation errors |
| Vocabulary | Words CRUD/filter, collections CRUD/bulk/details, shared read/copy |
| Authorization | User B не змінює приватні дані A; shared сценарії відповідають поточному контракту |
| MongoDB | Model/ref names, physical collections, populated words, existing IDs |
| Angular | Lazy routes, providers, navigation/back/reload, store reset, dialogs |
| Tooling | Full discovery, strictness, no duplicate suites, cache invalidation |
| Deployment | Production API без devDependencies/source, SPA deep links, env replacements, ports |

## Rollback

Робити окремі логічні PR/commits, не один великий move + behavior rewrite. Для structural changes не потрібна міграція даних: revert відповідного PR і redeploy попереднього artifact. Не запускати destructive DB cleanup. Якщо запропонована зміна потребує data migration або нового API contract — винести її з цього плану.

## Передача іншій моделі

Обраний запуск: GPT-6.1 Sol, поетапна реалізація. Спочатку перевірити факти на актуальному checkout і виконати baseline; за відсутності матеріальних розбіжностей продовжити погоджені етапи. Незалежний read-only review залишається доступним окремим сценарієм, але не є додатковим обов'язковим approval gate.

Промпт для review:

> Прочитай applicable AGENTS.md і docs/architecture/simplification-audit.md, simplification-plan.md та adr/0001-simplify-workspace-retain-nx.md. Зістав пропозиції з актуальним кодом, зокрема frontend cross-feature imports, NestJS/Mongoose DI, test discovery/strictness/cache і Docker/CI/Vercel/Render packaging. Не сприймай аудит як доведений runtime результат. Поверни конкретні помилки або ризики, потрібні корекції та оцінку готовності плану. Нічого не змінюй і не запускай реалізацію.

Промпт для авторизованої реалізації:

> Реалізуй погоджені етапи docs/architecture/simplification-plan.md у цьому репозиторії. Спочатку перевір AGENTS.md, актуальний HEAD і baseline. Зберігай бізнес-логіку, API, Mongo models/collections/refs, provider scopes, type safety, test discovery, output paths і workflows. Не виправляй суміжні defects, не оновлюй залежності й не видаляй Nx. Роби невеликі reviewable зміни, запускай релевантні checks; записуй фактичні результати й limitations. Не push/merge/deploy без потрібної авторизації. Якщо поточний стан суперечить плану, спочатку поясни конкретну розбіжність.
