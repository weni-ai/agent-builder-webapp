# Quickstart: Validate Safety Guardrails Configuration

**Feature**: `001-project-guardrails-config`

## Prerequisites

- Node.js ≥ 22.12.0
- Backend stubs or dev environment exposing:
  - `GET/PATCH api/{projectUuid}/guardrails-config/`
  - `can_edit_guardrails` (or equivalent) on `GET api/users/details/`
- Agent Builder running locally with Instructions categorization enabled

## Setup

```bash
npm install
npm run dev
```

Navigate to **Agents → Instructions** for a project with categorization feature flag on.

## Manual validation checklist

### Section & drawer (US-1)

- [ ] Safety guardrails section appears below instruction categories
- [ ] Section shows title, description, and **Configure** button (Figma `7773:7142`)
- [ ] **Configure** triggers `GET /guardrails-config/` and opens drawer with 11 fixed topics (name, description, toggle)
- [ ] Toggle on = blocked; toggle off = allowed

### Save & confirmation (US-1, FR-006/007)

- [ ] Turning any topic off and clicking **Save** opens confirmation modal
- [ ] Turning all topics off shows enhanced risk warnings in modal
- [ ] After confirm, PATCH succeeds and drawer reflects saved state
- [ ] Turning topic on saves without extra confirmation (after any required off-confirm flow)

### Block message (US-2)

- [ ] Textarea shows current message or platform default
- [ ] Message > 240 chars blocked with feedback
- [ ] Empty/whitespace-only message blocked on save
- [ ] Valid message persists with topics in single PATCH

### Permissions (FR-013)

- [ ] User without admin: switches, textarea, and Save disabled
- [ ] User with admin: full edit capability

### Discard behavior (FR-008)

- [ ] Close drawer (X, overlay, ESC) with unsaved edits → silent discard
- [ ] Reopen drawer → shows last saved config

### States (FR-015)

- [ ] Loading skeleton/spinner while fetching config
- [ ] Error state with retry on API failure
- [ ] Success toast/feedback after save (Alert store pattern)

### i18n (FR-016)

- [ ] Switch locale (EN, PT-BR, ES, RO) — all new strings present, no hardcoded copy

## Automated tests

```bash
# Guardrails store
npx vitest run src/store/__tests__/Guardrails.unit.spec.js

# Safety guardrails components
npx vitest run src/components/Instructions/SafetyGuardrails

# API adapter
npx vitest run src/api/adapters/guardrails

# Lint touched files
npm run lint
```

## Expected outcomes

- All Vitest suites green
- Manual checklist passes against spec acceptance scenarios
- No constitution violations (HTTP via `api/`, i18n complete, loading/error states)

## References

- Spec: [spec.md](./spec.md)
- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/guardrails-config-api.md](./contracts/guardrails-config-api.md)
