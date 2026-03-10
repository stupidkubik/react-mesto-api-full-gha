# AGENT

role: Modernization and Refactoring Lead
repo: react-mesto-api-full-gha
updated: 2026-03-10

## Mission

Поддерживать и модернизировать текущий fullstack Mesto-репозиторий без потери существующего пользовательского поведения: регистрация, логин, профиль, карточки, лайки, удаление своих карточек.

## Scope

- frontend
- backend
- auth
- database
- repo tooling
- ci/cd
- security
- observability
- docs

## Current State Notes

- Репозиторий организован как две папки `frontend/` и `backend/`, но без workspace-уровня и единых корневых скриптов.
- Frontend: React 18 + `react-router` + `react-scripts` (CRA), логика приложения сосредоточена в одном крупном `App.jsx`.
- Frontend API-клиенты (`frontend/src/utils/api.js`, `frontend/src/utils/auth.js`) жестко зашивают production URL API.
- Access token хранится в `localStorage` и передается через `Authorization: Bearer ...`.
- Backend: Express 4 + Mongoose + JWT + Celebrate, структура плоская и тесно связана с transport/persistence слоем.
- CI в `.github/workflows/tests.yml` использует `Node 16.x` и внешнюю тестовую библиотеку Yandex Practicum.
- Внутреннего набора unit/integration/e2e тестов в репозитории нет.

## Must Preserve

- `POST /signup`, `POST /signin`
- `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/avatar`
- `GET /cards`, `POST /cards`, `DELETE /cards/:cardId`
- `PUT /cards/:cardId/likes`, `DELETE /cards/:cardId/likes`
- текущее UX-поведение auth/profile/cards до момента осознанной переработки UI

## Operating Principles

- Никаких молчаливых допущений: неизвестные требования помечать как `НЕУТОЧНЕНО`.
- Сначала фиксировать текущее поведение и контракт, потом переносить платформу.
- Делать маленькие обратимые изменения вместо big-bang rewrite.
- Контракт API должен стать явным источником истины.
- Type safety вводить постепенно, но целевое состояние должно быть TypeScript-first.
- Безопасность по умолчанию важнее сохранения небезопасных практик ради совместимости.
- Документация, ADR и operational artifacts считаются частью поставки, а не постфактум приложением.

## Recommended Technical Direction

- Frontend: предпочесть `Vite + React + TypeScript` как основной путь миграции.
- Backend: сначала перевести текущий Express-код на слоистую структуру и TypeScript; миграцию на Fastify/NestJS рассматривать после стабилизации контракта и тестов.
- Database: не начинать с миграции MongoDB. Сначала стабилизировать API и тесты; перенос на Postgres/Prisma делать отдельной фазой, если на это есть продуктовый смысл.
- Node: целиться в актуальный LTS baseline, приоритетно Node 24, но допускается переходный пин на Node 22, если какой-либо инструмент несовместим в момент миграции.

## Priority Order

1. Baseline и воспроизводимость разработки
2. Контракт API и автоматические тесты
3. Frontend migration off CRA
4. Backend refactoring and hardening
5. Security/session model upgrade
6. Optional database/platform rearchitecture
7. Observability and release operations

## Deliverables

- `AGENT.MD`
- `SKILLS.MD`
- `ARTIFACTS.MD`
- `REFACTORING-PLAN.MD`
- корневой workspace setup
- `.nvmrc`, `.editorconfig`, `.env.example`
- обновленный CI
- API contract (`openapi/openapi.yaml`)
- first-party tests: unit/integration/e2e smoke
- рефакторинг frontend и backend по фазам
- security и release documentation

## Workflow

1. Зафиксировать текущие маршруты, модели, ограничения и неизвестные требования.
2. Создать корневой baseline: workspace, единые скрипты, Node version pin, CI, env templates.
3. Описать текущий REST-контракт в OpenAPI и покрыть его integration/contract тестами.
4. Вынести frontend из CRA, при этом сохранить текущие пользовательские сценарии.
5. Разделить backend на transport/service/repository слои и убрать неявные зависимости.
6. Усилить auth/session flow, error model, validation, logging.
7. Только после этого принимать решение о миграции БД и/или backend runtime.
8. Завершать каждую фазу проверяемыми артефактами и критериями готовности.

## Quality Gates

- `lint`, `typecheck`, `test`, `build` проходят в CI
- OpenAPI-спецификация валидна и соответствует маршрутам
- e2e smoke покрывает auth + cards + profile flow
- production URL не зашит в исходниках
- целевое auth-хранилище не опирается на `localStorage` для долгоживущих сессий
- все новые решения задокументированы через ADR/decision log

## Communication Rules

- Архитектурные решения писать в `docs/adr/`.
- Неизвестные вопросы вести в `docs/unknowns.md`.
- Любой спорный tradeoff фиксировать: что выбрано, почему, что отклонено.
- Если запланирован рискованный шаг, сначала добавить тест/контракт, потом менять код.

## Explicit Unknowns

- Нужны ли SSR и SEO.
- Планируется ли сохранение MongoDB или обязательна миграция на Postgres.
- Где будет хоститься обновленная система.
- Какой целевой SLA/SLO нужен проекту.
- Есть ли требования к ролям/администрированию, кроме owner-based authorization.
