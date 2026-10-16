# Результати спрощення GM Vocabulary

Дата: 2026-10-15. Baseline/HEAD: `956e0ada86c14ea9202bd417b2efefd53a42c785`.
Структурна реалізація завершена локально; зовнішня release verification залишається відкритою.
Push, merge, production deployment та нові commits не виконувалися.

## Реалізовано

- Залишено 3 Nx projects: `gm-vocabulary`, `api`, `gm-vocabulary-e2e`.
- 183 source/test/template/style файли перенесено з 25 libraries у застосунки.
  Прибрано їхні configs, barrels і aliases; Nx plugins/generators збережено.
- Angular має окремий auth і vocabulary з words/collections; shared UI/forms,
  environments та Sass розміщено в Angular app.
- Nest modules, controllers, services, DTOs та schemas розміщено в auth і
  vocabulary/words/collections; common pipes/validators — у `src/common`.
- Збережено services/stores, lazy routes, provider scopes, storage keys,
  subscriptions/timers/cleanup; нових прикладних абстракцій немає.
- `strict`, `strictTemplates` та інші суворі перевірки діють на app/spec рівні.
  Зміни доступу `process.env.KEY` → `process.env['KEY']` і bracket access у
  assertions еквівалентні за поведінкою. Не додано `any`, suppressions чи
  послаблень strictness для приховування помилок.
- Folder lint захищає platform/shared/auth/persistence межі, включно з relative
  imports, configured TypeScript aliases, dynamic/type imports і re-exports.
- Оновлено root scripts, cache inputs, README і карту структури. CI доповнено
  boundary tests та API integration tests із наявним MongoDB service.

## Baseline і уточнення аудиту

Початковий dirty state: лише `.claude/` і три передані Markdown-документи.
`.claude/` не змінювалася; документи збережено й оновлено прогресом. Applicable
`AGENTS.md` у checkout/батьківських каталогах не знайдено. Інші сусідні репозиторії
не змінювалися.

Host toolchain: Node `24.15.0`, npm `11.15.0`; поле packageManager залишилося
`npm@11.6.1`. Використано вже встановлені host dependencies; Docker baseline і
final image виконали `npm ci` з lockfile. Dependencies і lockfile не змінено.

До змін lint для 28 projects, frontend typecheck, API application typecheck,
unit targets для 16 projects та обидва production builds пройшли без Nx cache.
Playwright baseline: 7 passed. Production API Docker build/start і HTTP smoke
пройшли з окремою тестовою MongoDB.

Наявний API E2E падав до запуску тесту: його окрема Vitest config не визначала
aliases. Для справжнього Nest DI/ValidationPipe також потрібна decorator metadata;
тестовий transform тепер створює її через наявний TypeScript compiler. E2E
використовує production prefix і ті самі параметри ValidationPipe.

Статичне припущення аудиту про повторне виконання library specs через app target
не підтверджено: Angular builder шукає specs у source root, а `tsconfig.include`
визначає типізацію, а не весь runtime discovery. Після перенесення всі 35 frontend
spec-файлів справді запускаються одним app target. Окремий Compose baseline до
moves не запускався; final isolated Compose перевірено повністю на startup/HTTP
smoke рівні.

## Фінальні локальні перевірки

| Перевірка | Фактичний результат |
| --- | --- |
| `nx show projects --json` | Рівно 3 projects |
| `npm run lint -- --skip-nx-cache` | 3 projects passed |
| `npm run typecheck` | Angular templates/app/specs та API app/specs/configs passed |
| `npm run test:ci -- --watch=false --output-style=static` | Angular: 35 files / 165 tests; API: 10 files / 31 tests; усі passed |
| `npm run test:api:e2e` з disposable MongoDB | 2 files / 7 tests passed |
| `npm run test:boundaries` | 6 tests passed, включно із забороненими imports |
| `npm run e2e -- --skip-nx-cache` з disposable MongoDB | 8 browser scenarios passed |
| `npm run build -- --skip-nx-cache` | Обидва production builds passed |
| `nx build gm-vocabulary --configuration=development --skip-nx-cache` | Passed, environment replacement і Sass references працюють |
| Production Docker build/start | Passed; uid 1000; немає source tree, TypeScript або Nx у runtime; generated package не має devDependencies |
| Production baseline/final та Compose HTTP contracts | Однакові statuses/response keys; signup/login, CRUD, validation, populate passed |
| Isolated Compose | Mongo/backend/frontend started; API smoke і 3 SPA paths passed |
| Nx test cache | API та Angular: unchanged state hit; source-only, spec-only, root-config-only зміни викликають реальний rerun; після відновлення — hit |
| Move audit | Усі 183 файли збережено; нормалізовані TS instructions без imports та еквівалентного bracket syntax збігаються; HTML/SCSS збігаються byte-for-byte |
| Test inventory | Усі 49 початкових файлів тестів збережено; додано contracts integration і navigation/copy browser файл; разом 51 |
| `git diff --check` | Passed |

Додані API сценарії перевіряють DI/model registration, фізичні `users`, `words`,
`wordgroups`, model names `Auth`, `Word`, `WordCollection`, refs/populate,
validation, bearer rejection, signup/login/legacy username, CRUD/ownership,
bulk/shared read/copy. Тестова config відмовляється запускати API E2E без явної
loopback Mongo URI з disposable `gm_structure_*` database та test JWT secret.

Browser regression додатково перевіряє shared copy/preview, direct lazy route,
reload/session restore, переходи між collection і власними words, back navigation
та expired session. Перший final browser запуск натрапив на тимчасово зайнятий
порт 3000; після його звільнення повний повтор завершився 8 passed. Чужі процеси
не зупинялися.

Build outputs залишилися `dist/apps/api` і `dist/gm-vocabulary/browser`; Nx
inferred API build outputs також указують `dist/apps/api`. Dockerfile, основний
Compose, Vercel config, порти та production API URL не змінено.

## Ізоляція, попередження й відкриті gates

MongoDB tests використовували окремий контейнер на loopback port 27028 із tmpfs.
Compose smoke використовував окремий project `gm-structure-20261015`, окремі
container names, ports 27029/3010/4210, Mongo tmpfs і нові dependency volumes.
Основний Compose-файл не змінювався. Тестові контейнери та лише створені для
цього smoke volumes прибрано; наявні volumes і production DB не використовувалися.

Наявний `sourceMap: true` у webpack packaging збережено: `main.js.map` містить
embedded sources. Перевірка «без source» тут означає запуск без source tree або
devDependencies; видалення debug maps було б окремою зміною packaging policy.

Angular production build має warning щодо початкового bundle (~545 kB проти
warning budget 500 kB); error budget не перевищено. У baseline та final browser
logs є Angular Material NG0100/snackbar і cdkFocusInitial warnings; сценарії
проходять. Вони не виправлялися як суміжна поведінка.

Зовнішні Render/Vercel dashboard root/build/start/output settings недоступні в
checkout і не перевірені. Репозиторний Vercel build/output/rewrite contract
збережено. Preview/staging deployment та віддалений GitHub CI run не виконувалися;
локально пройдено відповідні команди workflow. Не позначати ці зовнішні gates як
завершені без окремої фактичної перевірки.

Відомі ownership/groupId, collection deletion і auth/session defects не змінено.
Structural refactor не потребує data migration. Rollback: повернути відповідний
structural diff і зібрати попередній artifact; destructive DB cleanup не потрібен.
