# Phase 4 Exit Review

updated: 2026-03-10
phase: Phase 4 completed

## Scope Closed

`Phase 4` был сфокусирован на frontend stabilization и migration off CRA без изменения backend contract.

Закрытые подэтапы:

- `4.1` frontend runtime inventory
- `4.2` Vite baseline
- `4.3` env config and unified API client
- `4.4` auth/session boundary extraction
- `4.5` app shell and routing decomposition
- `4.6` feature extraction for profile/cards/popups
- `4.7` frontend test baseline
- `4.8` exit review

## What Changed

### Toolchain

- CRA removed from runtime flow.
- Frontend now builds through `Vite`.
- Entry moved to [frontend/index.html](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/index.html) and [frontend/src/main.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/main.jsx).

### Runtime Boundaries

- API access now goes through [frontend/src/shared/api/client.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/shared/api/client.js).
- Runtime config now goes through [frontend/src/shared/config/index.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/shared/config/index.js).
- Auth/session orchestration now goes through [frontend/src/shared/session/use-session.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/shared/session/use-session.js).

### App Structure

- App shell moved into [frontend/src/app/App.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/App.jsx).
- Providers and routes are separated into:
  - [frontend/src/app/AppProviders.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/AppProviders.jsx)
  - [frontend/src/app/AppRoutes.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/AppRoutes.jsx)
  - [frontend/src/app/paths.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/paths.js)

### Feature Decomposition

- Profile logic moved to [frontend/src/features/profile/use-profile.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/profile/use-profile.js)
- Cards logic moved to [frontend/src/features/cards/use-cards.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/cards/use-cards.js)
- Popup state and popup stack moved to:
  - [frontend/src/features/popups/use-popup-state.js](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/popups/use-popup-state.js)
  - [frontend/src/features/popups/PopupStack.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/features/popups/PopupStack.jsx)

### Frontend Safety Net

- Frontend test baseline added with `Vitest + jsdom + RTL`.
- Baseline tests live in [frontend/src/app/App.test.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/app/App.test.jsx).

## Verified Quality Gates

Confirmed on 2026-03-10:

- `npm run lint`
- `npm run test`
- `npm run build`

Result:

- all three pass from repository root on the current branch

## Contract Stability

`Phase 4` did not intentionally change:

- backend API contract
- current auth/session model
- runtime token storage in `localStorage`
- existing protected route semantics
- SPA route model with explicit public login and registration screens

This is important because `Phase 5` can now focus on security/session redesign instead of mixed frontend migration work.

## Residual Risks Before Phase 5

- Session model is still legacy and token-based in `localStorage`.
- Frontend test suite is still minimal and covers only baseline smoke/happy paths.
- React Router prints v7 future-flag warnings in test runs.
- Frontend is still JavaScript-only; TypeScript migration is not started.
- Some UI components still rely on legacy assumptions such as DOM-event-based image open flow and `currentUser`-dependent card logic.

## Post-Phase-4 Clarification

Before starting `Phase 5`, unauthenticated protected entry was normalized to `/signin` instead of the old accidental redirect to `/signup`.

Reason:

- `/signin` is the canonical entrypoint for an existing user session flow
- keeping `/signup` as the default entry would create unnecessary ambiguity during the upcoming session redesign

## Readiness for Phase 5

Project is ready to move to `Phase 5`.

Reasons:

- frontend toolchain is stable
- API boundary is explicit
- auth/session orchestration is isolated
- app shell is no longer a monolith
- there is now a minimal frontend safety net alongside backend integration tests

Additional readiness note:

- target session strategy is now fixed in [docs/adr/ADR-0004-session-strategy.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/adr/ADR-0004-session-strategy.md)
- root quality gates already match the commands used by the repository CI workflow

## Recommended Phase 5 Focus

`Phase 5` should now stay narrowly focused on security/session work:

1. choose and document the target session model
2. adapt backend and frontend around that model
3. preserve the now-stable frontend structure while changing auth semantics

## Notable Non-Blockers

- GitHub Actions has not yet confirmed the new frontend test baseline on the remote branch, although the same root commands already pass locally.
- OpenAPI validation is still not wired as a dedicated CI step.
- Backend controllers still talk directly to Mongoose models.
