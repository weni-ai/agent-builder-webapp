# Feature Specification: Project Safety Guardrails Configuration

**Feature Branch**: `001-project-guardrails-config`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Etapa 6 — Engineering Spec e implementação. Fixa o commit da Product Spec. Divergência vira emenda no repo de produto — nunca desvio silencioso. Resultado: Engineering Spec no submodule + implementação iniciada."

**Product Spec Reference**: FDD · Configuração de tópicos de guardrails por projeto (V2) — binding source of truth for *what* and *why*.

## Governance

This Engineering Spec defines *how* the frontend delivers the Product Spec. It MUST NOT redefine product scope, behavior, or acceptance criteria.

| Rule | Requirement |
| --- | --- |
| Product Spec is binding | All functional behavior, defaults, and edge cases come from the FDD unless formally amended in the product repository |
| No silent divergence | Any implementation conflict with the FDD MUST be resolved by amending the Product Spec first, then updating this spec |
| Engineering scope | This repository owns operator UI, validation, persistence calls, and read-only enforcement for non-admin roles |
| Out of scope here | LLM refusal logic, session injection of block messages, and project-level persistence contracts are backend/model dependencies consumed via API |

## Clarifications

### Session 2026-07-06

- Q: How is Safety guardrails accessed within Instructions? → A: Dedicated section on the Instructions page, positioned below the instruction category groups (`CategoriesView`), with a right-aligned **Configure** action that opens a drawer containing all guardrail topics and a textarea for the block message.
- Q: How does the frontend determine edit permission for guardrails? → A: A new permission field on `GET /api/users/details/`; topic switches (and other editable controls) MUST be disabled for users without admin permission.
- Q: What happens when the drawer is closed with unsaved changes? → A: Discard silently and close the drawer; no confirmation prompt.
- Q: What does the Safety guardrails section show before opening the drawer? → A: Per Figma (`Instructions` file, node `7773:7142`): section title **Safety guardrails**, short description **Sensitive topics that Manager refuses to discuss**, and right-aligned **Configure** button in a bordered card row.
- Q: How does save work in the drawer? → A: Single **Save** action persists topic states and block message together via `PATCH /guardrails-config/` (categories and message may be sent together or as separate fields in the same request body).
- Q: Which endpoint loads drawer data (topics + block message)? → A: `GET /guardrails-config/` — same resource as save; opening the drawer fetches the full configuration from this endpoint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage project guardrail topics (Priority: P1)

As a project operator (owner/admin), I want to turn individual sensitive guardrail topics on or off for my project so I can control which subjects AI agents may discuss with end customers.

**Why this priority**: Core value of the feature — without per-topic control, operators remain dependent on support/engineering for guardrail adjustments.

**Independent Test**: On the Instructions page, locate the Safety guardrails section below the instruction categories, click **Configure**, and verify the drawer shows the fixed platform topic list with names, short descriptions, and current on/off state; toggle one topic, save, and confirm persisted behavior matches the toggle semantics (on = blocked, off = allowed).

**Acceptance Scenarios**:

1. **Given** the operator is on the Instructions page, **When** they view the Safety guardrails section below the instruction categories, **Then** they see the section title, the description "Sensitive topics that Manager refuses to discuss", and a right-aligned **Configure** action
2. **Given** the operator is on the Instructions page, **When** they click **Configure**, **Then** the system loads configuration via `GET /guardrails-config/` and opens a drawer showing all fixed platform topics with name, short description, and current state (on or off)
3. **Given** a topic has blocking turned on, **When** the operator turns blocking off and saves the configuration, **Then** the system shows a confirmation modal, **And** after confirmation agents in the project treat that topic normally in customer conversations
4. **Given** a topic has blocking turned off, **When** the operator turns blocking on and saves the configuration, **Then** agents in the project refuse that topic and display the block message
5. **Given** the operator changed topic states in the drawer without saving, **When** they use an explicit cancel action, **Then** no changes are persisted, **And** the previous configuration remains in effect
6. **Given** the operator changed topic or message values in the drawer without saving, **When** they close the drawer (overlay click, close control, or ESC), **Then** changes are discarded silently, **And** no confirmation prompt is shown
7. **Given** the operator turned blocking off for all topics, **When** they confirm save in the confirmation modal, **Then** the modal shows warnings about the action and summarizes consequences of disabling guardrails, **And** the system persists the configuration after confirmation

---

### User Story 2 - Configure block message (Priority: P2)

