# API Contract Coverage Summary

updated: 2026-03-10
phase: 2.8

## Covered by OpenAPI

The current [openapi/openapi.yaml](/Users/evgenii/Desktop/dev/react-mesto-api-full-gha/openapi/openapi.yaml) describes these runtime endpoints:

- `POST /signup`
- `POST /signin`
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

Not documented as public API:

- `/crash-test`

Not yet implemented in runtime and therefore not documented as active operation:

- `/health`

## Covered by Backend Tests

The current backend suite covers:

- app bootstrap without manual `node app.js`
- signup success flow
- signin success flow
- unauthorized access to protected routes
- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/avatar`
- `POST /cards`
- `PUT /cards/{cardId}/likes`
- `DELETE /cards/{cardId}/likes`
- `DELETE /cards/{cardId}`
- forbidden delete for non-owner
- validation error envelope
- not found error envelope

## Partial Coverage / Not Yet Covered

- `GET /users` is documented but not explicitly asserted in tests
- `GET /users/{userID}` success path is documented but not explicitly asserted in tests
- `GET /cards` list behavior is indirectly exercised through create/delete flows, but not asserted directly
- duplicate signup conflict path is documented but not explicitly asserted in tests
- invalid signin path is documented but not explicitly asserted in tests
- wildcard route `404` is part of runtime behavior, but not yet asserted in tests

## Legacy Runtime Constraints Still Present

- test suite uses a test-only `bcrypt` mock because native binding stability is currently unreliable in this environment
- runtime still returns legacy error envelopes without symbolic codes
- contract describes current raw/populated Mongoose response shapes

## Ready for Phase 3 Because

- the main runtime routes are now reverse-engineered and explicitly documented
- the initial OpenAPI contract exists
- there is a DB-backed backend safety net for the key auth/users/cards flows
- Phase 3 no longer needs to rediscover baseline route behavior from source code
