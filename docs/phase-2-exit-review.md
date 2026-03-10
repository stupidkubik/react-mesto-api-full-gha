# Phase 2 Exit Review

date: 2026-03-10
phase: OpenAPI and Backend Tests
status: completed

## Objective

Сделать текущий backend явным и проверяемым: сначала как описанный контракт, затем как набор integration tests, которые страхуют дальнейший refactor.

## What Was Completed

### 2.1 API Inventory and Behavior Capture

- Добавлен [docs/api-current-behavior.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/api-current-behavior.md)
- Зафиксированы текущие маршруты, payloads, error envelope и legacy gaps

### 2.2 Contract Baseline and Error Model

- Добавлен [docs/api-contract-baseline.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/api-contract-baseline.md)
- Зафиксированы:
  - baseline naming conventions
  - initial shared schemas
  - `RuntimeErrorEnvelope`
  - forward-looking `TargetErrorResponse`

### 2.3 OpenAPI Skeleton

- Добавлен [openapi/openapi.yaml](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/openapi/openapi.yaml)
- Создан skeleton с `info`, `servers`, `tags`, `securitySchemes`, shared schemas и reusable responses

### 2.4 Auth Contract

- В OpenAPI описаны:
  - `POST /signup`
  - `POST /signin`

### 2.5 Users and Cards Contract

- В OpenAPI описаны:
  - `GET /users`
  - `GET /users/me`
  - `PATCH /users/me`
  - `PATCH /users/me/avatar`
  - `GET /users/{userID}`
  - `GET /cards`
  - `POST /cards`
  - `DELETE /cards/{cardId}`
  - `PUT /cards/{cardId}/likes`
  - `DELETE /cards/{cardId}/likes`

### 2.6 Backend Test Harness

- `backend/app.js` переведен в import-friendly bootstrap mode
- Добавлены:
  - [backend/test/helpers/server.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/backend/test/helpers/server.js)
  - [backend/test/app-factory.test.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/backend/test/app-factory.test.js)
  - [docs/backend-test-harness.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/backend-test-harness.md)

### 2.7 Integration Tests for Current Contract

- Добавлены:
  - [backend/test/api.integration.test.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/backend/test/api.integration.test.js)
  - [backend/test/helpers/http.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/backend/test/helpers/http.js)
  - [backend/test/helpers/bcrypt.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/backend/test/helpers/bcrypt.js)
- Подключен `mongodb-memory-server`
- Покрыты ключевые auth/users/cards flows

## Validation Performed

- `npm run lint --prefix backend`: passes
- `npm run test --prefix backend`: passes
- key backend flows now execute against isolated Mongo-backed integration tests

## Validation Notes

- backend integration tests had to be run outside the sandbox because local port binding and in-memory Mongo startup are restricted inside the sandbox
- test suite currently uses a test-only `bcrypt` mock because native `bcrypt` binding reliability in this local environment is not stable
- OpenAPI file was built structurally and consistently, but a dedicated validator step is not wired into CI yet

## Contract Coverage Summary

See [docs/api-contract-coverage.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/api-contract-coverage.md).

Short version:

- main auth/users/cards routes are documented
- main auth/users/cards behaviors are covered by backend tests
- some secondary paths remain only documented, not yet asserted directly

## Exit Criteria Review

- OpenAPI describes current route surface: yes
- backend tests exist and run against isolated test state: yes
- Phase 3 can start without rediscovering route behavior from controllers: yes
- contract validation in CI is complete: no
- full parity between OpenAPI and test suite is complete: no

## Deferred to Phase 3+

- dedicated OpenAPI validation step in CI
- more exhaustive route parity tests for all documented paths
- removal of test-only `bcrypt` mock when dependency/runtime path is stabilized
- backend internal cleanup now that contract and safety net exist

## Conclusion

Phase 2 is complete enough to unlock backend refactoring work. The project now has:

- an explicit current-state API inventory
- a baseline contract model
- a working OpenAPI document for the current route surface
- a backend test harness
- DB-backed integration tests for the main flows

This is enough to begin `Phase 3` without re-analyzing the current backend from scratch.
