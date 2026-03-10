# API Current Behavior Inventory

updated: 2026-03-10
phase: 2.1
source: current backend implementation in `backend/`

## Scope

This document captures what the API does today, before any backend refactor or OpenAPI normalization.

Included:

- public auth routes
- protected user/card routes
- service routes and fallback behavior
- current validation and error behavior

Not included:

- desired future contract
- secure session redesign
- refactored error model

## Global Current Behavior

- API has no version prefix like `/api/v1`.
- Auth for protected routes is `Authorization: Bearer <jwt>`.
- JWT payload currently contains only `{ _id }`.
- JWT verification uses `JWT_SECRET` in production and a hardcoded dev fallback outside production.
- IDs are treated as Mongo `ObjectId` strings with `24` hex chars where route validation exists.
- Error responses are flattened to:

```json
{
  "message": "..."
}
```

- There is no `requestId`, no machine-readable error code, and no unified error schema yet.
- There is no explicit health endpoint yet.
- Response bodies are mostly raw Mongoose documents or populated Mongoose documents.
- `password` is excluded from normal user responses because the schema marks it as `select: false`.

## Route Overview

| Method | Path | Auth | Validation | Success | Current response shape |
|---|---|---|---|---|---|
| `POST` | `/signup` | no | body via `celebrate` | `201` | created user without password |
| `POST` | `/signin` | no | body via `celebrate` | `200` | `{ "token": "..." }` |
| `GET` | `/users` | yes | none | `200` | array of users |
| `GET` | `/users/me` | yes | none | `200` | current user |
| `GET` | `/users/:userID` | yes | `userID` must be `24` hex | `200` | user document |
| `PATCH` | `/users/me` | yes | body via `celebrate` | `200` | updated user |
| `PATCH` | `/users/me/avatar` | yes | body via `celebrate` | `200` | updated user |
| `GET` | `/cards` | yes | none | `200` | array of populated cards |
| `POST` | `/cards` | yes | body via `celebrate` | `201` | created populated card |
| `DELETE` | `/cards/:cardId` | yes | `cardId` must be `24` hex | `200` | `{ "message": "Card is deleted" }` |
| `PUT` | `/cards/:cardId/likes` | yes | `cardId` must be `24` hex | `200` | updated populated card |
| `DELETE` | `/cards/:cardId/likes` | yes | `cardId` must be `24` hex | `200` | updated populated card |
| `GET` | `/crash-test` | no | none | process crash | test-only route |
| `*` | any unmatched route | mixed | none | `404` | `{ "message": "Page not found" }` |

## Route Details

### `POST /signup`

Controller: `createUser`

Body validation:

```json
{
  "name": "string (2..30, optional)",
  "about": "string (2..30, optional)",
  "avatar": "string matching URL regex, optional",
  "email": "string matching email regex, required",
  "password": "string min 2, required"
}
```

Success:

- status: `201`
- response:

```json
{
  "name": "string",
  "about": "string",
  "email": "string",
  "avatar": "string"
}
```

Current notes:

- password hash is stored, but never returned
- `_id` is not returned in signup response
- default user fields may come from the Mongoose schema if omitted

Current error behavior:

- `409` on duplicate email
- `400` on Mongoose validation error
- `400` on `celebrate` body validation failure
- `500` fallback for unexpected errors

Legacy ambiguity:

- controller catch path can call `next(...)` more than once in some branches

### `POST /signin`

Controller: `LoginUser`

Body validation:

```json
{
  "email": "string matching email regex, required",
  "password": "string min 2, required"
}
```

Success:

- status: `200`
- response:

```json
{
  "token": "jwt"
}
```

Current error behavior:

- `401` for wrong email or password
- `400` on `celebrate` body validation failure
- `500` fallback for unexpected errors

Legacy notes:

- access token is the only auth artifact returned
- no refresh token, no cookie, no session rotation

### `GET /users`

Controller: `getUsers`

Success:

