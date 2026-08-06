# Research: Project Safety Guardrails Configuration

**Feature**: `001-project-guardrails-config`  
**Date**: 2026-07-06

## R1 — Drawer pattern for Instructions

**Decision**: Reuse `UnnnicDrawerNext` + `UnnnicDrawerContent` + footer Save/Cancel, mirroring `NewInstructionDrawer`.

**Rationale**: Established Instructions pattern; same lazy mount, footer actions, and `@update:open` close handler. Spec requires silent discard on close — match `NewInstructionDrawer` (`onOpenChange` → reset without prompt).

**Alternatives considered**:
- Legacy `UnnnicDrawer` (Supervisor filters): rejected — newer drawer API already used in Instructions.
- Inline panel without drawer: rejected — contradicts clarified UX.

## R2 — State ownership

**Decision**: Dedicated Pinia setup store `useGuardrailsStore` in `src/store/Guardrails.ts`.

**Rationale**: Constitution mandates one store per domain. Guardrails has its own API, loading/saving lifecycle, and drawer state — separate from `Instructions` store avoids coupling.

**Alternatives considered**:
- Extend `useInstructionsStore`: rejected — different API surface and lifecycle; violates single-responsibility.

## R3 — API layer placement

**Decision**: `src/api/nexus/Guardrails.js` + `src/api/adapters/guardrails/guardrailsConfig.ts`; register on `nexusaiAPI`. `GET /guardrails-config/` loads drawer data; `PATCH /guardrails-config/` saves on the same resource.

**Rationale**: Matches existing `Instructions` client + adapter pattern. Single endpoint for read/write keeps store logic simple. Raw payloads never reach components.

**Alternatives considered**:
- Direct Axios in store: rejected — constitution forbids cross-layer shortcuts.

## R4 — Admin permission source

**Decision**: New boolean (or equivalent) on `GET api/users/details/` response; expose `canEditGuardrails` computed on `useUserStore`.

**Rationale**: Clarified in spec session; backend owns authorization truth. Frontend only disables switches, textarea, and Save.

**Alternatives considered**:
- Client-side role inference: rejected — no reliable project-role pattern exists in codebase today.

## R5 — Confirmation modal for turning blocking off

**Decision**: `UnnnicDialog` with `type="warning"` before PATCH when any topic transitions from blocked → allowed; enhanced copy when all topics become allowed.

**Rationale**: Matches `ModalRemoveCategory` and FDD US-1 scenarios 2 and 5. Intercept on Save click, not on individual toggle.

**Alternatives considered**:
- Confirm on each toggle flip: rejected — worse UX; FDD confirms on save.

## R6 — Section placement

**Decision**: Render `SafetyGuardrailsSection` at the bottom of `InstructionsCategorization/index.vue`, after `CategoriesView` / `ListView`.

**Rationale**: Clarified placement below category groups; section remains visible regardless of active segmented view (categories vs list).

**Alternatives considered**:
- Inside `CategoriesView` only: rejected — would hide section in list view.

## R7 — i18n key namespace

**Decision**: Keys under `agents.instructions.safety_guardrails.*` in all four locale files.

**Rationale**: Feature lives in Instructions area; follows existing `agents.instructions.*` convention.

**Alternatives considered**:
- Top-level `guardrails.*`: rejected — breaks contextual namespacing rule.

## R8 — Toggle semantics mapping

**Decision**: UI switch `on` = `blocked: true` in API payload; `off` = `blocked: false`.

**Rationale**: Product spec defines toggle on = blocked. Adapter maps API field names to UI model.

**Alternatives considered**:
- Invert in UI labels only: rejected — increases confusion vs FDD.
