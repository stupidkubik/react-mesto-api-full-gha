# REFACTORING PLAN

updated: 2026-03-10
source: `deep-research-report (1).md` + фактический анализ текущего кода

## 1. Goal

Преобразовать текущий учебный fullstack-репозиторий в поддерживаемый baseline 2026 года, не ломая рабочие пользовательские сценарии и не начиная с чрезмерно рискованного big-bang rewrite.

## 2. What Exists Now

### Frontend

- React 18 на CRA (`react-scripts@5`).
- Маршрутизация через `react-router`.
- В `frontend/src/components/App.jsx` сосредоточены auth flow, загрузка данных, управление попапами, orchestration карточек и профиля.
- `frontend/src/utils/api.js` и `frontend/src/utils/auth.js` дублируют сетевую логику и жестко зашивают production API host.
- JWT хранится в `localStorage`.

### Backend

- Express 4 + Mongoose 7 + JWT + Celebrate.
- Роуты уже отражают стабильный домен: auth, users, cards, likes.
- Контроллеры смешивают transport, бизнес-логику и persistence.
- Есть слабые места в надежности и безопасности:
  - dev secret fallback (`DEV_KEY = 'string'`)
  - error handling не нормализован
  - env contract не документирован
  - first-party tests отсутствуют

### Repo and Delivery

- Нет root workspace и единых команд.
- CI привязан к `Node 16.x` и внешнему учебному тестовому репозиторию.
- Внутренние артефакты проектирования, ADR и release docs отсутствуют.

## 3. Recommended Strategy

Отчет предлагает радикальную платформенную модернизацию. Для этого репозитория разумнее идти в два слоя:

1. Сначала стабилизация и управляемый refactor без смены всех технологий одновременно.
2. Затем опциональная replatforming-фаза: Fastify/NestJS, Postgres/Prisma, новая deploy-модель.

### Recommended Target for Core Phase

- Frontend: `Vite + React + TypeScript`
- Backend: `TypeScript + layered Express`
- DB: `MongoDB` оставить на фазе стабилизации
- Contract: `OpenAPI 3.1`
- Testing: `Vitest`/`RTL`, `Supertest`, `Playwright`
- CI: supported Node LTS, приоритетно Node 24, допустим переходный Node 22

### Why This Path

- Проект маленький по домену; главный риск сейчас не в производительности, а в хрупкости кода и отсутствии тестов.
- Одновременная миграция CRA, backend framework и БД создаст слишком большую поверхность регрессий.
- Текущий REST-контракт уже достаточно ясен; выгоднее сначала сделать его явным и покрытым тестами.

## 4. Architecture Decisions to Fix Up Front

Перед стартом реализации нужно оформить как минимум три ADR:

1. `ADR-0001`: целевой frontend stack
2. `ADR-0002`: backend strategy (`layered Express first`)
3. `ADR-0003`: database strategy (`stabilize on Mongo first`, Postgres optional)

## 5. Workstreams

### Workstream A: Discovery and Baseline

Цель: зафиксировать текущее поведение и подготовить безопасную среду для изменений.

Задачи:
- Выписать текущие маршруты, payloads и коды ошибок.
- Собрать список неизвестных требований в `docs/unknowns.md`.
- Добавить корневой `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.editorconfig`.
- Выровнять базовые scripts для frontend и backend.
- Подготовить `.env.example` для frontend и backend.
- Добавить собственный CI pipeline параллельно существующему учебному.

Выход:
- воспроизводимый root-level setup
- decision log/ADR
- начальный CI baseline

Критерии готовности:
- проект устанавливается и запускается предсказуемо
- Node baseline зафиксирован
- документация по env существует
- новый CI не зависит от внешнего репозитория

### Workstream B: Contract First API

Цель: сделать API явным и проверяемым.

Задачи:
- Описать текущие endpoints в `openapi/openapi.yaml`.
- Нормализовать схемы `User`, `Card`, `Auth`, `ErrorResponse`.
- Зафиксировать единый формат ошибок и request id.
- Добавить contract/integration tests на auth/users/cards.
- Добавить `GET /health`.

Выход:
- OpenAPI 3.1 specification
- integration tests
- таблица соответствия старого и нового поведения

