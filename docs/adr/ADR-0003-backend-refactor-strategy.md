# ADR-0003: Backend Refactor Strategy for Phase 3

## Status

Accepted

## Date

2026-03-10

## Context

После `Phase 2` у проекта уже есть:

- текущий API inventory
- baseline OpenAPI contract
- backend integration tests на ключевые auth/users/cards flows

Это означает, что backend больше не нужно переписывать вслепую. Но сам код все еще остается legacy:

- `controllers` напрямую работают с Mongoose models
- конфигурация размазана по файлам
- error handling неоднороден
- startup и transport concerns смешаны в `backend/app.js`
- file-based logs создают шум в рабочем дереве

Нужна стратегия, которая улучшает архитектуру без big-bang migration на другой runtime/framework.

## Decision

В `Phase 3` backend refactor делается на текущем runtime:

- Express остается
- Mongoose остается
- CommonJS остается

Refactor выполняется как incremental layered cleanup, а не как rewrite в Fastify/NestJS/TypeScript в один шаг.

Целевая логика слоев:

- `transport`: routes, HTTP middleware, request/response mapping
- `application`: domain services / use-case orchestration
- `persistence`: repositories over Mongoose models
- `config`: centralized runtime configuration
- `shared`: errors, common helpers, logging

## Rationale

- После `Phase 2` уже есть contract safety net, поэтому можно двигать internals маленькими шагами.
- Одновременная смена runtime/framework/type-system сейчас даст слишком большой дифф и ухудшит debuggability.
- Сначала нужно отделить архитектурные обязанности внутри текущего backend, а уже потом обсуждать Fastify, NestJS или TypeScript migration.

## Consequences

Положительные:

- backend становится чище без потери текущего API behavior
- integration tests остаются основным guardrail для refactor
- переход к TypeScript или новому framework позже станет проще

Отрицательные:

- некоторое время legacy и new-structure code будут сосуществовать
- refactor потребует нескольких промежуточных PR, а не одного "большого переписывания"

## Non-Goals for Phase 3

- не переводить backend на NestJS
- не переводить backend на Fastify
- не менять database technology
- не ломать current API contract
- не вводить сразу normalized runtime error envelope

## Exit Criteria

`Phase 3` можно считать успешным, когда:

1. config path централизован
2. error mapping упрощен и стабилен
3. startup/transport слой стал чище
4. хотя бы один доменный модуль извлечен по новой схеме
5. backend integration tests продолжают проходить

## Related Files

- `/REFACTORING-PLAN.MD`
- `/docs/phase-2-exit-review.md`
- `/docs/api-contract-coverage.md`
