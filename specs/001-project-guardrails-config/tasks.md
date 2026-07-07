---
description: "Task list for Project Safety Guardrails Configuration"
---

# Tasks: Project Safety Guardrails Configuration

**Input**: Design documents from `/specs/001-project-guardrails-config/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/guardrails-config-api.md](./contracts/guardrails-config-api.md)

**Organization**: Tasks grouped for human implementation (~1 PR per phase). Each task has a single clear deliverable with file paths.

**API contract**: `GET /guardrails-config/` loads drawer data; `PATCH /guardrails-config/` saves (same resource).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: US1, US2, US3 per spec.md

---

## Phase 1: Setup

**Purpose**: Scaffold folders and i18n namespace before implementation.

- [ ] T001 Create `src/components/Instructions/SafetyGuardrails/` folder and `src/api/adapters/guardrails/` folder per plan.md structure
- [ ] T002 [P] Add `agents.instructions.safety_guardrails` i18n keys (section, drawer, modals, validation) in `src/locales/en.json`, `src/locales/pt_br.json`, `src/locales/es.json`, and `src/locales/ro.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API client, adapter, Pinia store, and admin permission — **must complete before UI stories**.

**⚠️ CRITICAL**: No user story UI work until this phase is done.

- [ ] T003 Implement `GET`/`PATCH` Nexus client in `src/api/nexus/Guardrails.js` targeting `api/${projectUuid}/guardrails-config/`
- [ ] T004 Implement request/response mapping in `src/api/adapters/guardrails/guardrailsConfig.ts` (`blocked` ↔ toggle on, `block_message` field)
- [ ] T005 Register Guardrails module on `src/api/nexusaiAPI.js`
- [ ] T006 Implement `useGuardrailsStore` in `src/store/Guardrails.ts` (load via GET, draft snapshot, save via PATCH, status: loading/ready/error/saving)
- [ ] T007 Extend `src/store/User.js` with `canEditGuardrails` computed from new `api/users/details/` field
- [ ] T008 [P] Add adapter unit tests in `src/api/adapters/guardrails/__tests__/guardrailsConfig.spec.ts`
- [ ] T009 [P] Add store unit tests in `src/store/__tests__/Guardrails.unit.spec.js` (load, draft, save, permission gating)

**Checkpoint**: Store loads drawer data from `GET /guardrails-config/` and persists via `PATCH /guardrails-config/`

---

## Phase 3: User Story 1 — Manage guardrail topics (Priority: P1) 🎯 MVP

**Goal**: Section on Instructions page, drawer with topic toggles, confirmation when turning blocking off, save/cancel/discard flows.

**Independent Test**: Open Instructions → Safety guardrails section → **Configure** → `GET /guardrails-config/` → toggle topics → **Save** → confirmation when disabling → PATCH succeeds.

### Implementation for User Story 1

- [ ] T010 [US1] Build `SafetyGuardrailsSection.vue` in `src/components/Instructions/SafetyGuardrails/SafetyGuardrailsSection.vue` (Figma `7773:7142`: title, description, **Configure** button)
- [ ] T011 [US1] Build drawer shell in `src/components/Instructions/SafetyGuardrails/SafetyGuardrailsDrawer.vue` (`UnnnicDrawerNext`, Save/Cancel footer, open triggers store `load()` → GET)
- [ ] T012 [US1] Build topic list in `src/components/Instructions/SafetyGuardrails/SafetyGuardrailsTopicList.vue` (switch on = blocked, disabled when `!canEditGuardrails`)
- [ ] T013 [US1] Build confirmation modal in `src/components/Instructions/SafetyGuardrails/ModalConfirmDisableTopics.vue` (warn on any blocked→allowed; enhanced copy when all off)
- [ ] T014 [US1] Mount section in `src/components/Instructions/InstructionsCategorization/index.vue` below `CategoriesView`/`ListView` and wire drawer open/close/save/cancel/discard-silent-close in store
- [ ] T015 [P] [US1] Add component tests in `src/components/Instructions/SafetyGuardrails/__tests__/SafetyGuardrailsSection.spec.js` and `SafetyGuardrailsDrawer.spec.js`

**Checkpoint**: MVP — admin can view section, open drawer, toggle topics, confirm disable, save via PATCH

---

## Phase 4: User Story 2 — Configure block message (Priority: P2)