Критерии готовности:
- контракт валиден
- тесты подтверждают текущее поведение
- frontend может опираться на спецификацию, а не на чтение backend-кода

### Workstream C: Backend Refactoring

Цель: убрать связанность и подготовить backend к типизации и security hardening.

Задачи:
- Разделить backend на слои:
  - `routes` / `controllers`
  - `services`
  - `repositories`
  - `schemas/contracts`
  - `config`
- Вынести загрузку env в единый config module.
- Заменить разрозненные ошибки на единую error model.
- Исправить опасные места:
  - убрать небезопасный fallback secret
  - исключить двойные `next(...)`
  - нормализовать обработку mongoose/cast/validation errors
  - убрать избыточный `body-parser` в пользу встроенного `express.json()`
- Добавить structured logging и correlation id.
- Подготовить переход на TypeScript без немедленной смены framework runtime.

Выход:
- более чистая backend-структура
- предсказуемый error mapping
- конфигурация и auth изолированы от transport слоя

Критерии готовности:
- backend поведенчески совместим по контракту
- integration tests продолжают проходить
- конфигурация и секреты описаны и валидируются на старте

### Workstream D: Frontend Migration

Цель: уйти с CRA и разрезать монолитный `App.jsx` на понятные feature-модули.

Задачи:
- Мигрировать сборку с CRA на Vite.
- Подключить TypeScript постепенно: сначала API client, модели и feature state.
- Вынести сетевой слой в единый клиент:
  - `baseUrl` только через env
  - единая обработка ошибок
  - единая auth/session стратегия
- Разделить `App.jsx` на feature areas:
  - auth
  - profile
  - cards
  - popups/modals
  - shared api/session
- Нормализовать загрузочные и ошибочные состояния.
- Добавить smoke e2e для login/profile/cards.

Выход:
- frontend без `react-scripts`
- уменьшенный orchestration-компонент
- предсказуемый API слой

Критерии готовности:
- пользовательские сценарии работают как раньше
- production host больше не захардкожен
- сборка и dev server работают через новый toolchain

### Workstream E: Security Hardening

Цель: закрыть риски, подтвержденные текущим кодом.

Задачи:
- Перейти от хранения access token в `localStorage` к более безопасной session model.
- Выбрать схему:
  - `httpOnly refresh cookie + short-lived access token`
  - либо cookie-based session, если backend и frontend разворачиваются согласованно
- Документировать CORS policy по окружениям.
- Ужесточить headers, rate limits, input validation, secret handling.
- Добавить dependency audit и basic security checklist в CI/release flow.

Выход:
- новая auth/session схема
- security checklist
- сниженная чувствительность к XSS/token leakage

Критерии готовности:
- долгоживущая сессия не опирается на `localStorage`
- секреты не имеют небезопасных dev fallback в production flow
- release gate включает security checks

### Workstream F: QA, Release, Operations

Цель: превратить refactor в поставляемую систему, а не в разрозненные изменения.

Задачи:
- Собрать test pyramid:
  - backend integration
  - frontend component tests
  - e2e smoke
- Обновить CI: `lint`, `typecheck`, `test`, `build`.
- Подготовить `docs/runbook.md`, `docs/release-checklist.md`.
- Добавить smoke-after-deploy и rollback notes.

Выход:
- собственный quality gate
- минимальная operational readiness

Критерии готовности:
- есть автоматическая проверка ключевых потоков
- есть runbook и release checklist
- команда может откатиться после регрессии

### Workstream G: Optional Replatforming

Цель: выполнить более глубокую модернизацию только после завершения core phase.

Варианты:
- backend runtime migration: Express -> Fastify
- framework migration: Express -> NestJS
- database migration: MongoDB -> Postgres + Prisma
- deployment model migration: legacy hosting -> managed platform

Условия старта:
- contract tests стабильны
- smoke tests стабильны
- core refactor завершен
- есть решение в ADR и понимание бизнес-смысла миграции

## 6. Detailed Phase Plan

