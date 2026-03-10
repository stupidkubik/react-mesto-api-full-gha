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
