# SKILLS

updated: 2026-03-10
project: react-mesto-api-full-gha

## Skills Matrix

```yaml
skills:
  repo_baseline:
    current_state:
      - split folders without workspace
      - separate package-lock files
      - Node 16 in CI
      - no first-party root scripts
    target_outcomes:
      - root workspace package manager
      - unified scripts: install, lint, typecheck, test, build
      - pinned Node version
      - deterministic local setup
    competence:
      - pnpm_workspaces
      - root_script_design
      - editorconfig_env_templates
      - ci_modernization

  frontend_modernization:
    current_stack:
      - react_18
      - react_router_6
      - react_scripts_5
      - css_blocks
      - monolithic_app_component
    preferred_target:
      - vite
      - react
      - typescript
      - feature_oriented_structure
    optional_target:
      - nextjs_only_if_ssr_or_seo_required
    competence:
      - cra_to_vite_migration
      - route_preservation
      - typed_api_client
      - auth_flow_refactor
      - form_state_cleanup
      - loading_error_empty_states
      - modal_state_normalization
    testing:
      - vitest
      - react_testing_library
      - playwright_smoke

  backend_refactoring:
    current_stack:
      - express_4
      - mongoose_7
      - celebrate
      - jwt
      - commonjs
    preferred_target:
      - typescript_on_layered_express
    optional_target:
      - fastify_after_contract_stabilization
      - nestjs_only_if_modular_complexity_grows
    competence:
      - route_controller_service_repository_split
      - request_validation
      - centralized_error_model
      - auth_session_design
      - config_management
      - structured_logging
      - healthcheck_and_readiness
    testing:
      - vitest_or_jest
      - supertest
      - mongodb_memory_server_or_testcontainers

  api_contract:
    current_state:
      - implicit_contract_defined_by_routes_and_controllers
    target_outcomes:
      - explicit_openapi_spec
      - reusable_request_response_schemas
      - contract_checks_in_ci
    competence:
      - openapi_3_1
      - json_schema_alignment
      - error_response_standardization
      - api_versioning_strategy

  data_layer:
    current_state:
      - mongodb
      - likes_embedded_in_card
    phase_1_target:
      - stabilize_on_mongodb
      - add_indexes_and_repository_boundary
    optional_phase_2:
      - postgres_prisma
      - migration_scripts
      - relational_likes_table
    competence:
      - schema_review
      - migration_planning
      - consistency_checks
      - backup_restore_strategy

  security:
    current_state:
      - access_token_in_local_storage
      - dev_secret_fallback
      - env_management_is_minimal
    target_outcomes:
      - secure_session_model
      - explicit_secret_management
      - hardened_headers_limits_errors
    competence:
      - http_only_cookie_sessions
      - refresh_rotation
      - secure_headers
      - rate_limiting
      - dependency_audit
      - pii_safe_logging

  qa_and_release:
    current_state:
      - external_education_workflow_only
    target_outcomes:
      - first_party_test_pyramid
      - release_checklist
      - rollback_plan
      - smoke_after_deploy
    competence:
      - ci_pipeline_design
      - test_strategy
      - release_gates
      - operational_docs

definition_of_done:
  - No production API host hardcoded in frontend sources
  - No CRA dependency in target frontend
  - CI runs on supported Node LTS
  - OpenAPI spec exists and is validated
  - Auth/profile/cards flows are covered by smoke tests
  - Security model no longer depends on localStorage token persistence
  - Refactoring decisions are documented
```

## Usage Rules

- Любая крупная переработка должна идти через skill-группы `repo_baseline`, `api_contract`, `frontend_modernization`, `backend_refactoring`.
- `data_layer` запускается только после завершения базовой стабилизации и появления тестов.
- `security` не откладывается до конца проекта: она встраивается в backend и frontend фазы.
- Если возникает конфликт между технологической новизной и скоростью стабилизации, приоритет у стабилизации.

## Recommended Sequence

1. `repo_baseline`
2. `api_contract`
3. `backend_refactoring`
4. `frontend_modernization`
5. `security`
6. `qa_and_release`
7. `data_layer` as optional extension