| Phase | Scope | Estimate | Dependencies | Main Deliverables |
|---|---|---:|---|---|
| 0 | Discovery, ADR, unknowns | 1-2 days | none | `docs/unknowns.md`, initial ADRs |
| 1 | Repo baseline and CI | 2-4 days | Phase 0 | root workspace, Node pin, CI, env templates |
| 2 | OpenAPI + backend tests | 3-5 days | Phase 1 | `openapi/openapi.yaml`, integration tests |
| 3 | Backend refactor on current runtime | 4-7 days | Phase 2 | layered backend structure, config/error cleanup |
| 4 | Frontend migration off CRA | 5-8 days | Phase 2 | Vite-based frontend, typed API layer |
| 5 | Security/session upgrade | 2-4 days | Phases 3-4 | secure auth/session flow |
| 6 | QA, release, ops docs | 2-4 days | Phases 3-5 | smoke tests, runbook, release checklist |
| 7 | Optional DB/framework replatforming | 8-15 days | Phase 6 | Prisma/Fastify/Nest/Postgres artifacts as needed |

Итого:

- Core modernization: `19-34` рабочих дней
- Optional deep replatforming: `8-15` рабочих дней дополнительно

## 6.1. Phase 1 Breakdown: Repo Baseline and CI

Чтобы не делать `Phase 1` одним большим инфраструктурным PR, его лучше разбить на небольшие подэтапы с понятным выходом.

### Phase 1.1: Runtime Baseline

Цель: зафиксировать базовую среду выполнения и убрать плавающий runtime.

Задачи:
- Добавить `.nvmrc`.
- Зафиксировать целевую версию Node в документации и CI.
- Проверить совместимость текущих `frontend/` и `backend/` зависимостей с выбранным Node baseline.
- Решить, нужен ли переходный baseline на Node 22 перед Node 24.

Выход:
- `.nvmrc`
- запись о Node strategy в ADR или `docs/unknowns.md`

Критерии готовности:
- в репозитории есть единый Node baseline
- понятно, какой runtime используется локально и в CI

### Phase 1.2: Root Tooling Skeleton

Цель: добавить корневую точку входа для разработки без немедленной ломки текущей структуры.

Задачи:
- Создать root `package.json`.
- Добавить `pnpm-workspace.yaml`.
- Определить, остаются ли `frontend/` и `backend/` как workspace packages без переезда.
- Добавить минимальный набор root scripts:
  - `install`
  - `lint`
  - `test`
  - `build`
- Не менять внутреннюю структуру приложений на этом шаге.

Выход:
- корневой `package.json`
- `pnpm-workspace.yaml`

Критерии готовности:
- команды можно запускать из корня
- текущие пакеты подключены к workspace без смены layout

### Phase 1.3: Local Consistency Files

Цель: сделать локальную работу предсказуемой и сократить шум в diff.

Задачи:
- Добавить `.editorconfig`.
- При необходимости подготовить базовый `.gitignore` review, не ломая текущие правила.
- Добавить корневой `.env.example`.
- Подготовить `frontend/.env.example` и `backend/.env.example`, если переменные различаются по доменам.

Выход:
- `.editorconfig`
- env templates

Критерии готовности:
- разработчику понятно, какие env нужны
- базовые правила форматирования зафиксированы

### Phase 1.4: Package Manager Standardization

Цель: убрать неоднозначность между текущими `package-lock.json` и целевым workspace-управлением.

Задачи:
- Выбрать основной package manager для всего репозитория.
- Если выбирается `pnpm`, определить стратегию перехода:
  - оставить существующие `package-lock.json` временно
  - или заменить их после успешной валидации install/build
- Проверить, какие scripts и lockfiles участвуют в CI.
- Задокументировать правило использования package manager в README или runbook.

Выход:
- согласованная стратегия package manager
- понятный путь миграции lockfiles

Критерии готовности:
- нет двойственной инструкции вида "локально npm, в CI pnpm, в root ничего"
- install workflow воспроизводим

### Phase 1.5: CI Modernization

Цель: добавить собственный поддерживаемый CI, не ломая текущий учебный workflow в первый день.

Задачи:
- Создать новый `.github/workflows/ci.yml`.
- Перенести CI на поддерживаемый Node LTS.
- Настроить install/lint/test/build из корня.
- Сначала запускать новый CI параллельно старому `tests.yml`.
- После стабилизации решить, архивировать ли учебный workflow.

