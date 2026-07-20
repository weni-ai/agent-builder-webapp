# Data Model: Project Safety Guardrails Configuration

**Feature**: `001-project-guardrails-config`  
**Date**: 2026-07-06

## Entities

### GuardrailTopic

Fixed platform catalog entry displayed in the drawer.

| Field | Type | Source | Notes |
| --- | --- | --- | --- |
| `id` | `string` | API | Stable topic identifier (e.g. `politics`, `hate`) |
| `name` | `string` | API or i18n | Display name |
| `description` | `string` | API or i18n | Short scope description |
| `blocked` | `boolean` | API / draft | `true` = toggle on = topic blocked |

**Validation**: Read-only catalog; operator cannot create/edit/delete topics.

### GuardrailsConfig (project-scoped)

| Field | Type | Source | Notes |
| --- | --- | --- | --- |
| `topics` | `GuardrailTopic[]` | API | Full catalog with current blocked state |
| `blockMessage` | `string` | API / draft | ≤ 240 chars; platform default when never customized |
| `isDefaultMessage` | `boolean` | API (optional) | Whether message is still platform default |
| `projectType` | `'new' \| 'existing'` | API (optional) | Drives first-load defaults when no prior config |

### GuardrailsDraft (UI-only)

Working copy while drawer is open.

| Field | Type | Notes |
| --- | --- | --- |
| `topics` | `GuardrailTopic[]` | Cloned from saved config on drawer open |
| `blockMessage` | `string` | Editable textarea value |
| `isDirty` | `boolean` | Derived: draft ≠ saved snapshot |

**Lifecycle**:
1. **Configure** clicked → `GET /guardrails-config/` → clone response into draft.
2. User edits → `isDirty = true`.
3. Save → validate → confirm if blocking turned off → PATCH → refresh saved snapshot.
4. Cancel / close drawer → discard draft silently (no prompt).

### UserPermission (extension)

| Field | Type | Source | Notes |
| --- | --- | --- | --- |
| `canEditGuardrails` | `boolean` | `GET api/users/details/` | New backend field; gates edit controls |

## State transitions (store)

```text
idle → loading (fetch config)
loading → ready | error
ready → saving (PATCH after validation + confirm)
saving → ready | error
error → loading (retry)
```

## Validation rules

| Rule | Trigger | UI feedback |
| --- | --- | --- |
| Block message required | Save | Prevent save; inline validation message |
| Block message ≤ 240 chars | Save / input | Character counter + error at limit |
| No whitespace-only message | Save | Prevent save |
| Turn blocking off | Save | Warning modal (enhanced if all off) |
| No admin permission | Always | Disabled switches, textarea, Save |

## Relationships

```text
Project (1) ── has ── (1) GuardrailsConfig
GuardrailsConfig (1) ── contains ── (N) GuardrailTopic
User (1) ── permission ── canEditGuardrails → UI editability
```
