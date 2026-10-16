# ADR: спростити структуру та зберегти Nx

Дата: 2026-10-15. Статус: **Accepted; implemented locally**.

Користувач авторизував поетапну реалізацію запропонованого варіанта A в новому чаті з GPT-6.1 Sol. Прийняття рішення не означає завершення реалізації. Перед перенесенням в інший checkout перевірити, чи немає конфлікту з його ADR numbering.

## Контекст

Два runtime-застосунки мають 25 внутрішніх libraries. Значна частина libraries містить один компонент або schema. Навігація між технічними шарами та конфігураційні витрати непропорційні масштабу. Words/collections тісно пов'язані в UI і persistence. Nx забезпечує platform/type constraints, але domain tags не мають власних constraints.

Докази, обмеження і порівняння: [аудит](../simplification-audit.md).

## Запропоноване рішення

1. Зберегти Nx для gm-vocabulary, api та gm-vocabulary-e2e.
2. Перенести прикладний код у apps/*/src без внутрішніх Nx libraries.
3. Організувати Angular за auth і vocabulary; words/collections залишити окремими підобластями vocabulary. Shared UI не знає features.
4. Зберегти AuthModule, WordsModule і WordCollectionsModule на першому етапі; schemas розмістити поруч із відповідними modules.
5. Контролювати внутрішні imports через прості ESLint restrictions. Nx project tags більше не захищатимуть підпапки всередині app.
6. Нові libraries створювати лише за доведеного незалежного споживача або іншої конкретної потреби, яку не вирішує папка.

Спільна папка vocabulary не означає злиття controllers/services, зміни API, автоматичного створення VocabularyModule або твердження, що words/collections незалежні bounded contexts.

## Інваріанти

- Незмінні API routes/methods/statuses/response shapes і validation semantics.
- Незмінні Mongo collections, model names, refs, document IDs та поточна поведінка запитів.
- Незмінні Angular routes, lazy loading, DI scopes, auth storage keys та lifecycle.
- Збережені потрібні TypeScript/template checks і повне test discovery.
- Незмінні output paths, Docker runtime, порти, env names та deployment workflows.
- Жодних нових generic repository, CQRS/event bus, ports/adapters або packages заради симетрії.

## Альтернативи

### Залишити поточну library-first структуру

Зберігає поточні project boundaries, але не вирішує головну проблему щоденної навігації й overhead.

### Прибрати Nx зараз

Технічно можливо. Додатково потребує заміни API packaging, build/serve/test commands, CI/Vercel та перевірки module format. Прикладна структура буде такою самою, як у рекомендованому варіанті. Відкладено до появи вимірюваної користі.

## Наслідки

Позитивні: менше projects/configs, пов'язані файли поряд, простіший вибір місця для нового коду.

Компроміси: Nx залишається залежністю; кешування стає на рівні застосунків; folder boundaries потребують explicit lint rules; приховані type/discovery/runtime проблеми можуть проявитися під час консолідації.

## Перегляд рішення

Переглянути збереження Nx, якщо після спрощення його maintenance, update friction або execution overhead залишаються вимірюваною проблемою. PostgreSQL, observability та навчання microservices самі по собі не вимагають зміни цього рішення.

## Прийняття і перевірка

Напрям погоджений через вибір користувачем поетапної реалізації. Реалізація перевіряється за [планом](../simplification-plan.md); завершення не можна оголошувати лише на підставі статичного аудиту чи історичного зеленого CI. Push, merge і production deployment окремо не авторизовано.

## Фактична реалізація

Структуру перенесено до застосунків; залишено 3 Nx projects. Локальні tests/builds/container checks та зовнішні обмеження: [verification record](../simplification-verification.md). Preview/staging і remote CI ще не виконувалися.
