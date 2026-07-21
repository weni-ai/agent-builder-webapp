# Implementation Plan: Project Safety Guardrails Configuration

**Branch**: `001-project-guardrails-config` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-project-guardrails-config/spec.md`

**Planning note**: Tasks are grouped for human implementation — not split into micro-steps. A developer can complete each phase as one cohesive unit of work.

## Summary

Add a **Safety guardrails** section to the Instructions page (below category groups) with a **Configure** button that opens a drawer. **Configure** triggers `GET /guardrails-config/` to load topics, blocked states, and block message into the drawer. Admin users edit and save atomically via `PATCH /guardrails-config/` (same resource). Turning blocking off requires a confirmation modal (enhanced when all topics are unblocked). Non-admin users see read-only controls based on a new field from `GET api/users/details/`.

**Technical approach**: New `Guardrails` Pinia store + Nexus API client + adapter; UI components under `components/Instructions/SafetyGuardrails/` using `UnnnicDrawerNext` and `UnnnicDialog` patterns already established in Instructions.

## Technical Context

**Language/Version**: TypeScript (preferred) / JavaScript — Vue 3.5 Composition API  
**Primary Dependencies**: Vue 3.5, Pinia 3, `@weni/unnnic-system`, vue-i18n, Axios via `httpClientFactory`  
**Storage**: N/A (server state via Nexus API)  
**Testing**: Vitest 3 + `@vue/test-utils` + `@pinia/testing`  
**Target Platform**: Agent Builder webapp (Rspack, Module Federation micro-frontend)  
**Project Type**: Federated Vue SPA  
**Performance Goals**: Standard config UI — no special latency targets; drawer load < 2s perceived on typical network  
**Constraints**: VTEX Content Guide (240-char message), 4-locale i18n, Figma node `7773:7142`, constitution layering  
**Scale/Scope**: 1 new section, 1 drawer, 11 fixed topics, 2 API endpoints (+ user details field), ~8–10 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How addressed |
| --- | --- | --- |
| I. Purpose & scope (frontend only) | ✅ PASS | UI + API consumption; no LLM/persistence logic reimplemented |
| II. Architecture (layering) | ✅ PASS | `api/nexus` → adapter → `store/Guardrails` → components |
| III. Componentization | ✅ PASS | Feature folder `SafetyGuardrails/`; reuse Unnnic drawer/dialog |
| IV. State & data | ✅ PASS | Dedicated Pinia setup store; async loading/saving states |
| V. UX, i18n, a11y | ✅ PASS | Loading/error states; 4 locales; `data-testid` on interactive elements |
| VI. Design system | ✅ PASS | Unnnic components + SCSS tokens |
| VII. Product spec binding | ✅ PASS | Implements FDD + clarified engineering spec |
| VIII. Testing | ✅ PASS | Store + component behavior tests planned |
| IX. Code review rules | ✅ PASS | Scoped diff; conventional commits |
| Federation intact | ✅ PASS | No changes to `src/exports/` |

**Post-design re-check**: ✅ All gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-guardrails-config/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/
│   └── guardrails-config-api.md
└── tasks.md             # (/speckit-tasks — optional, use phases below if preferred)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── nexus/
│   │   └── Guardrails.js                    # GET/PATCH client
│   ├── adapters/
│   │   └── guardrails/
│   │       └── guardrailsConfig.ts          # API ↔ domain mapping
│   └── nexusaiAPI.js                        # register Guardrails module
├── store/
│   ├── Guardrails.ts                        # domain + drawer state
│   └── User.js                              # extend with canEditGuardrails
├── components/
│   └── Instructions/
│       ├── InstructionsCategorization/
│       │   └── index.vue                    # mount SafetyGuardrailsSection
│       └── SafetyGuardrails/
│           ├── SafetyGuardrailsSection.vue  # card + Configure button
│           ├── SafetyGuardrailsDrawer.vue   # drawer shell + save/cancel
│           ├── SafetyGuardrailsTopicList.vue
│           ├── SafetyGuardrailsBlockMessage.vue
│           ├── ModalConfirmDisableTopics.vue
│           └── __tests__/                   # component specs
└── locales/
    ├── en.json
    ├── pt_br.json
    ├── es.json
    └── ro.json
```

