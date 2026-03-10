# ADR-0004: Security Session Strategy for Phase 5

## Status

Accepted

## Date

2026-03-10

## Context

После завершения `Phase 4` у проекта уже есть:

- стабильный frontend toolchain на `Vite`
- explicit frontend API boundary
- isolated auth/session orchestration layer
- backend integration tests
- frontend baseline tests

При этом текущая auth модель остается legacy:

- backend выдает только bearer token в response body
- frontend хранит token в `localStorage`
- backend не выдает refresh token
- backend не устанавливает session cookie

Перед `Phase 5` нужно зафиксировать target session model, иначе frontend и backend начнут меняться без общей точки принятия решения.

## Decision

Целевая стратегия `Phase 5`:

- backend выдает short-lived access token
- backend выдает refresh token только через `httpOnly` cookie
- frontend не хранит долгоживущий token в `localStorage`
- frontend держит access token в memory-only runtime state
- refresh endpoint отвечает за продление сессии и rotation refresh token

Иными словами:

- выбран вариант `httpOnly refresh cookie + short-lived access token`
- pure cookie-only session model не выбирается как основная стратегия

## Rationale

### Why not keep localStorage bearer tokens

- `localStorage` делает долгоживущий token чувствительным к XSS leakage.
- Это главный security gap текущего frontend runtime.

### Why not pure cookie-only session

- У проекта уже есть явный frontend API boundary и bearer-oriented contract.
- Полный переход в opaque cookie-only session сильнее меняет transport semantics и complicates SPA-side auth state.
- Для текущего fullstack shape безопаснее и предсказуемее сделать incremental move:
  - refresh token in cookie
  - access token short-lived and in memory

### Why this fits the current deployment shape

- Frontend и backend уже живут раздельно.
- Cookie может быть ограничена backend origin и не читаться frontend JavaScript.
- Frontend при этом сохраняет explicit auth boundary для guarded SPA flows.

## Consequences

Положительные:

- устраняется зависимость от `localStorage` для долгоживущей сессии
- refresh token становится недоступен JavaScript
- frontend может продолжать использовать explicit auth boundary without full rewrite

Отрицательные:

- backend contract придется расширить:
  - refresh endpoint
  - logout endpoint with cookie clearing
  - cookie configuration by environment
- frontend session bootstrap и request retry flow станут сложнее
- потребуется аккуратная CORS/cookie policy between frontend and backend origins

## Non-Goals

- не делать pure server-rendered cookie session
- не смешивать session redesign с TypeScript migration
- не менять database technology
- не переписывать backend framework

## Implementation Direction for Phase 5

Backend:

1. issue short-lived access token
2. issue refresh token in `httpOnly`, `secure`, `sameSite`-controlled cookie
3. add refresh endpoint
4. add logout endpoint that invalidates refresh token and clears cookie
5. document CORS and cookie policy by environment

Frontend:

1. move from `localStorage` token bootstrap to session bootstrap via refresh flow
2. keep access token in memory-only state
3. add silent refresh/re-auth boundary
4. keep protected route semantics stable for the SPA

## Deferred Details

These details remain implementation decisions for `Phase 5`, not blockers to this ADR:

- exact access token TTL
- exact refresh token TTL and rotation policy
- refresh token persistence store
- exact `sameSite` mode per environment
- whether access token refresh is proactive or on-demand after 401

## Exit Criteria

`Phase 5` can be considered complete when:

1. long-lived session no longer depends on `localStorage`
2. refresh token is delivered only through cookie
3. frontend protected flows still work after page reload
4. logout reliably clears session on both frontend and backend

## Related Files

- `/REFACTORING-PLAN.MD`
- `/docs/phase-4-exit-review.md`
- `/docs/frontend-migration-strategy.md`
- `/openapi/openapi.yaml`