Выход:
- новый CI pipeline

Критерии готовности:
- новый workflow не зависит от внешнего учебного репозитория
- pipeline отражает реальное состояние проекта, а не только требования учебной платформы

### Phase 1.6: Phase 1 Exit Review

Цель: закрыть инфраструктурную фазу не по ощущению, а по явным критериям.

Задачи:
- Проверить, что корневые команды выполняются предсказуемо.
- Проверить, что env templates покрывают текущие потребности frontend и backend.
- Проверить, что новый CI запускается и дает читаемый фидбек.
- Зафиксировать оставшиеся технические долги, которые сознательно перенесены в `Phase 2+`.

Выход:
- короткий phase exit summary
- обновленный `docs/unknowns.md` или ADR notes

Критерии готовности:
- `Phase 2` можно начинать без возврата к базовой инфраструктуре
- не осталось неявных решений по Node/package manager/CI/env

### Recommended PR Split for Phase 1

Чтобы работать вдумчиво и не смешивать разные классы изменений, `Phase 1` лучше вести так:

1. PR A: `.nvmrc` + Node strategy
2. PR B: root `package.json` + `pnpm-workspace.yaml`
3. PR C: `.editorconfig` + `.env.example`
4. PR D: package manager cleanup / lockfile strategy
5. PR E: new `ci.yml`
6. PR F: phase exit review and docs cleanup

## 6.2. Phase 2 Breakdown: OpenAPI and Backend Tests

`Phase 2` не должен начинаться с "сразу пишем идеальную спецификацию". Сначала нужно зафиксировать текущее поведение API, затем привести его к явному контракту, и только потом строить вокруг него тесты и дальнейший refactor.

### Phase 2.1: API Inventory and Behavior Capture

Цель: собрать полный список того, что backend реально делает сейчас.

Задачи:
- Выписать все существующие маршруты из `backend/routes/*`.
- Зафиксировать структуру request/response payloads по коду контроллеров.
- Отдельно отметить нестабильности и неявности:
  - разные форматы ошибок
  - отсутствие `requestId`
  - implicit status codes
  - расхождения между фактическим кодом и желаемым контрактом
- Завести рабочую mapping-таблицу "route -> current behavior -> target contract".

Выход:
- route inventory
- current behavior matrix

Критерии готовности:
- все текущие публичные endpoints перечислены
- для каждого endpoint понятны входы, выходы и типовые ошибки

### Phase 2.2: Contract Baseline and Error Model

Цель: определить, что именно считается "истиной" для API на этой фазе.

Задачи:
- Утвердить формат базового `ErrorResponse`.
- Определить минимальный набор общих схем:
  - `AuthTokenResponse`
  - `User`
  - `UserPublic`
  - `Card`
  - `ErrorResponse`
- Решить, какие несоответствия текущего API сохраняются как legacy behavior, а какие исправляются сразу.
- Зафиксировать naming convention:
  - путь
  - operationId
  - schema names
  - error codes

Выход:
- начальная contract glossary
- agreed error model

Критерии готовности:
- понятно, как выглядят success и error responses
- нет двусмысленности по именованию схем и операций

### Phase 2.3: OpenAPI Skeleton

Цель: создать минимальный, но валидный каркас спецификации, в который дальше можно безопасно добавлять детали.

Задачи:
- Создать `openapi/openapi.yaml`.
- Описать:
  - `openapi` version
  - `info`
  - `servers`
  - `tags`
  - `components/schemas`
  - `components/securitySchemes`
- Добавить базовые reusable responses для ошибок.

Выход:
- валидный skeleton OpenAPI 3.1

Критерии готовности:
- файл существует и проходит валидацию структурно
- общие схемы и security model объявлены один раз, а не размазаны по endpoint-описаниям

### Phase 2.4: Auth Contract

Цель: формализовать authentication endpoints отдельно от остального домена.

Задачи:
- Описать `POST /signup`.
- Описать `POST /signin`.
- Явно указать success status codes и body schema.
- Явно указать validation/auth/conflict errors.
- Отметить, что current auth model пока legacy JWT bearer, а не финальная secure session design.

Выход:
- спецификация auth endpoints

