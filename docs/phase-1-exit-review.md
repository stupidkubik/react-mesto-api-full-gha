# Phase 1 Exit Review

date: 2026-03-10
phase: Repo Baseline and CI
status: completed

## Objective

Закрыть предварительный инфраструктурный этап так, чтобы дальнейший рефакторинг шел не из хаотичного состояния, а из зафиксированного baseline.

## What Was Completed

### 1.1 Runtime Baseline

- Добавлен [`.nvmrc`](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/.nvmrc) с `22.13.1`
- Добавлен [ADR-0001-runtime-baseline.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/adr/ADR-0001-runtime-baseline.md)

### 1.2 Root Tooling Skeleton

- Добавлен root [package.json](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/package.json)
- Добавлен [pnpm-workspace.yaml](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/pnpm-workspace.yaml)
- Сохранен текущий layout `frontend/` + `backend/` без переезда

### 1.3 Local Consistency Files

- Добавлен [`.editorconfig`](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/.editorconfig)
- Добавлены [`.env.example`](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/.env.example), [backend/.env.example](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/backend/.env.example), [frontend/.env.example](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/.env.example)

### 1.4 Package Manager Standardization

- Добавлен [ADR-0002-package-manager-strategy.md](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/docs/adr/ADR-0002-package-manager-strategy.md)
- Зафиксировано, что на `Phase 1` authoritative install flow остается на `npm`
- Root install flow переименован в `npm run bootstrap`

### 1.5 CI Modernization

- Добавлен [ci.yml](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/.github/workflows/ci.yml)
- Учебный [tests.yml](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/.github/workflows/tests.yml) оставлен параллельно и не ломался

## Validation Performed

- `npm run lint` из корня: проходит
- `npm run test` из корня: проходит как no-op
- `npm run build` из корня: проходит

## Validation Notes

- `frontend` build завершается с legacy warnings от CRA/Browserslist
- есть warning по `react-hooks/exhaustive-deps` в [App.jsx](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/frontend/src/components/App.jsx)
- build генерирует изменения в `frontend/build/`; после проверки они были восстановлены, чтобы не засорять рабочее дерево

## Exit Criteria Review

- Корневые команды появились и запускаются предсказуемо: yes
- Node baseline зафиксирован: yes
- Env templates существуют: yes
- Новый CI не зависит от внешнего учебного репозитория: yes
- Все решения по package manager и CI завершены полностью: no, только baseline-level

## Deferred to Phase 2+

- OpenAPI contract
- first-party tests
- env-driven frontend API configuration
- backend config extraction
- session/security redesign
- actual `pnpm` migration
- Node 24 reevaluation

## Conclusion

Предварительный baseline-этап можно считать завершенным. Репозиторий все еще legacy по приложенческому коду, но больше не находится в полностью неструктурированном состоянии: runtime, root tooling, env templates, package manager strategy и новый CI уже явно оформлены.
