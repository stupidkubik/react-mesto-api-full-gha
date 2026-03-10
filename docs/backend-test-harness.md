# Backend Test Harness

updated: 2026-03-10
phase: 2.6

## Goal

Подготовить backend к собственным integration tests без ручного старта `node app.js`.

## Decisions

### Test runner

- Current choice: built-in `node:test`

Rationale:

- не требует новых внешних зависимостей на этой фазе
- работает на зафиксированном runtime baseline
- позволяет быстро создать test harness до выбора более тяжелого стека

### HTTP testing approach

- Current choice: native `fetch` against an ephemeral local server

Rationale:

- достаточно для первых harness/smoke tests
- не блокирует дальнейший переход на `supertest`, если это понадобится позже

### App bootstrap strategy

- `backend/app.js` больше не должен безусловно стартовать сервер и подключать Mongo при импорте
- backend должен экспортировать:
  - `createApp`
  - `connectToDatabase`
  - `disconnectDatabase`
  - `startServer`

This makes two test modes possible:

1. HTTP-only tests without DB
2. future integration tests with isolated test DB

### Test database strategy

Current baseline choice:

- isolated ephemeral Mongo via `mongodb-memory-server` for integration tests
- `TEST_DB_URL` remains documented as a fallback/explicit override path

Why this is acceptable now:

- gives real Mongo-backed request flow without relying on a manually started local database
- keeps test isolation simple through an ephemeral database instance
- still leaves room for `testcontainers` later if the team wants Docker-based parity

## Files Added

- `backend/test/helpers/server.js`
- `backend/test/app-factory.test.js`
- `backend/test/helpers/http.js`
- `backend/test/helpers/bcrypt.js`
- `backend/test/api.integration.test.js`

## Current Coverage

- proves that the backend app can be started from tests without manual process startup
- proves that the auth middleware and error envelope are reachable through the harness
- proves current auth/users/cards behavior against an isolated Mongo-backed test environment

## Temporary Constraint

- in the current local environment, `bcrypt` native bindings are not reliably usable from tests
- tests stub `bcrypt` because they are validating HTTP contract and route behavior, not native hashing bindings
- if the runtime dependency is later stabilized, the mock can be removed and auth tests can run through the real binding path

## Deferred to Later Test PRs

- DB-backed integration tests
- seed/cleanup helpers
- auth flow tests
- users/cards CRUD integration coverage
- CI wiring for richer backend test matrix
