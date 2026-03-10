# API Contract Baseline

updated: 2026-03-10
phase: 2.2
depends_on: `docs/api-current-behavior.md`

## Purpose

This document defines the baseline contract rules for Phase 2.

It does not change the backend yet.
It defines:

- what should be treated as the contract source of truth
- which current behaviors are preserved as legacy behavior
- the initial shared schemas
- the initial error model
- naming rules for the future OpenAPI document

## Contract Strategy for Phase 2

For this phase, the contract should be:

1. honest about current backend behavior
2. structured enough to support OpenAPI and integration tests
3. conservative about behavioral changes

Rule:

- If a behavior is already implemented and relied upon by the frontend, document it first.
- If a behavior is clearly broken, unsafe, or too ambiguous, mark it as `legacy gap` instead of silently normalizing it.
- Contract cleanup that changes runtime behavior belongs to later phases unless the change is small, explicit, and low-risk.

## Source of Truth Hierarchy

During Phase 2, use this precedence:

1. `docs/api-contract-baseline.md`
2. `docs/api-current-behavior.md`
3. current backend implementation in `backend/`

Once `openapi/openapi.yaml` exists, the intended hierarchy becomes:

1. `openapi/openapi.yaml`
2. integration tests
3. backend implementation

## Contract Scope for the Initial OpenAPI

Include in the first OpenAPI contract:

- `POST /signup`
- `POST /signin`
- `GET /users`
- `GET /users/me`
- `GET /users/{userID}`
- `PATCH /users/me`
- `PATCH /users/me/avatar`
- `GET /cards`
- `POST /cards`
- `DELETE /cards/{cardId}`
- `PUT /cards/{cardId}/likes`
- `DELETE /cards/{cardId}/likes`

Do not include as normal public API operations:

- `/crash-test`

Optional for this phase:

- `GET /health`

## Baseline Error Model

### Current runtime behavior

Today the backend returns:

```json
{
  "message": "..."
}
```

This shape must be documented as the current runtime error envelope.

### Contract baseline

For Phase 2, define two layers:

1. `RuntimeErrorEnvelope`
2. `TargetErrorResponse`

#### RuntimeErrorEnvelope

Use this to describe what the backend actually returns today:

```json
{
  "type": "object",
  "required": ["message"],
  "properties": {
    "message": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

#### TargetErrorResponse

Use this as the forward-looking normalized model for later phases:

```json
{
  "type": "object",
  "required": ["error"],
  "properties": {
    "error": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code": {
          "type": "string"
        },
        "message": {
          "type": "string"
        },
        "details": {}
      }
    },
    "requestId": {
      "type": "string"
    }
  }
}
```

Rule for Phase 2:

- OpenAPI should document current runtime behavior honestly.
- `TargetErrorResponse` should be tracked as a normalization target, not as something already implemented.

### Baseline Error Codes

These are the canonical symbolic codes for the future normalized model:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL`

Optional later:

- `RATE_LIMITED`

### Status Mapping Baseline

| HTTP status | Current meaning | Target symbolic code |
|---|---|---|
| `400` | celebrate or Mongoose validation failure | `VALIDATION_ERROR` |
| `401` | missing/invalid token, invalid credentials | `UNAUTHORIZED` |
| `403` | ownership violation | `FORBIDDEN` |
| `404` | entity or route not found | `NOT_FOUND` |
| `409` | duplicate email | `CONFLICT` |
| `500` | unhandled internal error | `INTERNAL` |

## Shared Schema Baseline

These schemas should exist in the first reusable contract layer.

### `AuthTokenResponse`

Represents current successful signin response.

```json
{
  "type": "object",
  "required": ["token"],
  "properties": {
    "token": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### `User`

Represents current user response shape at the API boundary.

```json
{
  "type": "object",
  "required": ["_id", "name", "about", "avatar", "email"],
  "properties": {
    "_id": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{24}$"
    },
    "name": {
      "type": "string"
    },
    "about": {
      "type": "string"
    },
    "avatar": {
      "type": "string"
    },
    "email": {
      "type": "string"
    }
  }
}
```

Current note:

- signup response is a legacy exception because it does not return `_id`

### `UserPublic`

Represents user shape embedded inside populated card responses.

```json
{
  "type": "object",
  "required": ["_id", "name", "about", "avatar", "email"],
  "properties": {
    "_id": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{24}$"
    },
    "name": {
      "type": "string"
    },
    "about": {
      "type": "string"
    },
    "avatar": {
      "type": "string"
    },
    "email": {
      "type": "string"
    }
  }
}
```

Current note:

- the current backend populates full user documents in cards, not a reduced public projection

### `Card`

Represents current card response shape.

```json
{
  "type": "object",
  "required": ["_id", "name", "link", "owner", "likes", "createdAt"],
  "properties": {
    "_id": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{24}$"
    },
    "name": {
      "type": "string"
    },
    "link": {
      "type": "string"
    },
    "owner": {
      "$ref": "#/components/schemas/UserPublic"
    },
    "likes": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserPublic"
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

Current note:

- `likes` currently returns populated user documents, not ids or like-count metadata

### `SignupResponse`

Represents the current legacy signup success shape.

```json
{
  "type": "object",
  "required": ["name", "about", "avatar", "email"],
  "properties": {
    "name": {
      "type": "string"
    },
    "about": {
      "type": "string"
    },
    "avatar": {
      "type": "string"
    },
    "email": {
      "type": "string"
    }
  }
}
```

## Naming Conventions

### Paths

- Use existing runtime paths exactly as implemented.
- For path parameters, use OpenAPI curly-brace notation:
  - runtime: `/users/:userID`
  - contract: `/users/{userID}`
  - runtime: `/cards/:cardId`
  - contract: `/cards/{cardId}`

### Parameter names

Preserve current parameter names where already visible in routes:

- `userID`
- `cardId`

Do not normalize `userID` to `userId` in Phase 2, because the runtime route already exposes `userID`.

### operationId naming

Use verb-first camelCase:

- `signupUser`
- `signinUser`
- `listUsers`
- `getCurrentUser`
- `getUserById`
- `updateCurrentUser`
- `updateCurrentUserAvatar`
- `listCards`
- `createCard`
- `deleteCard`
- `likeCard`
- `unlikeCard`

### Schema names

Use PascalCase singular schema names:

- `AuthTokenResponse`
- `SignupResponse`
- `User`
- `UserPublic`
- `Card`
- `RuntimeErrorEnvelope`

## Legacy Behavior to Preserve in Phase 2

These should be documented, not silently "fixed":

- signup returns a reduced user object without `_id`
- signin returns only `{ token }`
- card responses embed populated user objects in `owner` and `likes`
- error responses are `{ "message": "..." }`
- protected auth remains bearer JWT
- `userID` remains the public path parameter name

## Legacy Gaps to Mark Explicitly

These should be called out in docs and OpenAPI notes, but not normalized in code yet:

- no request correlation id
- no machine-readable error code in runtime responses
- no health endpoint
- no API version prefix
- no pagination for users/cards
- no formal response projection layer between Mongoose and API
- dev JWT secret fallback exists outside production

## Decisions from Phase 2.2

- Phase 2 contract work is documentation-first, not behavior-first.
- OpenAPI should describe current runtime behavior, not an aspirational redesign.
- Normalized error codes are introduced as a target vocabulary now, even though runtime still returns only `message`.
- The first schema set is intentionally small and reusable.

## Ready for Phase 2.3

Phase 2.3 can start when:

- this baseline is accepted
- route inventory remains consistent with the current backend
- the first OpenAPI skeleton uses these schema names and naming rules