Критерии готовности:
- auth flow описан полностью и без обращения к backend-коду
- зафиксировано, какие изменения auth откладываются в `Phase 5`

### Phase 2.5: Users and Cards Contract

Цель: описать основной доменный API проекта.

Задачи:
- Описать:
  - `GET /users`
  - `GET /users/me`
  - `GET /users/{userID}`
  - `PATCH /users/me`
  - `PATCH /users/me/avatar`
  - `GET /cards`
  - `POST /cards`
  - `DELETE /cards/{cardId}`
  - `PUT /cards/{cardId}/likes`
  - `DELETE /cards/{cardId}/likes`
- Нормализовать path params, request bodies и response bodies.
- Явно отметить ownership rules и типовые error cases.
- Добавить `GET /health` как системный endpoint, если он вводится уже на этой фазе.

Выход:
- полный доменный OpenAPI contract для текущего Mesto API

Критерии готовности:
- все текущие user/card endpoints формально описаны
- нет "серых зон", где поведение известно только из кода контроллера

### Phase 2.6: Backend Test Harness

Цель: создать основу для собственных backend integration tests.

Задачи:
- Выбрать test runner и HTTP testing stack.
- Определить подход к тестовой БД:
  - локальный Mongo instance
  - `mongodb-memory-server`
  - testcontainers
- Подготовить test bootstrap:
  - app factory / test server entrypoint
  - setup/teardown hooks
  - isolated env for tests
- Свести startup backend к форме, пригодной для импортируемого тестового запуска, а не только `app.listen(...)`.

Выход:
- backend test harness
- базовая структура тестов

Критерии готовности:
- тестовый раннер может поднять backend без ручного старта процесса
- тестовая среда изолирована от development DB

### Phase 2.7: Integration Tests for Current Contract

Цель: покрыть ключевые сценарии текущего API до начала внутреннего рефакторинга backend.

Задачи:
- Добавить integration tests на:
  - signup/signin
  - unauthorized access
  - get current user
  - update profile/avatar
  - create/get/delete card
  - like/unlike card
  - forbidden delete чужой карточки
  - not found / validation errors
- Связать тесты с route inventory и OpenAPI, чтобы было видно покрытие.
- Не чинить архитектуру backend в этом шаге, только фиксировать текущее поведение.

Выход:
- первый набор contract-oriented integration tests

Критерии готовности:
- ключевые маршруты покрыты happy path и базовыми error path
- backend refactor следующей фазы можно делать с safety net

### Phase 2.8: Phase 2 Exit Review

Цель: завершить фазу формальным подтверждением, что контракт и тестовая база готовы для `Phase 3`.

Задачи:
- Проверить полноту OpenAPI-описания относительно route inventory.
- Проверить, что integration tests действительно запускаются в CI-совместимом режиме.
- Выписать расхождения "current behavior vs desired behavior", которые сознательно откладываются.
- Обновить `docs/unknowns.md` и ADR notes при появлении новых решений.

Выход:
- phase exit summary
- contract coverage summary

Критерии готовности:
- `Phase 3` можно начинать без повторного reverse-engineering backend
- есть явный контракт и минимальная safety net тестов

### Recommended PR Split for Phase 2

1. PR A: route inventory + contract glossary + error model draft
2. PR B: `openapi/openapi.yaml` skeleton + auth contract
3. PR C: users/cards contract completion
4. PR D: backend test harness
5. PR E: integration tests for key flows
6. PR F: phase exit review and coverage summary

## 6.3. Phase 3 Breakdown: Backend Refactor on Current Runtime

`Phase 3` должен использовать safety net из `Phase 2`, а не ломать backend "по вдохновению". Сначала фиксируем целевую структуру и boundaries, потом двигаем код по слоям маленькими обратимыми шагами.

### Phase 3.1: Backend Refactor Strategy and Target Structure

Цель: зафиксировать, каким должен стать backend после refactor, не меняя пока доменное поведение.

Задачи:
- Утвердить, что текущий runtime остается `Express + Mongoose + CommonJS` на время `Phase 3`.
- Зафиксировать целевую структуру модулей и общих слоев.
- Разделить понятия:
  - transport
  - application/service
  - persistence/repository
  - config
  - shared errors