**Goal**: Block message textarea in drawer with 240-char validation; persisted atomically with topics on Save.

**Independent Test**: Open drawer → edit block message → save within limit succeeds; empty/over-limit blocked with feedback.

### Implementation for User Story 2

- [ ] T016 [US2] Build `SafetyGuardrailsBlockMessage.vue` in `src/components/Instructions/SafetyGuardrails/SafetyGuardrailsBlockMessage.vue` (textarea, char counter, show default from GET)
- [ ] T017 [US2] Add block message validation and atomic PATCH payload in `src/store/Guardrails.ts` and `SafetyGuardrailsDrawer.vue` save flow (empty/whitespace/>240 blocked)
- [ ] T018 [P] [US2] Add tests in `src/components/Instructions/SafetyGuardrails/__tests__/SafetyGuardrailsBlockMessage.spec.js` and extend `Guardrails.unit.spec.js` for message validation

**Checkpoint**: Block message edits persist with topics in single PATCH

---

## Phase 5: User Story 3 — Uniform project-level application (Priority: P1)

**Goal**: Drawer reflects project-level config from API; defaults differ for new vs existing projects (no per-agent UI).

**Independent Test**: Mock GET for new/existing project types → drawer shows correct default topic states and platform default message.

### Implementation for User Story 3

- [ ] T019 [US3] Ensure `src/store/Guardrails.ts` and drawer components render API-returned defaults without client-side override (new = all blocked, existing = all allowed, default message)
- [ ] T020 [P] [US3] Add store tests in `src/store/__tests__/Guardrails.unit.spec.js` for new vs existing project GET response shapes per `contracts/guardrails-config-api.md`

**Checkpoint**: First-open defaults match spec; no per-agent configuration surface exists

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Permissions, loading/error states, lint, manual validation.

- [ ] T021 Enforce read-only mode (disabled switches, textarea, Save) for non-admin across `SafetyGuardrailsDrawer.vue` and child components using `useUserStore().canEditGuardrails`
- [ ] T022 Add loading skeleton and error+retry states in `SafetyGuardrailsSection.vue` and `SafetyGuardrailsDrawer.vue` per FR-015
- [ ] T023 Run `npm run lint` on touched files and execute Vitest suites for `Guardrails`, `guardrailsConfig`, and `SafetyGuardrails/__tests__/`
- [ ] T024 Validate manually against `specs/001-project-guardrails-config/quickstart.md` checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2)
                                         ↘ Phase 5 (US3) — after Phase 2, can parallel with Phase 3/4
Phase 6 (Polish) — after Phases 3–5
```

### User Story Dependencies

| Story | Depends on | Notes |
| --- | --- | --- |
| US1 (P1) | Foundational | MVP — section + drawer + topics |
| US2 (P2) | US1 drawer shell | Block message lives inside same drawer |
| US3 (P1) | Foundational | Defaults come from GET response; verify display |

### Parallel Opportunities

**After Phase 2 completes:**

```bash
# Developer A — US1 UI
T010 → T011 → T012 → T013 → T014 → T015

# Developer B — US2 (after T011 drawer exists)
T016 → T017 → T018

# Developer C — US3 verification (independent of UI polish)
T019 → T020
```

**Within Phase 2:**

```bash
T008 + T009  # tests parallel after T003–T007
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (T001–T002)
2. Phase 2: Foundational (T003–T009)
3. Phase 3: US1 (T010–T015)
4. **STOP and VALIDATE** — topic toggles + save + disable confirmation

### Incremental Delivery

1. Setup + Foundational → data layer ready
2. US1 → MVP demo (topics only, block message can show read-only initially)
3. US2 → block message editing + validation
4. US3 → defaults verification
5. Polish → permissions, states, QA

### Suggested PR slices

| PR | Tasks | Scope |
| --- | --- | --- |
| PR1 | T001–T009 | API + store + tests |
| PR2 | T010–T015 | US1 UI + MVP |
| PR3 | T016–T018 | US2 block message |
| PR4 | T019–T024 | US3 + polish |

---

## Notes

- Toggle semantics: **on = blocked** (`blocked: true` in PATCH body)
- Drawer close (overlay/X/ESC): silent discard — no confirmation modal
- Do not split tasks further unless blocked; each phase is one human-sized chunk
- Commit convention: `feat(guardrails): <description>`