- status: `200`
- response: array of user documents

Current notes:

- route is protected by bearer auth
- no pagination, filtering, or sorting

Current error behavior:

- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `GET /users/me`

Controller: `getSelf`

Success:

- status: `200`
- response: current user document

Current notes:

- user id comes from JWT payload
- if JWT is valid but the user no longer exists, current code path does not map that to a dedicated `404`

Current error behavior:

- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `GET /users/:userID`

Controller: `getUserById`

Path validation:

- `userID` must be a `24`-character hex string

Success:

- status: `200`
- response: user document

Current error behavior:

- `404` when user is not found
- `400` on `celebrate` path validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `PATCH /users/me`

Controller: `updateUserById`

Body validation:

```json
{
  "name": "string (2..30, optional)",
  "about": "string (2..30, optional)"
}
```

Success:

- status: `200`
- response: updated user document

Current error behavior:

- `404` when current user document is not found
- `400` on Mongoose validation error
- `400` on `celebrate` body validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `PATCH /users/me/avatar`

Controller: `updateUserAvatarById`

Body validation:

```json
{
  "avatar": "string matching URL regex"
}
```

Success:

- status: `200`
- response: updated user document

Current error behavior:

- `404` when current user document is not found
- `400` on Mongoose validation error
- `400` on `celebrate` body validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `GET /cards`

Controller: `getCards`

Success:

- status: `200`
- response: array of cards with populated `owner` and `likes`

Current notes:

- no pagination, filtering, or sorting
- card responses come from populated Mongoose documents

Current error behavior:

- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `POST /cards`

Controller: `createCard`

Body validation:

```json
{
  "name": "string (2..30, required)",
  "link": "string matching URL regex, required"
}
```

Success:

- status: `201`
- response: created card with populated `owner`

Current notes:

- `likes` is initialized implicitly by the schema
- created card is re-read and populated before response

Current error behavior:

- `400` on Mongoose validation error
- `400` on `celebrate` body validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `DELETE /cards/:cardId`

Controller: `deleteCardById`

Path validation:

- `cardId` must be a `24`-character hex string

Success:

- status: `200`
- response:

```json
{
  "message": "Card is deleted"
}
```

Current error behavior:

- `404` when card is not found
- `403` when current user is not the owner
- `400` on `celebrate` path validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `PUT /cards/:cardId/likes`

Controller: `putLikeById`

Path validation:

- `cardId` must be a `24`-character hex string

Success:

- status: `200`
- response: updated card with populated `owner` and `likes`

Current error behavior:

- `404` when card is not found
- `400` on `celebrate` path validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

### `DELETE /cards/:cardId/likes`

Controller: `deleteLikeById`

Path validation:

- `cardId` must be a `24`-character hex string

Success:

- status: `200`
- response: updated card with populated `owner` and `likes`

Current error behavior:

- `404` when card is not found
- `400` on `celebrate` path validation failure
- `401` when auth header is missing/invalid
- `500` fallback for unexpected errors

## Service and Fallback Routes

### `GET /crash-test`

Current behavior:

- route throws asynchronously and intentionally crashes the process
- meant for crash handling tests, not for production use

### Unmatched routes

Current behavior:

- any unmatched route after router composition returns:

```json
{
  "message": "Page not found"
}
```

- status: `404`

## Current Error Envelope

Inferred from the global error middleware:

```json
{
  "message": "..."
}
```

Current mapping:

- known custom errors -> their HTTP status + message
- unknown errors -> `500` + `"Server Error"`

Known legacy gaps:

- no `code`
- no `requestId`
- no structured `details`
- middleware calls `next()` after sending the response

## Current Contract Gaps to Carry into Phase 2.2

- No formal OpenAPI file yet
- No machine-readable error codes
- No request correlation id in responses
- No health endpoint
- No explicit separation between legacy behavior and desired behavior
- Raw Mongoose document shapes leak directly into API responses