- Определить, какие файлы будут мигрировать первыми и какие пока остаются legacy.

Выход:
- ADR по backend refactor strategy
- target structure document

Критерии готовности:
- есть явная схема будущей структуры backend
- дальнейшие PR не спорят о базовой архитектуре в каждом изменении

### Phase 3.2: Config Boundary

Цель: убрать прямую размазанную зависимость от `process.env` и подготовить backend к валидации конфигурации.

Задачи:
- Создать единый config module.
- Централизовать:
  - `PORT`
  - `DB_URL`
  - `TEST_DB_URL`
  - `NODE_ENV`
  - `JWT_SECRET`
  - CORS/rate limit settings
- Определить safe defaults только там, где они действительно нужны.
- Убрать прямые чтения env из middleware/controllers.

Выход:
- config module
- backend env contract reflected in code

Критерии готовности:
- runtime config читается из одного места
- тесты и app startup используют один и тот же config path

### Phase 3.3: Error and Response Normalization Layer

Цель: сделать error mapping предсказуемым, не ломая действующий runtime envelope раньше времени.

Задачи:
- Создать общий слой app errors / http mapping.
- Исключить двойные `next(...)` и неявные ветки обработки ошибок.
- Нормализовать обработку:
  - celebrate validation
  - mongoose validation
  - mongoose cast/document not found
  - unexpected internal errors
- Сохранить текущий `{ "message": "..." }` envelope как runtime behavior, пока Phase 5 не изменит контракт.

Выход:
- centralized error mapping

Критерии готовности:
- routes/controllers не размазывают error semantics вручную
- backend tests подтверждают, что current contract не сломан

### Phase 3.4: Transport Cleanup

Цель: привести HTTP bootstrap и middleware composition в более поддерживаемый вид.

Задачи:
- Убрать `body-parser` в пользу встроенных средств Express.
- Упорядочить middleware pipeline:
  - security headers
  - parsers
  - request logging
  - rate limit
  - routing
  - error handling
- Выделить router composition в явный boundary.
- Решить судьбу `crash-test` route: оставить test-only или ограничить средой.

Выход:
- cleaner app bootstrap
- reduced transport noise

Критерии готовности:
- startup file короче и понятнее
- transport concerns не смешаны с доменной логикой сильнее, чем сейчас

### Phase 3.5: Module Extraction

Цель: перейти от "controllers directly talk to models" к более слоистому backend без full rewrite.

Задачи:
- Начать выносить логику в модули:
  - `auth`
  - `users`
  - `cards`
- Для каждого модуля определить:
  - controller
  - service
  - repository boundary
  - validation/contracts
- Не менять API shape во время extraction.

Выход:
- first extracted backend modules

Критерии готовности:
- хотя бы один доменный модуль вынесен по новой схеме
- тесты продолжают проходить

### Phase 3.6: Logging and Operational Hygiene

Цель: убрать очевидные legacy-проблемы эксплуатации.

Задачи:
- Пересмотреть file-based logging strategy.
- Решить судьбу `request.log` / `error.log` в рабочем дереве.
- Добавить более безопасный путь к structured logging.
- Подготовить request correlation как следующий шаг, даже если сам `requestId` пока не выходит в response contract.

Выход:
- cleaned logging approach
- reduced repo noise from runtime artifacts

Критерии готовности:
- тесты и локальный запуск не засоряют репозиторий runtime логами
- logging strategy задокументирована

### Phase 3.7: Phase 3 Exit Review

Цель: формально закрыть backend refactor phase и отделить ее от будущего security/frontend work.

Задачи:
- Сверить новую backend-структуру с ADR и target structure document.
- Проверить, что OpenAPI и backend tests все еще отражают runtime behavior.
- Обновить `docs/unknowns.md` и coverage notes при необходимости.
- Зафиксировать, что именно осталось на `Phase 4+`.

Выход:
- phase exit review

Критерии готовности:
- backend internals стали чище без потери contract stability
- Phase 4 может начинаться без возврата к backend architectural baseline

### Recommended PR Split for Phase 3

1. PR A: backend refactor ADR + target structure
2. PR B: config module extraction
3. PR C: centralized error mapping
4. PR D: transport cleanup
5. PR E: first module extraction
6. PR F: logging hygiene
7. PR G: phase exit review