As a project operator (owner/admin), I want to define the message shown to the customer when a blocked topic is triggered so the refusal tone aligns with brand policy.

**Why this priority**: Enables brand-aligned refusals but depends on topic toggles (P1) being in place first.

**Independent Test**: Open the Safety guardrails drawer via **Configure**, view or edit the block message textarea (max 240 characters), save, and verify validation rejects over-limit or whitespace-only input.

**Acceptance Scenarios**:

1. **Given** the operator opens the Safety guardrails drawer via **Configure**, **When** they view the block message field, **Then** they see the current project message or the platform default if never edited
2. **Given** at least one topic has blocking turned on, **When** a customer requests content related to that topic, **Then** the agent refuses and displays the project's configured block message
3. **Given** the operator edits the block message within the 240-character limit, **When** they click **Save** in the drawer, **Then** topic states and block message are persisted together in a single save operation
4. **Given** the operator enters a message exceeding 240 characters, **When** they attempt to save, **Then** the system prevents saving and indicates the character limit was exceeded

---

### User Story 3 - Uniform application across all project agents (Priority: P1)

As a project operator, I want guardrail configuration to apply at the project level so all agents in the agent team behave consistently.

**Why this priority**: Consistency across agents is a primary product promise; misconfiguration per agent would undermine trust.

**Independent Test**: Verify defaults on first open differ for new vs existing projects; confirm no per-agent configuration surface exists.

**Acceptance Scenarios**:

1. **Given** a new or recently created project with no prior guardrails configuration, **When** the operator opens the Safety guardrails drawer for the first time, **Then** all topics appear with blocking on by default, **And** the block message uses the platform default
2. **Given** an existing project with no prior guardrails configuration, **When** the operator opens the Safety guardrails drawer for the first time, **Then** all topics appear with blocking off by default, **And** the block message uses the platform default

---

### Edge Cases

- When multiple blocked topics could apply to the same customer message, the agent refuses once and displays the project's single block message (no per-topic message variants)
- When the block message is empty or contains only whitespace, saving is prevented and the operator is prompted for valid content
- When guardrails change while conversations are in progress, the new configuration applies to messages processed after save; already answered conversations are not rewritten retroactively
- When the platform adds a new fixed topic, it appears on next configuration open with the default for the project type (on for new projects, off for existing projects)
- When the operator lacks admin permission (per `GET /api/users/details/`), they can open the drawer but topic switches, block message textarea, and save are disabled
- When the operator closes the drawer with unsaved changes (overlay, close control, or ESC), changes are discarded silently without a confirmation prompt; reopening the drawer shows the last saved configuration
- When two owner/admin operators edit simultaneously, last write wins — the latest save overwrites the prior configuration without conflict warning

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a dedicated Safety guardrails section on the Instructions page, positioned below the instruction category groups
- **FR-001a**: The section MUST display title **Safety guardrails**, description **Sensitive topics that Manager refuses to discuss**, and a right-aligned **Configure** action in a bordered card layout (Figma reference: `Instructions` · node `7773:7142`)
- **FR-001b**: The **Configure** action MUST open a drawer for editing
- **FR-001c**: The drawer MUST contain the full guardrail topic list (toggles) and a single block message textarea, populated from `GET /guardrails-config/`
- **FR-002**: System MUST display the fixed platform topic catalog (Politics, Physical health, Sexual content, Bias, Hate, Religion, Suicide, Self-harm, Beliefs, Gender identity, Sexual relations) with name, short description, and on/off state per topic
- **FR-003**: System MUST use toggle semantics where **on = topic blocked** (agent refuses and shows block message) and **off = topic allowed** (agent treats normally)
- **FR-004**: System MUST initialize topic defaults by project type: all topics **on** for new projects, all topics **off** for existing projects, when no prior configuration exists
- **FR-005**: System MUST apply new platform topics automatically with the same project-type default, without operator action to create, rename, or delete topics
- **FR-006**: System MUST provide a single **Save** action in the drawer that persists topic states and block message together in one operation; turning blocking **off** MUST require confirmation via modal before the save request is sent
- **FR-007**: System MUST show additional risk warnings in the confirmation modal when the operator turns blocking off for **all** topics
- **FR-008**: System MUST support discarding unsaved edits: explicit cancel reverts without persisting; closing the drawer (overlay, close control, or ESC) discards silently with no confirmation prompt
- **FR-009**: System MUST provide a single block message field per project, shared by all blocked topics, with a maximum of 240 characters
- **FR-010**: System MUST display the platform default block message when the project has never customized the message
- **FR-011**: System MUST prevent saving a block message that is empty, whitespace-only, or exceeds 240 characters, with clear validation feedback
- **FR-012**: System MUST NOT offer per-agent guardrail configuration or per-topic block messages in this release
- **FR-013**: System MUST read admin permission from a new field on `GET /api/users/details/` and enforce read-only access for users without admin permission: topic switches disabled, block message textarea disabled, save unavailable
- **FR-014**: System MUST apply project-level configuration uniformly to all agents in the project's agent team via backend persistence (frontend consumes and reflects saved state)
- **FR-015**: System MUST handle loading, empty, and error states for the configuration surface per product quality standards
- **FR-016**: All user-facing copy MUST be localized in EN, PT-BR, ES, and RO following the VTEX Content Guide
- **FR-017**: Operators MUST NOT be able to create, rename, delete, or reorder guardrail topics
- **FR-018**: Load MUST call `GET /guardrails-config/` to populate the drawer (topics, blocked states, block message); save MUST call `PATCH /guardrails-config/` on the same resource with topic categories and block message in the same request body; partial per-field saves are NOT supported in the UI

