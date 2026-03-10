# Backend Target Structure

updated: 2026-03-10
phase: 3.1

## Goal

Зафиксировать target structure для backend refactor на текущем Express runtime.

Это не означает немедленного переезда всех файлов. Документ нужен как карта миграции.

## Current State

Сейчас backend организован плоско:

- `routes/`
- `controllers/`
- `models/`
- `middlewares/`
- `errors/`
- `utils/`
- `app.js`

Эта структура уже работает, но слабо отделяет transport, domain logic, persistence и config.

## Target Structure

```text
backend/
├── app.js
├── src/
│   ├── config/
│   │   └── index.js
│   ├── shared/
│   │   ├── errors/
│   │   ├── logging/
│   │   └── http/
│   ├── transport/
│   │   ├── middlewares/
│   │   └── routes/
│   └── modules/
│       ├── auth/
│       │   ├── auth.controller.js
│       │   ├── auth.service.js
│       │   ├── auth.repository.js
│       │   └── auth.schemas.js
│       ├── users/
│       │   ├── users.controller.js
│       │   ├── users.service.js
│       │   ├── users.repository.js
│       │   └── users.schemas.js
│       └── cards/
│           ├── cards.controller.js
│           ├── cards.service.js
│           ├── cards.repository.js
│           └── cards.schemas.js
├── models/
├── test/
└── package.json
```

## Migration Rule

Переход должен быть постепенным:

1. сначала вводятся новые boundaries
2. затем legacy files переиспользуют новые shared modules
3. только потом код переносится по модулям

Не нужно делать физический move всех файлов в одном PR.

## Responsibility Split

### `app.js`

- bootstrap
- startup
- composition root

### `src/config`

- runtime configuration loading
- safe defaults
- environment-specific settings

### `src/shared/errors`

- app-level errors
- HTTP mapping helpers
- legacy error compatibility during transition

### `src/shared/logging`

- logger construction
- transport-safe logging configuration
- file/no-file logging strategy

### `src/transport`

- express router composition
- request-specific middleware
- HTTP concerns only

### `src/modules/*`

- controller: request/response orchestration
- service: domain behavior
- repository: persistence boundary over Mongoose
- schemas: request/response validation contracts

## First Migration Targets

The first backend internals to extract should be:

1. config
2. shared error mapping
3. transport bootstrap cleanup
4. one pilot domain module, recommended: `users`

## Files to Keep Stable During Early Phase 3

- `models/` can remain where they are initially
- `routes/` can remain as legacy entry points while new module boundaries are introduced
- `controllers/` may temporarily become thin adapters before full extraction

## Success Condition

Если к концу раннего `Phase 3` у проекта есть:

- centralized config
- simpler bootstrap
- shared error handling
- один pilot module extraction

значит refactor идет в правильном направлении без переписывания backend заново.