**Structure Decision**: Single federated Vue frontend. Feature colocated under `Instructions/` because entry point is the Instructions page. Domain state isolated in `Guardrails` store per constitution.

## Implementation Phases

> **Guidance**: Each phase is one PR-sized chunk. Do not split further unless blocked.

### Phase 1 — API layer & store foundation

**Goal**: Data flows from Nexus to Pinia with correct shapes and permission gating.

**Deliverables**:
- `api/nexus/Guardrails.js` — `read({ projectUuid })` → `GET /guardrails-config/` (drawer data), `update({ projectUuid, data })` → `PATCH /guardrails-config/`
- `api/adapters/guardrails/guardrailsConfig.ts` — map `blocked` ↔ toggle, message field
- Register on `nexusaiAPI` (project-scoped path: `api/${projectUuid}/guardrails-config/`)
- `store/Guardrails.ts` — load/save actions, `status` (loading/ready/error/saving), draft vs saved snapshot
- Extend `store/User.js` — `canEditGuardrails` from `api/users/details/` new field
- Unit tests: adapter + store (mock API, fresh Pinia)

**Done when**: Store loads config, holds draft, PATCH saves, permission computed works in tests.

---

### Phase 2 — UI section + drawer (happy path)

**Goal**: Visible section and fully functional drawer for admin users.

**Deliverables**:
- `SafetyGuardrailsSection.vue` — bordered card per Figma `7773:7142` (title, description, Configure)
- `SafetyGuardrailsDrawer.vue` — `UnnnicDrawerNext`, topic list, block message textarea, Save/Cancel footer
- `SafetyGuardrailsTopicList.vue` — switch per topic (on = blocked), disabled when `!canEditGuardrails`
- `SafetyGuardrailsBlockMessage.vue` — textarea, 240-char counter, validation
- Wire into `InstructionsCategorization/index.vue` below categories/list views
- i18n keys in all 4 locale files (`agents.instructions.safety_guardrails.*`)
- Component + integration tests with `data-testid` maps

**Done when**: Admin can open drawer, edit topics/message, save via PATCH, see success feedback.

---

### Phase 3 — Confirmation modals, validation & edge cases

**Goal**: Complete FDD flows for disable confirmation, all-off warnings, and discard rules.

**Deliverables**:
- `ModalConfirmDisableTopics.vue` — intercept Save when any topic goes blocked→allowed; enhanced copy when all off
- Client validation: empty/whitespace message, > 240 chars (block save + inline error)
- Silent discard on drawer close (overlay, X, ESC) — reset draft to saved snapshot
- Read-only mode: disabled switches, textarea, Save for non-admin
- Loading skeleton in section/drawer; error state with retry
- Tests covering modal branches, validation, permission, discard

**Done when**: All spec acceptance scenarios and edge cases pass in tests + manual quickstart.

---

### Phase 4 — Polish & merge readiness

**Goal**: Production-ready quality gates.

**Deliverables**:
- Run `npm run lint` on touched files
- Run targeted Vitest suites (store, adapter, components)
- Manual pass of [quickstart.md](./quickstart.md)
- Coordinate with backend on final API field names (`can_edit_guardrails`, topic ids)

**Done when**: Constitution Check IX satisfied; ready for QA.

## Complexity Tracking

> No violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| — | — | — |

## Artifacts Generated

| Artifact | Path |
| --- | --- |
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| API contract | [contracts/guardrails-config-api.md](./contracts/guardrails-config-api.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Next Steps

1. **Implement** — start with Phase 1 (`/speckit-implement` or manual)
2. **Optional** — `/speckit-tasks` if you want a formal `tasks.md` (can mirror the 4 phases above without further splitting)
3. **Optional** — `/speckit-analyze` before implement to cross-check spec ↔ plan alignment
