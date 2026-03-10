# Unknowns and Deferred Decisions

updated: 2026-03-10
phase: preliminary baseline after Phase 1

## Product and Architecture Unknowns

- Нужен ли проекту SSR/SEO или он остается чистым SPA.
- Является ли MongoDB временным решением или есть обязательная цель перейти на Postgres.
- Где будет жить целевой production: текущий VPS, managed platform, serverless, контейнерный хостинг.
- Нужны ли роли кроме owner-based authorization.
- Нужен ли refresh-token flow или будет выбрана cookie-based session model.

## Deferred Technical Decisions

- Переход с `Node 22.13.1` на `Node 24` после ухода с CRA.
- Реальная миграция package manager с `npm` на `pnpm`.
- Удаление legacy `package-lock.json` и добавление `pnpm-lock.yaml`.
- Замена hardcoded frontend API host на env-driven config.
- Вынос CORS и rate-limit конфигурации в env-backed config module.
- Введение OpenAPI как источника истины.
- Появление first-party test suite вместо текущего empty/no-op test layer.
- Выбор стратегии backend migration: layered Express only vs Fastify/NestJS later.

## Known Current Gaps

- Новый root CI добавлен, но еще не подтвержден реальным прогоном в GitHub Actions.
- Корневой `test` пока проходит как no-op, потому что в пакетах нет собственных test scripts.
- Frontend build проходит, но с предупреждениями CRA/Browserslist и warning по `react-hooks/exhaustive-deps`.
- Frontend все еще использует hardcoded production API URL.
- Access token все еще хранится в `localStorage`.

## Rule for Next Phases

Если решение влияет на runtime, package manager, session model, database или deployment strategy, его нужно сначала оформить отдельным ADR, а потом менять код.
