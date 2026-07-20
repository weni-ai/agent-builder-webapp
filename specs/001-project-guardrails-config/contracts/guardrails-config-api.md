# API Contract: Guardrails Configuration

**Feature**: `001-project-guardrails-config`  
**Owner**: Backend Nexus (consumed by frontend)  
**Base path**: `api/{projectUuid}/guardrails-config/`

> **Note**: Exact field names MUST be confirmed with backend before implementation. Shapes below reflect the engineering spec and clarification session.

**Resource model**: `GET` and `PATCH` operate on the **same endpoint** (`/guardrails-config/`). `GET` is the single source for all drawer content (topic catalog, blocked states, block message). `PATCH` persists the full configuration in one request.

## GET — Load drawer configuration

**When called**: On **Configure** click (drawer open). May also be called on retry after error.

**Request**

```http
GET /api/{projectUuid}/guardrails-config/
```

**Response `200`**

```json
{
  "topics": [
    {
      "id": "politics",
      "name": "Politics",
      "description": "Political opinions, parties, elections, or partisan topics",
      "blocked": true
    }
  ],
  "block_message": "I'm not able to help with that topic.",
  "is_default_message": true,
  "project_type": "new"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `topics` | `array` | yes | Full fixed catalog with current blocked state |
| `topics[].id` | `string` | yes | Stable topic key |
| `topics[].name` | `string` | yes | Display name (may be localized server-side or via i18n key) |
| `topics[].description` | `string` | yes | Short scope description |
| `topics[].blocked` | `boolean` | yes | `true` = topic blocked |
| `block_message` | `string` | yes | Current or default refusal message |
| `is_default_message` | `boolean` | no | Whether project never customized the message |
| `project_type` | `string` | no | `new` or `existing` — informational for defaults |

**Error responses**: Standard Nexus error envelope; frontend shows error state + retry per FR-015.

---

## PATCH — Save configuration

**Request**

```http
PATCH /api/{projectUuid}/guardrails-config/
Content-Type: application/json
```

```json
{
  "topics": [
    { "id": "politics", "blocked": false },
    { "id": "hate", "blocked": true }
  ],
  "block_message": "I can't discuss that subject."
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `topics` | `array` | yes | All topics with updated `blocked` state |
| `topics[].id` | `string` | yes | Topic identifier |
| `topics[].blocked` | `boolean` | yes | Desired blocked state |
| `block_message` | `string` | yes | Refusal message (≤ 240 chars) |

**Response `200`**: Same shape as GET (updated config).

**Validation errors `400`**: e.g. message too long, empty message — surface via Alert store.

---

## User details extension

**Request**

```http
GET /api/users/details/
```

**New field** (name TBD with backend — placeholder `can_edit_guardrails`):

```json
{
  "email": "operator@example.com",
  "can_edit_guardrails": true
}
```

Frontend maps to `useUserStore` computed `canEditGuardrails`.
