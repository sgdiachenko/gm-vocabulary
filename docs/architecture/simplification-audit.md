# Architecture & Repository Structure Audit: спрощення GM Vocabulary

Дата: 2026-10-15. Статус: історичний аудит до міграції; реалізація та нові перевірки описані у [verification record](simplification-verification.md).

Baseline: [956e0ada86c14ea9202bd417b2efefd53a42c785](https://github.com/sgdiachenko/gm-vocabulary/tree/956e0ada86c14ea9202bd417b2efefd53a42c785).

Документи: [план](simplification-plan.md), [ADR](adr/0001-simplify-workspace-retain-nx.md).

## Висновок

Рекомендація A: зберегти Nx як інструмент для Angular, API та browser E2E, а 25 внутрішніх libraries перенести в доменні папки відповідних застосунків. Ціль — 3 Nx projects без зміни бізнес-логіки, API чи deployment outputs.

Nx не є необхідним для нинішнього масштабу. Проте його видалення потребує окремої заміни backend packaging, CI та deployment-команд, тоді як проблему навігації можна вирішити зі збереженням toolchain.

Цей документ пропонує переглянути попередню оцінку library-first структури з [історичного аудиту](architecture-audit.md). Він не означає, що пропозицію прийнято або структура вже змінена. [Поточна карта](project-structure.md) залишається описом реалізації до завершення міграції.

## Метод і межі

Статично перевірено дерево репозиторію, усі 28 project.json, TypeScript/ESLint-конфігурації, imports між проєктами, NestJS modules/services/schemas, Angular routing/state, Docker, GitHub Actions, Playwright і Vercel.

Нові build, unit/E2E tests, Docker та production-перевірки не запускалися. Незакомічені зміни та зовнішні налаштування Render/Vercel не охоплені. Історичний [CI run](https://github.com/sgdiachenko/gm-vocabulary/actions/runs/36572562591) для baseline має success; це не нова валідація.

## Інвентаризація

| Група | Projects |
| --- | --- |
| Apps | api, gm-vocabulary, gm-vocabulary-e2e |
| API | api-auth-feature, api-auth-data-access, api-words-feature, api-words-data-access, api-collections-feature, api-collections-data-access, api-shared-util |
| Angular auth | gm-vocabulary-auth-data-access, gm-vocabulary-auth-feature-auth, gm-vocabulary-auth-ui, gm-vocabulary-auth-util |
| Angular vocabulary | gm-vocabulary-vocabulary-data-access, gm-vocabulary-vocabulary-feature-list, gm-vocabulary-vocabulary-feature-editor, gm-vocabulary-vocabulary-ui, gm-vocabulary-vocabulary-util |
| Angular collections | gm-vocabulary-collections-data-access, gm-vocabulary-collections-feature-list, gm-vocabulary-collections-feature-details, gm-vocabulary-collections-feature-editor, gm-vocabulary-collections-util |
| Shell/shared | gm-vocabulary-feature-shell, shared-ui, shared-util, shared-environments |

Разом: 28 projects, 25 libraries, 71 TypeScript-конфігурація, 27 ESLint-конфігурацій і 25 бібліотечних src/index.ts. Приблизно 3300 рядків основного TypeScript без tests/barrels, HTML і SCSS. Жодна library не має явно заданого build target; inferred targets окремо не запускалися.

## Висновки та докази

### 1. Межі дрібніші за реальні потреби

- libs/gm-vocabulary/auth/feature-auth і auth/ui містять по одному основному компоненту.
- collections/feature-list, feature-details, feature-editor містять по одному основному компоненту.
- libs/shared/util-environments містить два environment-файли на 8 рядків.
- libs/api/{auth,words,collections}/data-access містять по одній схемі на 19, 24 і 28 рядків відповідно.

Окремі файли для форм, state, HTTP і схем корисні. Власний Nx project для кожної такої ролі не має продемонстрованого незалежного build/deployment споживача.

### 2. Domain tags не забезпечують domain boundaries

eslint.config.js застосовує scope/type constraints, але не domain constraints. Frontend/backend розділені, напрямки між технічними шарами обмежені, бізнес-ізоляція за domain:* не реалізована.

Статичний граф production imports через custom aliases не має циклів між поточними Nx projects; cross-project relative imports не знайдено. Це не є перевіркою runtime DI graph чи доведенням незалежності доменів.

### 3. Words і collections пов'язані в обох напрямках

- libs/gm-vocabulary/collections/util/src/lib/interfaces/word-group.ts імпортує Word.
- vocabulary/feature-editor використовує collections data-access/contracts.
- collections/feature-details використовує words service, editor і table.
- vocabulary/ui/src/lib/words-table/words-table.service.ts знає WordGroup.

Об'єднання кожного з цих напрямків в окрему велику Nx library створило б взаємну залежність. Рекомендація — звичайні підпапки words/collections у vocabulary-контексті зі збереженням відповідальностей і контрольованих imports.

### 4. Backend є модульним монолітом із частковою інкапсуляцією persistence

apps/api/src/app.module.ts підключає AuthModule, WordsModule, WordCollectionsModule. Controller → service → Mongoose є достатнім для поточного обсягу.

WordsModule та WordCollectionsModule реєструють обидві vocabulary-схеми. WordsService.copy читає колекції; WordCollectionsService використовує populate('words'). Schema libraries прибрали project cycle, але не зв'язок між даними.

Зберегти ці модулі під час першого перенесення. Auth — окрема межа, words/collections — окремі підобласті vocabulary. Новим зовнішнім доменам не давати прямий доступ до їхніх моделей. Generic repository, CQRS, event bus і додаткові ports зараз не потрібні.

### 5. Тести та конфігурації мають дублювання

apps/gm-vocabulary/tsconfig.spec.json включає specs із domain/shared libraries; бібліотеки мають власні test targets. Загальний запуск усіх targets повторно охоплює ці тести.

nx.json задає test inputs як default + ^production, де production виключає specs. Aggregate app test читає library specs: інвалідацію cache при spec-only зміні потрібно перевірити. Застарілий результат cache в runtime не відтворювався.

API aliases повторено у tsconfig.base.json та apps/api/vitest.config.mts. Частину per-library ESLint-файлів становить лише імпорт root config.

### 6. Є ризик послабити перевірку типів

Libraries задають strict: true, Angular libraries також strictTemplates: true. Root tsconfig.base.json задає strict: false. Фактичні перевірки залежать від entry point компіляції; imported source files не успадковують автоматично сусідній tsconfig.

Перед видаленням конфігурацій зафіксувати ефективні параметри і перенести потрібні перевірки на app level. Не приховувати проблеми через any, ts-ignore або вимкнення strict.

### 7. Сервіси та stores не потрібно зливати одночасно з перенесенням

WordsService тримає request state, WordsStore — дані/фільтри; аналогічно в collections. Спочатку розмістити файли поруч. Зміну state ownership оцінювати окремо, оскільки вона може змінити lifecycle і поведінку.

## Відомі issues поза структурною міграцією

- WordsService.create/update не перевіряють існування й ownership groupId.
- WordCollectionsService.remove має TODO щодо пов'язаних слів і може залишати dangling references.
- Session storage, JWT configuration validation та observability потребують окремих рішень.

Не виправляти їх непомітно під час moves: це інший scope і зміна поведінки. Відділити наявні defects від migration regressions.

## Before / After

| Before | Proposed After |
| --- | --- |
| 28 Nx projects | 3 app/E2E projects |
| Product code у libs | Product code у відповідному apps/*/src |
| feature/ui/data-access/util як libraries | Файли поруч за функціональною областю |
| Schema library | Schema поряд із Nest module |
| Environments library | Angular src/environments |
| Library barrels і довгі aliases | Локальні imports, обмежений public surface на реальних межах |
| Перекриття test targets | Один Angular unit suite і один API unit suite |

## Порівняння варіантів

| Критерій | A: Nx + app-local code | B: npm workspace |
| --- | --- | --- |
| Навігація | Проста | Та сама проста структура |
| Tooling | Збережено Nx orchestration/cache/migrations | Прямі scripts, framework configs і власне runtime packaging |
| Межі | ESLint folder rules + Nest exports | Ті самі механізми |
| Ризик | Imports, discovery, strictness, cache | Додатково module format, packages, Docker/CI/deploy |
| Оцінка | 3–5 робочих днів | 6–9 днів загалом |

Оцінки попередні, для одного розробника, включають перевірки; позарепозиторні deployment settings можуть збільшити час. Це не зобов'язання виконати міграцію в зазначений строк.

У поточному CI немає affected execution, remote cache не налаштовано. Nx не потрібний для runtime або доменної архітектури, але вже бере участь у робочому build/deployment toolchain.

Для B використовувати npm, щоб не домішувати зміну package manager. Потрібні Angular CLI config, Nest/compiler config, workspace package manifests, один lockfile та explicit build/test/serve scripts. Не створювати package на кожну feature.

## Docker / CI / deployment

- apps/api/webpack.config.cjs використовує NxAppWebpackPlugin із generatePackageJson. Видалення Nx потребує заміни створення runtime package/lockfile, decorators metadata і перевірки CommonJS/ESM; root package має type: module.
- apps/api/Dockerfile очікує dist/apps/api, production npm dependencies та запускає node api/main.js як non-root.
- docker-compose.yml — development services, порти 4200/3000/27017 і Mongo volume. Зберегти service names та volumes, не робити destructive reset даних.
- vercel.json очікує dist/gm-vocabulary/browser та SPA rewrites.
- Angular file replacements і Sass imports посилаються на libs; їх потрібно оновити після moves.
- playwright.config.ts стартує обидва Nx serve targets і перевіряє /api/words як readiness URL.
- GitHub Actions запускає frontend/backend checks і Playwright, але не npm run test:api:e2e.
- API E2E містить один сценарій 401 та не відтворює production ValidationPipe. Цього недостатньо для перевірки moves схем і DI.
- Render/Vercel dashboard settings не перевірені; їхній inventory потрібний до release.

## Майбутнє навчання

Модулі, DI, lifecycle, guards і DTO залишаються видимими для NestJS-практики. PostgreSQL додавати до конкретного погодженого сценарію; observability — до реальних HTTP/DB/job boundaries. Microservices потребують окремого обґрунтування незалежного deployment чи ізоляції. Не створювати порожніх modules/packages або persistence interfaces для гіпотетичного майбутнього.

## Зовнішні джерела

- [Angular Style Guide](https://angular.dev/style-guide): організація за feature areas і сусідство пов'язаних файлів.
- [NestJS Modules](https://docs.nestjs.com/modules): інкапсуляція та explicit exports.
- [Nx module boundaries](https://nx.dev/docs/features/enforce-module-boundaries): constraints між projects.
- [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/): workspace packages та scripts.
