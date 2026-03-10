# ARTIFACTS

Ниже перечислены артефакты, которые стоит добавить или сформировать в процессе модернизации. Список разбит по приоритету, чтобы можно было использовать его как backlog инфраструктурных и архитектурных поставок.

## P0: Foundation

| Priority | Area | Artifact | Purpose | Notes |
|---|---|---|---|---|
| P0 | Root | `package.json` | Корневые scripts для `install`, `lint`, `typecheck`, `test`, `build` | Сейчас root package отсутствует |
| P0 | Root | `pnpm-workspace.yaml` | Объединить frontend/backend в единый workspace | Нужен для управляемого monorepo |
| P0 | Root | `.nvmrc` | Зафиксировать Node baseline | Целевой baseline: актуальный LTS |
| P0 | Root | `.editorconfig` | Стабилизировать форматирование и отступы | Снизит шум в diff |
| P0 | Root | `.env.example` | Общие документированные переменные окружения | Можно разбить на FE/BE env files |
| P0 | Docs | `AGENT.MD` | Роль, принципы, правила работы агента | Создается сейчас |
| P0 | Docs | `SKILLS.MD` | Матрица компетенций и последовательность модернизации | Создается сейчас |
| P0 | Docs | `ARTIFACTS.MD` | Явный реестр deliverables | Создается сейчас |
| P0 | Docs | `REFACTORING-PLAN.MD` | Пошаговый план работ | Создается сейчас |
| P0 | Docs | `docs/unknowns.md` | Фиксация открытых вопросов и зависимостей | Нужен до начала необратимых решений |
| P0 | Docs | `docs/adr/ADR-0001-target-stack.md` | Зафиксировать выбранный стек и отклоненные варианты | ADR должны накапливаться по мере решений |

## P1: Contract and Testing

| Priority | Area | Artifact | Purpose | Notes |
|---|---|---|---|---|
| P1 | API | `openapi/openapi.yaml` | Единый контракт REST API | Базируется на текущих маршрутах `/signup`, `/signin`, `/users`, `/cards` |
| P1 | API | `openapi/examples/*` | Примеры request/response payloads | Полезно для FE и тестов |
| P1 | Backend | `backend/test/` или `apps/api/test/` | Integration tests для auth/users/cards | Желательно через Supertest |
| P1 | Frontend | `frontend/src/__tests__/` или `apps/web/src/__tests__/` | Unit/component tests | React Testing Library + Vitest |
| P1 | E2E | `tests/e2e/` | Smoke сценарии логин/карточки/профиль | Playwright |
| P1 | CI | `.github/workflows/ci.yml` | Собственный CI вместо учебного сценария | Старый workflow можно оставить временно |
| P1 | CI | `.github/workflows/smoke.yml` | Отдельный smoke после deploy | Опционально после появления deploy pipeline |

## P1: Frontend

| Priority | Area | Artifact | Purpose | Notes |
|---|---|---|---|---|
| P1 | Frontend | `apps/web/` или обновленный `frontend/` | Новая кодовая база без CRA | Предпочтительно Vite + TS |
| P1 | Frontend | `frontend/.env.example` | Параметризация API base URL и client config | Убрать hardcoded domain |
| P1 | Frontend | `src/shared/api/client.ts` | Единый typed API client | Заменить дублирование `api.js` и `auth.js` |
| P1 | Frontend | `src/features/auth/` | Отдельный auth flow | Текущее поведение собрано в `App.jsx` |
| P1 | Frontend | `src/features/cards/` | CRUD и likes как feature module | Упростит state management |
| P1 | Frontend | `src/features/profile/` | Профиль и аватар | Избавит `App.jsx` от orchestration-кода |
| P1 | Frontend | `src/shared/ui/modal/` | Унификация popup infrastructure | Сейчас много отдельной popup-логики |

## P1: Backend

| Priority | Area | Artifact | Purpose | Notes |
|---|---|---|---|---|
| P1 | Backend | `backend/src/config/` | Централизованная загрузка конфигурации | Убрать прямой доступ к `process.env` по коду |
| P1 | Backend | `backend/src/modules/auth/` | Auth routes/service/repository/contracts | Изолировать логин/регистрацию |
| P1 | Backend | `backend/src/modules/users/` | Users module | Сохранить текущий контракт |
| P1 | Backend | `backend/src/modules/cards/` | Cards module | Сохранить текущий контракт |
| P1 | Backend | `backend/src/common/errors/` | Единая error model | Сейчас ошибки разрознены |
| P1 | Backend | `backend/src/common/middlewares/` | Логирование, request id, error mapping | Текущие middleware уже есть, но не собраны в общую систему |
| P1 | Backend | `backend/.env.example` | Документированная конфигурация API, DB, JWT, CORS | Сейчас env contract не описан |
| P1 | Backend | `backend/src/app.ts` | Точка входа после перехода на TS | Может появиться позже при миграции на TS |

## P2: Security and Operations

| Priority | Area | Artifact | Purpose | Notes |
|---|---|---|---|---|
| P2 | Security | `SECURITY.MD` | Политика security и reporting path | Сейчас отсутствует |
| P2 | Security | `docs/security-checklist.md` | Контрольный список hardening | Использовать перед релизом |
| P2 | Ops | `docs/runbook.md` | Runbook запуска и инцидентного реагирования | Полезен даже для pet/project-level среды |
| P2 | Ops | `docs/release-checklist.md` | Формализовать release gates | Снизит риск регрессий |
| P2 | Ops | `docker-compose.yml` | Локальная воспроизводимость FE + BE + DB | Не обязателен в фазе 0, но желателен |
| P2 | Ops | `Dockerfile.frontend`, `Dockerfile.backend` | Контейнеризация | Нужна для унифицированного deploy pipeline |
| P2 | Ops | `docs/observability.md` | Логи, метрики, алерты, request correlation | Можно начать с базового structured logging |

## P3: Optional Replatforming

| Priority | Area | Artifact | Purpose | Notes |
|---|---|---|---|---|
| P3 | Database | `prisma/schema.prisma` | Целевая реляционная схема | Только если принято решение о Postgres |
| P3 | Database | `prisma/migrations/*` | Управляемые миграции | Только после ADR по БД |
| P3 | Database | `scripts/migrate-mongo-to-postgres.*` | Скрипты переноса данных | Делать отдельной фазой |
| P3 | Backend | `apps/api/` | Новый backend runtime | Нужен только при решении уйти с текущего backend layout |
| P3 | Infra | `.github/workflows/deploy.yml` | Production deployment pipeline | Имеет смысл после стабилизации core CI |

## Recommended Target Tree

```text
.
├── AGENT.MD
├── SKILLS.MD
├── ARTIFACTS.MD
├── REFACTORING-PLAN.MD
├── package.json
├── pnpm-workspace.yaml
├── .nvmrc
├── .editorconfig
├── docs/
│   ├── unknowns.md
│   ├── runbook.md
│   ├── release-checklist.md
│   └── adr/
├── openapi/
│   └── openapi.yaml
├── frontend/ or apps/web/
├── backend/ or apps/api/
└── tests/
    └── e2e/
```

## Delivery Rule

Сначала должны появиться документы и базовые артефакты P0/P1, и только затем имеет смысл начинать глубокую смену платформы, БД или деплой-модели.
