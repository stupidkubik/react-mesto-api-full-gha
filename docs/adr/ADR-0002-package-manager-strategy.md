# ADR-0002: Package Manager Strategy for Phase 1

## Status

Accepted

## Date

2026-03-10

## Context

После `Phase 1.2` в репозитории уже есть root `package.json` и `pnpm-workspace.yaml`, но фактическая установка зависимостей все еще живет в двух отдельных приложениях:

- `backend/package-lock.json`
- `frontend/package-lock.json`

При этом:

- локально `pnpm` пока не установлен
- `corepack` доступен
- текущий учебный CI использует `npm` для самого проекта
- упоминание `pnpm` в `tests.yml` относится к внешней тестовой библиотеке, а не к пакетам этого репозитория

Нужна стратегия, которая:

- устраняет двусмысленность "npm vs pnpm"
- не ломает текущую воспроизводимость проекта
- подготавливает безопасный переход к workspace-first setup

## Decision

Для текущего состояния проекта принять двухшаговую стратегию:

1. На `Phase 1` authoritative package manager для фактической установки зависимостей остается `npm`.
2. `pnpm` остается целевым package manager для workspace-уровня, но его реальное включение переносится на отдельный шаг после валидации нового CI и install/build flow.

Дополнительно:

- существующие `package-lock.json` пока сохраняются
- root-команда установки оформляется как `npm run bootstrap`, а не как lifecycle-скрипт `install`
- удаление `package-lock.json` и генерация `pnpm-lock.yaml` должны происходить только отдельным PR

## Rationale

- Преждевременная миграция на `pnpm` без прогонки install/build/CI добавит риск и усложнит диагностику проблем.
- Наличие `pnpm-workspace.yaml` полезно уже сейчас как декларация целевой структуры, даже если пакетный менеджер еще не переключен полностью.
- Текущий репозиторий пока проще и безопаснее поддерживать через `npm`, потому что lockfiles уже существуют и отражают рабочее состояние приложений.
- Переименование root-скрипта в `bootstrap` убирает конфликт ожиданий вокруг `npm install` как lifecycle-команды.

## Consequences

Положительные:

- install flow проекта остается воспроизводимым уже сейчас
- есть понятный и управляемый путь к `pnpm`
- lockfile migration отделяется от baseline-рефакторинга

Отрицательные:

- в репозитории временно сосуществуют `pnpm-workspace.yaml` и `package-lock.json`
- package manager standardization завершается не в один шаг

## Implementation Rules

- До отдельного решения о переключении workspace install использовать `npm run bootstrap`.
- Не добавлять `pnpm-lock.yaml`, пока новый CI не валидирует install/test/build flow.
- Не удалять `backend/package-lock.json` и `frontend/package-lock.json` до завершения проверки migration PR.
- В CI не смешивать `npm install` для проекта и `pnpm install` для проекта в одном и том же workflow без явной причины.

## Exit Criteria for Future pnpm Migration

Переключение можно делать, когда выполнены все условия:

1. есть новый root CI workflow
2. install/build/test flow стабилен из корня
3. понятен окончательный набор workspace scripts
4. migration PR явно включает `pnpm-lock.yaml` и удаление legacy `package-lock.json`

## Related Files

- `/package.json`
- `/pnpm-workspace.yaml`
- `/REFACTORING-PLAN.MD`