### Key Entities

- **Guardrail topic**: A fixed sensitive subject from the platform catalog; attributes include identifier, display name, short description, and blocked state (on/off)
- **Project guardrails configuration**: Project-scoped settings comprising per-topic blocked states and one block message; applies to all agents in the project
- **Block message**: Single refusal text (≤ 240 characters) shown to end customers when any blocked topic is triggered; operator-customized or platform default
- **Project type context**: Classification used only for initial defaults (new vs existing project) when no prior configuration exists

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Owner/admin operators can view and update all fixed guardrail topics and the block message without support or engineering intervention
- **SC-002**: 100% of acceptance scenarios in this spec and the binding FDD pass in QA before release
- **SC-003**: Users without admin permission cannot persist changes (verified by disabled switches, textarea, and save; permission sourced from `GET /api/users/details/`)
- **SC-004**: Saving an invalid block message (empty, whitespace-only, or > 240 characters) is blocked in 100% of attempts with actionable feedback
- **SC-005**: Turning blocking off for one or all topics always requires explicit confirmation; turning all topics off surfaces risk warnings before persistence
- **SC-006**: After configuration save, agent behavior in customer conversations reflects the new settings for subsequent messages (no retroactive rewrite of past responses)
- **SC-007**: Support tickets requesting guardrail topic or block-message changes decrease after release (tracked post-launch)

## Assumptions

- Backend Nexus exposes `GET /guardrails-config/` (load drawer: topics + block message) and `PATCH /guardrails-config/` (save) as the same project-scoped resource
- AI model layer enforces refusal for blocked topics and injects the configured block message into the customer session per backend contract
- "New project" vs "existing project" classification is determined by backend/platform rules and exposed to the frontend for default initialization
- Admin edit permission is supplied by a new field on `GET /api/users/details/` (not inferred client-side from project role)
- Block message customized by the operator is not auto-translated; UI copy (labels, modals, validation, section title/description) is localized in four languages per Figma intent
- Concurrent edits use last-write-wins with no optimistic locking or merge UI in this release
- Detailed change history/audit of guardrails configuration is out of scope for this release (planned P3)

## Dependencies

| Dependency | Owner | Impact on frontend |
| --- | --- | --- |
| Admin permission field on user details | Backend Nexus | New field on `GET /api/users/details/` gates disabled state for switches, textarea, and save |
| Guardrails config API | Backend Nexus | `GET /guardrails-config/` loads drawer data (topics + message); `PATCH /guardrails-config/` saves both in one request body |
| Topic refusal behavior | AI Models team | Frontend reflects saved config; does not implement refusal logic |
| Project-level persistence and session message injection | Backend Nexus | Frontend calls API to load/save; block message delivery to customers is backend-owned |
| UI localization (EN, PT-BR, ES, RO) | VTEX Localization / engineering | All new strings in four locale files before release |
| Content Guide (240-char limit, tone) | VTEX Documentation | Block message and modal copy comply with guide |

## Out of Scope (This Release)

- Operator-created, edited, or deleted guardrail topics
- Per-agent guardrail configuration
- Different block messages per topic
- Automatic translation of operator-customized block messages
- Detailed configuration change history or audit trail (P3)
