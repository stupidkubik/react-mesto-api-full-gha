# Frontend Migration Strategy

updated: 2026-03-10
phase: Phase 4 completed

## Goal

Уйти с legacy CRA frontend на более поддерживаемую структуру без frontend rewrite и без одновременного изменения backend contract.

Текущий runtime зафиксирован отдельно в:

- `docs/frontend-current-runtime.md`

## Current Runtime Summary

Текущее приложение является SPA на `React 18 + react-router + Vite`.

Legacy snapshot до `Phase 4.2` и `Phase 4.3` сохранен в:

- [docs/frontend-current-runtime.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/frontend-current-runtime.md)

Ключевые особенности текущего runtime:

- [frontend/src/components/App.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/components/App.jsx) одновременно управляет:
  - initial data loading
  - route rendering
  - popup state
  - card/profile mutations
- [frontend/src/shared/api/client.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/shared/api/client.js) уже существует как единый request boundary.
- [frontend/src/shared/session/use-session.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/shared/session/use-session.js) уже существует как auth/session boundary.
- Основные frontend feature hooks уже вынесены в:
  - [frontend/src/features/profile/use-profile.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/profile/use-profile.js)
  - [frontend/src/features/cards/use-cards.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/cards/use-cards.js)
  - [frontend/src/features/popups/use-popup-state.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/popups/use-popup-state.js)
- Access token хранится в `localStorage`.
- Frontend уже имеет минимальный first-party test baseline на `Vitest + RTL`.
- Frontend больше не зависит от CRA, и feature decomposition уже начат.

## Non-Goals for Phase 4

- Не менять backend API contract.
- Не менять session model на cookie/refresh flow.
- Не вводить SSR, Next.js или новый frontend framework.
- Не делать полный TypeScript rewrite всего UI за один этап.

## Recommended Migration Order

### 1. Toolchain First

status: completed in Phase 4.2

Сначала нужно убрать CRA, сохранив текущее runtime behavior. Это снижает build risk и убирает устаревший toolchain до feature refactor.

Что входит:

- Vite entrypoint
- asset handling
- dev/build scripts
- совместимость текущего `BrowserRouter`

### 2. Runtime Config and API Boundary

status: completed in Phase 4.3

После Vite нужно убрать hardcoded API host и объединить request layer в один модуль.

Что входит:

- `VITE_API_BASE_URL`
- единый request helper
- auth header injection
- единая обработка response/error

### 3. Auth Boundary Before UI Decomposition

status: completed in Phase 4.4

Auth flow нужно вынести раньше, чем резать все дерево компонентов. Сейчас login, register, token restore и logout слишком тесно привязаны к `App.jsx`.

Что входит:

- session bootstrap
- signin/signup handlers
- logout flow
- current-user bootstrap trigger boundary

### 4. App Shell and Feature Extraction

status: app shell completed in Phase 4.5, feature extraction completed in Phase 4.6

App shell and route composition are already extracted into dedicated app modules:

- [frontend/src/app/App.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/App.jsx)
- [frontend/src/app/AppProviders.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/AppProviders.jsx)
- [frontend/src/app/AppRoutes.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/AppRoutes.jsx)
- [frontend/src/app/paths.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/paths.js)

Только после стабилизации toolchain и API слоя имеет смысл выносить profile/cards/popups в feature-oriented modules.

Что входит:

- slimmer `App`
- clearer route layer
- отдельные feature hooks/services

Текущие feature modules уже выделены в:

- [frontend/src/features/profile/use-profile.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/profile/use-profile.js)
- [frontend/src/features/cards/use-cards.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/cards/use-cards.js)
- [frontend/src/features/popups/PopupStack.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/popups/PopupStack.jsx)
- [frontend/src/features/popups/use-popup-state.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/popups/use-popup-state.js)

### 5. Frontend Tests Before Phase 5

status: completed in Phase 4.7

Перед security/session changes нужен хотя бы минимальный frontend safety net.

Минимум:

- app shell smoke
- auth happy path
- cards/profile happy path

Текущий baseline уже включает:

- [frontend/src/app/App.test.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/App.test.jsx)
- [frontend/src/test/setup.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/test/setup.js)
- [frontend/src/test/helpers/network.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/test/helpers/network.js)

## Proposed Target Structure

Точный layout можно уточнить в коде, но направление должно быть таким:

```text
frontend/src/
  app/
    App.jsx
    providers/
    routes/
  features/
    auth/
    profile/
    cards/
    popups/
  shared/
    api/
    config/
    session/
    lib/
  contexts/
  assets/
```

## Phase 4 Risks

### Risk 1: Toolchain and refactor in one PR

Если смешать Vite migration и decomposition `App.jsx`, будет трудно локализовать регрессии.

Mitigation:

- сначала отдельный PR на Vite baseline
- behavior-preserving migration only

### Risk 2: Frontend contract drift from backend

Если одновременно менять frontend API слой и backend semantics, появятся ложные регрессии.

Mitigation:

- считать [openapi/openapi.yaml](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/openapi/openapi.yaml) источником текущего контракта
- до `Phase 5` не трогать auth/session semantics на backend

### Risk 3: LocalStorage cleanup too early

Переход на новую session model в рамках `Phase 4` смешает frontend modernization и security redesign.

Mitigation:

- в `Phase 4` сохранить текущий token storage как legacy-compatible boundary
- изменить только место orchestration, а не сам runtime contract

### Risk 4: No frontend test coverage

Даже аккуратный refactor UI останется хрупким, если tests появятся только после крупных переносов.

Mitigation:

- после стабилизации Vite и API client быстро добавить minimal frontend suite

## Phase 4 Definition of Done

- Frontend больше не зависит от CRA.
- API host читается из env, а не захардкожен.
- `App.jsx` больше не является главным монолитом приложения.
- Auth/session orchestration вынесен в отдельный boundary.
- Есть минимальный frontend test baseline.
- Все это сделано без изменения backend contract.

## Next Program Step

`Phase 4` завершен.

Следующий шаг для программы работ:

1. начать `Phase 5` с уже принятого session ADR
2. не смешивать security/session redesign с новой frontend decomposition