## 6.4. Phase 4 Breakdown: Frontend Migration Off CRA

`Phase 4` нельзя делать как один frontend rewrite. Здесь разумнее разделить работу на migration baseline, API/session boundary и feature decomposition.

### Phase 4.1: Frontend Runtime Inventory and Migration Strategy

Цель: зафиксировать текущее frontend behavior и целевой migration path до начала кодовых изменений.

Задачи:
- Описать текущий runtime frontend:
  - routing
  - auth bootstrap
  - initial data loading
  - popup orchestration
  - API usage
- Зафиксировать основные точки хрупкости:
  - CRA toolchain
  - hardcoded API host
  - `localStorage` token dependency
  - oversized `App.jsx`
  - отсутствие frontend tests
- Выбрать migration approach:
  - in-place migration inside `frontend/`
  - без параллельного переписывания всего UI
- Сверить план frontend migration с уже зафиксированным backend contract.

Выход:
- frontend migration strategy document
- current-state inventory for frontend runtime

Критерии готовности:
- понятно, что именно мигрируется сначала, а что остается временно legacy
- следующая фаза не требует повторного reverse-engineering `App.jsx`

### Phase 4.2: Vite Baseline Without Behavioral Changes

Цель: убрать CRA как build/runtime dependency, не меняя пользовательские сценарии.

Задачи:
- Перевести `frontend/` с `react-scripts` на `Vite`.
- Настроить новый entrypoint и статические assets.
- Сохранить текущую SPA routing model.
- Подготовить root/frontend scripts для:
  - `dev`
  - `build`
  - `preview`
- Не менять доменную логику на этом шаге.

Выход:
- working Vite-based frontend baseline

Критерии готовности:
- frontend запускается через Vite
- production build собирается без CRA
- UI behavior до рефакторинга feature-слоев остается прежним

### Phase 4.3: Env and API Client Boundary

Цель: убрать hardcoded host и объединить сетевой слой в один предсказуемый клиент.

Задачи:
- Ввести frontend config module для env-backed значений.
- Заменить hardcoded API URL на `VITE_*` env variables.
- Объединить `utils/api.js` и `utils/auth.js` в единый API/auth client boundary.
- Нормализовать:
  - base request helper
  - auth header injection
  - response parsing
  - error mapping
- Зафиксировать интерфейс клиента так, чтобы он совпадал с backend contract.

Выход:
- unified frontend API client
- env-driven runtime config

Критерии готовности:
- production host больше не зашит в исходниках
- auth и domain requests используют одну request pipeline

### Phase 4.4: Auth and Session Boundary Cleanup

Цель: отделить auth bootstrap от UI orchestration, не меняя пока сам session model.

Задачи:
- Выделить auth/session state в отдельный слой.
- Вынести логику:
  - `checkToken`
  - `handleLogin`
  - `handleRegistration`
  - `handleExit`
- Сохранить текущий `localStorage` token flow как временный runtime contract до `Phase 5`.
- Подготовить boundary, который потом позволит перейти на cookie/session model.

Выход:
- isolated auth/session module

Критерии готовности:
- `App.jsx` больше не владеет всей auth логикой напрямую
- будущий security refactor не требует повторной декомпозиции UI tree

### Phase 4.5: App Shell and Routing Decomposition

Цель: уменьшить размер и ответственность `App.jsx`.

Задачи:
- Оставить в `App` только composition concerns:
  - providers
  - routes
  - shell-level state wiring
- Вынести route composition и guard wiring в отдельные frontend modules.
- Убрать из `App.jsx` смешение:
  - auth bootstrap
  - data bootstrap
  - popup handlers
  - route rendering

Выход:
- slimmer app shell
- clearer route composition

Критерии готовности:
- `App.jsx` читается как entry composition, а не как монолитный runtime controller
- маршруты и protected flow изолированы от popup/domain logic

### Phase 4.6: Feature Extraction for Profile, Cards, and Popups

Цель: разрезать UI-логику по доменным областям без изменения API shape.

Задачи:
- Выделить feature areas:
  - auth
  - profile
  - cards
  - popups/modals
  - shared session/api
