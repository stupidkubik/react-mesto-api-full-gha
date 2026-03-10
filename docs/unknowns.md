# Unknowns and Deferred Decisions

updated: 2026-03-10
phase: Phase 4 in progress

## Product and Architecture Unknowns

- Нужен ли проекту SSR/SEO или он остается чистым SPA.
- Является ли MongoDB временным решением или есть обязательная цель перейти на Postgres.
- Где будет жить целевой production: текущий VPS, managed platform, serverless, контейнерный хостинг.
- Нужны ли роли кроме owner-based authorization.

## Deferred Technical Decisions

- Переход с `Node 22.13.1` на `Node 24` после стабилизации нового frontend toolchain.
- Реальная миграция package manager с `npm` на `pnpm`.
- Удаление legacy `package-lock.json` и добавление `pnpm-lock.yaml`.
- Замена hardcoded frontend API host на env-driven config.
- Вынос CORS и rate-limit конфигурации в env-backed config module.
- Валидация OpenAPI в CI и выбор инструмента проверки спецификации.
- Расширение first-party test suite за пределы backend contract tests.
- Выбор стратегии backend migration: layered Express only vs Fastify/NestJS later.
- План снятия test-only `bcrypt` mock после стабилизации native runtime dependency path.
- Будет ли backend переводиться на TypeScript после стабилизации новой структуры слоев.
- Нужно ли убирать file-based logging в пользу console/stdout structured logging до deploy-фазы.
- Точные TTL, rotation policy и storage details для refresh token в `Phase 5`.

## Known Current Gaps

- Новый root CI использует правильный command parity (`lint`, `test`, `build`), но обновленный frontend test baseline еще не подтвержден реальным прогоном в GitHub Actions.
- Frontend уже переведен на Vite baseline, API client переведен на env-backed config, auth/session orchestration вынесен в отдельный boundary, а profile/cards/popups уже разложены по feature hooks.
- Access token все еще хранится в `localStorage`.
- Default unauthenticated protected redirect уже нормализован к `/signin`; это больше не open decision.
- React Router test runs печатают future-flag warnings v7, хотя suite остается зеленым.
- OpenAPI файл существует, но еще не валидируется отдельным dedicated validator step.
- Runtime error envelope все еще legacy-only: `{ "message": "..." }`.
- Backend routes уже собраны через новую transport/module структуру, но controllers все еще напрямую работают с Mongoose models.
- Logging artifacts больше не светятся в git, но сама logging strategy все еще legacy file-based.

## Rule for Next Phases

Если решение влияет на runtime, package manager, session model, database или deployment strategy, его нужно сначала оформить отдельным ADR, а потом менять код.