- Перевести data-loading и mutations в feature-oriented hooks/services.
- Упорядочить состояния:
  - loading
  - submit pending
  - request failure
  - optimistic/replace flows for cards
- Минимизировать prop drilling там, где сейчас orchestration слишком плотная.

Выход:
- feature-based frontend structure

Критерии готовности:
- основные пользовательские сценарии не зависят от одного гигантского компонента
- profile/cards/popups изменяются без каскадных правок по всему дереву

### Phase 4.7: Frontend Test Baseline

Цель: получить safety net перед будущими auth/security изменениями.

Задачи:
- Выбрать test runner для Vite-era frontend.
- Добавить минимум:
  - smoke render test
  - auth flow unit/integration coverage
  - cards/profile happy-path coverage
- Решить стратегию mock API:
  - lightweight fetch mocks
  - либо MSW как следующий шаг
- Подготовить frontend tests к включению в root CI.

Выход:
- first-party frontend test baseline

Критерии готовности:
- frontend refactor дальше не идет вслепую
- ключевые сценарии имеют хотя бы минимальную automated protection

### Phase 4.8: Phase 4 Exit Review

Цель: формально закрыть frontend migration phase и отделить ее от `Phase 5` security/session work.

Задачи:
- Проверить, что frontend больше не зависит от CRA.
- Сверить frontend API client с OpenAPI/current backend contract.
- Обновить `docs/unknowns.md` и notes по residual legacy.
- Зафиксировать, что осталось на `Phase 5`:
  - session model upgrade
  - deeper typing
  - e2e expansion

Выход:
- phase exit review

Критерии готовности:
- frontend toolchain и runtime structure стабилизированы
- security/session upgrade можно делать поверх нового frontend baseline

### Recommended PR Split for Phase 4

1. PR A: frontend migration strategy + inventory
2. PR B: Vite baseline
3. PR C: env config + unified API client
4. PR D: auth/session boundary extraction
5. PR E: app shell decomposition
6. PR F: profile/cards/popups feature extraction
7. PR G: frontend test baseline
8. PR H: phase exit review

## 7. Implementation Order Inside the Codebase

Ниже порядок, который минимизирует риск:

1. Ничего не переписывать, пока не зафиксированы маршруты и env contract.
2. Добавить root tooling и CI, не меняя доменную логику.
3. Написать contract/integration tests на текущий backend.
4. Только после этого рефакторить backend internals.
5. Мигрировать frontend с сохранением API shape.
6. Потом менять session model.
7. Только затем обсуждать смену БД или framework runtime.

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Одновременная смена FE, BE и DB | Очень высокий | Высокая | Разделить на core и optional phases |
| Потеря текущего поведения auth/cards | Высокий | Средняя | Сначала integration + smoke tests |
| Несовместимость старых зависимостей с новым Node | Средний | Средняя | Переходный baseline Node 22, затем Node 24 |
| Затяжка проекта из-за лишней архитектуры | Средний | Высокая | Не вводить Nest/Postgres без ADR и подтвержденной ценности |
| Security regression при миграции auth | Высокий | Средняя | Менять session flow только после контрактных тестов |

## 9. Acceptance Criteria for the Whole Program

- Репозиторий имеет единый поддерживаемый baseline разработки.
- Frontend больше не зависит от CRA.
- API контракт формализован и проверяется автоматически.
- Auth/profile/cards smoke flow покрыт тестами.
- Небезопасные практики текущего состояния устранены или задокументированы как временные исключения.
- Все ключевые решения и неизвестные требования зафиксированы в документации.

## 10. What Not to Do First

- Не начинать с миграции MongoDB -> Postgres.
- Не начинать с переписывания backend на NestJS без тестов и контрактов.
- Не менять frontend framework и backend runtime в одном PR.
- Не тащить новые инфраструктурные сервисы раньше, чем появится базовый CI и тесты.

## 11. First Executable Milestone

Минимальный разумный milestone для старта:

1. root workspace + Node pin + CI
2. `.env.example`
3. `openapi/openapi.yaml`
4. backend integration tests
5. frontend smoke test

После этого можно безопасно начинать фактический рефакторинг кода.
