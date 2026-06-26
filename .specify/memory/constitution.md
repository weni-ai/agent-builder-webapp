# Agent Builder Webapp Frontend Constitution

## I. Purpose & Scope

Agent Builder Webapp is the frontend application that lets operators **create, configure,
test, publish, and monitor AI agents** inside the VTEX CX platform. Its users are operators
responsible for managing AI agents; their core workflows are creating agents, configuring
agents, testing agents (Preview), publishing agents, and monitoring agents (Supervisor,
Conversations, Improvements/Audit).

This constitution governs **frontend behavior only**. Backend concerns (LLM prompting,
sampling, retries, JSON contracts, confidence scoring, aggregation, retention/LGPD storage)
are consumed contracts, never reimplemented in this repository.

**Rationale**: A shared statement of purpose keeps every change anchored to the operator
workflows the product exists to serve and prevents scope creep into backend territory.

## II. Architecture

The application architecture is fixed and MUST be followed:

- **Framework**: Vue 3.5 with the Composition API (`<script setup lang="ts">`); the
  Options API MUST NOT be introduced in new code.
- **Layering**: A change MUST respect the established layers and their direction of
  dependency:
  - `views/` — route-level pages (one per route, lazy-loaded in `router/index.ts`).
  - `components/` — presentational and feature components (no route registration).
  - `composables/` — reusable reactive logic (`useX` naming, returns refs/computed).
  - `store/` — Pinia stores owning domain and server state.
  - `api/` — HTTP clients (`api/nexus/*`) and `api/adapters/*` that translate API payloads
    into domain shapes before they reach stores or components.
  - `utils/` — pure, framework-agnostic helpers and plugins.
- **HTTP access**: All network calls MUST go through the Axios clients created by
  `httpClientFactory` and the `api/` layer. Components and views MUST NOT call Axios
  directly. Raw API payloads MUST pass through an adapter before reaching the UI.
- **Module Federation**: This is a federated micro-frontend bundled with Rspack. Federated
  exports under `src/exports/` and shared singletons (`vue`, `pinia`, `vue-router`,
  `vue-i18n`) MUST remain stable; routing uses `createMemoryHistory` when federated.
- **Routing**: Routes are module-scoped (`agents`, `conversations`, `knowledge`, `build`)
  and MUST be lazy-loaded.
- **Forbidden patterns**: No alternate UI frameworks, no alternate state libraries, no
  parallel bundlers, no direct DOM manipulation bypassing Vue reactivity, and no
  cross-layer shortcuts (e.g. a view importing Axios, a component mutating another
  feature's store internals).

**Rationale**: Strict layering and a single HTTP/adapter boundary keep a large federated
codebase predictable and isolate backend contract changes to the `api/` layer.

## III. Componentization

- **Reuse before creation**: Existing components, composables, stores, and adapters MUST be
  reused before new ones are written. New abstractions MUST solve a present, concrete need.
- **Shared vs feature components**: Components used across features live at a shared level;
  feature-specific components live under their feature folder (e.g.
  `components/<Feature>/...`). A feature component MUST NOT be imported by an unrelated
  feature — promote it to a shared location instead.
- **Composition**: Prefer small, single-responsibility components composed via slots and
  props over large monolithic components. Cross-cutting reactive logic MUST live in a
  composable, not be copy-pasted between components.
- **Logic in script, clean template**: Non-trivial conditional or derived logic MUST live in
  `computed`/methods, keeping the template declarative. Prefer `v-if="showTitleWarning"` over
  inline expressions like `v-if="!isLoading && showTitle && showWarning"`.
- **Stable selectors**: Interactive and stateful elements MUST expose `data-testid`
  attributes for testing and automation.
- **TypeScript**: New stores, adapters, composables, and shared types SHOULD be authored in
  TypeScript; existing `.js` modules may remain until intentionally migrated.

**Rationale**: A clear shared/feature boundary and reuse-first discipline prevent
duplication and keep the component tree navigable.

## IV. State & Data Management

- **Pinia is the single state library**. Domain and server state MUST live in Pinia stores
  (one store per domain, e.g. `AgentsTeam`, `Knowledge`, `Supervisor`, `Improvements`).
- **Store style**: New stores SHOULD use the setup-store style (`defineStore('name', () =>
  {...})`) consistent with existing stores, returning reactive state, computed getters, and
  actions.
- **State location**: Local UI state stays in the component; shared cross-component state
  goes in a composable or store; server state is owned by stores via the `api/` layer.
  Components MUST NOT duplicate server state they can derive from a store.
- **Cross-store composition**: Stores compose other stores (e.g. `useProjectStore`,
  `useAlertStore`) rather than reaching into private internals.
- **Async & loading state**: Async actions MUST track their own status (loading / success /
  error) so the UI can render deterministic states; long-running flows (e.g. analysis
  polling) MUST encapsulate their cadence inside the store/composable, not in components.

**Rationale**: Centralizing server state in typed stores behind adapters keeps data flow
one-directional and testable.

## V. UX, Content & Accessibility

- **Three states are mandatory**: Every data-driven surface MUST handle **loading**,
  **empty**, and **error** states explicitly. Empty states MUST be explained (never a blank
  area or a bare "0"); error states MUST offer a retry path and MUST NOT blank/corrupt
  already-loaded data.
- **Global error feedback**: API errors surface through the shared Alert store / interceptor
  pattern; features MUST NOT invent parallel error-toast mechanisms.
- **Internationalization**: All user-facing copy MUST live in locale files (`en.json`,
  `pt_br.json`, `es.json`, `ro.json`) with identical keys, snake_case naming, alphabetical
  ordering per level, and matching interpolation placeholders across all four languages.
  Hardcoded user-facing strings are forbidden.
- **Content standards**: Copy MUST follow the VTEX Content Guide.
- **Semantic HTML**: Structure MUST use semantic elements (`header`, `nav`, `main`,
  `section`, `article`, `aside`, `footer`, and the `h1`–`h6` hierarchy) instead of generic
  `div`/`span` soup when a meaningful tag fits. Each page MUST have exactly one `h1` and a
  logical heading order.
- **Accessibility**: Interactive elements MUST be keyboard-reachable and expose an accessible
  name/label; images MUST carry meaningful `alt` text (empty `alt` only when decorative).
  Prefer `@weni/unnnic-system` components, which carry accessibility built in, over bespoke
  markup.

**Rationale**: Agent Builder ships in four languages to operators who need trustworthy,
accessible, and well-structured interfaces; states, copy, semantics, and a11y are part of
product quality, not polish.

## VI. Design System

- **Unnnic first**: Visual and interaction patterns MUST come from `@weni/unnnic-system`
  before any new primitive is introduced.
- **Tokens over hardcoding**: Colors, spacing, typography, and radii MUST use design-system
  tokens/variables. Hardcoded hex colors and magic spacing values are forbidden when a token
  exists.
- **Styling conventions**: Use scoped styles and existing SCSS conventions (`global.scss`,
  established layout patterns). New components MUST match existing folder, naming, and
  styling conventions.

**Rationale**: A single design system keeps Agents, Knowledge, Supervisor, Preview, and the
federated workspace visually and behaviorally consistent.

## VII. AI & Agent Workflows

- **Product Spec is the single source of truth.** When a feature has a Product Spec / Frontend
  Spec (e.g. `.cursor/fdds/*.frontend-spec.md`), the implementation MUST conform to it.
- **Implementation MUST NOT contradict Product Specs.** Divergence is a defect.
- **Binding decisions MUST be respected.** Clarified decisions and acceptance criteria
  recorded in a spec are binding on the implementation.
- **Divergences require a formal amendment.** If reality requires deviating from a spec or
  this constitution, the spec/constitution MUST be updated first, then the code.
- **Roles**: Engineering defines the **how**; product defines the **what** and **why**.
- **Agent domain consequences**: Agent lifecycle surfaces (create, configure, test/Preview,
  publish, monitor/Supervisor, Improvements/Audit, conversation management) render
  server-computed results. The frontend reflects agent/job/item state and triggers
  transitions; it MUST NOT re-derive backend logic (sampling, gating, scoring, masking).
- **Observability**: Errors MUST continue to be reported to Sentry via the existing
  integration; new flows MUST NOT remove or bypass error capture.

**Rationale**: Agent behavior is product-defined and backend-computed; the frontend's job is
faithful, traceable rendering of that contract.

## VIII. Testing (NON-NEGOTIABLE)

New or changed units (components, composables, Pinia stores) MUST include Vitest tests that
assert **observable behavior**: rendered output, emitted events, store state, and mocked API
calls. Tests MUST:

- Use `data-testid` selectors centralized in an `elements`/getter map; never brittle CSS or
  positional selectors.
- Be deterministic and isolated: no real network, no real timers, fresh Pinia per test,
  `vi.clearAllMocks()` between tests.
- Use project setup from `setupVitest.js` for i18n and global stubs (no ad-hoc `$t` mocks).
- Prefer `shallowMount`; use `mount` only when child/slot/DOM integration is required.
- Aim for 100% behavioral coverage of the unit (inputs, states, branches, events,
  interactions) without snapshotting large trees.

After writing or modifying tests, the relevant Vitest command MUST pass locally. Full rules
live in `.cursor/rules/testing.mdc` and are binding.

**Rationale**: Behavior-first, deterministic tests are the safety net for a large federated
frontend with many interacting stores.

## IX. Code Review Rules

A pull request MUST satisfy all of the following before merge:

1. **Minimal, focused diff** — solves the stated problem with the smallest correct change;
   no speculative abstractions; reuses existing code (DRY).
2. **Layering respected** — no cross-layer shortcuts; HTTP only via `api/`; raw payloads
   adapted before the UI.
3. **States covered** — loading, empty, and error states implemented for new data surfaces.
4. **i18n complete** — every new string exists in all four locale files with matching keys
   and placeholders, following the Content Guide.
5. **Tests present and green** — behavior tests added/updated per Principle VIII; targeted
   Vitest suites pass.
6. **Lint clean** — `npm run lint` passes on touched files; no new ESLint errors.
7. **Design system honored** — Unnnic components and tokens used; no hardcoded styling where
   a token exists.
8. **Federation intact** — `src/exports/*` and shared singletons unchanged unless the spec
   explicitly requires it.
9. **Spec aligned** — changes match the governing Product/Frontend Spec; no unexplained
   constitution violations.
10. **Conventional commits** — commits use `type(scope): description` (feat, fix, docs,
    refactor, test, chore) and stay atomic.

**Rationale**: An explicit, checkable review contract keeps quality uniform across reviewers
and teams.

## X. Quality

- **Readability first**: Optimize for clear, maintainable code over premature performance;
  no dead code, TODOs, placeholders, or commented-out blocks left in merged work.
- **No narrating comments**: Comments explain non-obvious intent or constraints, never
  restate what the code already says.
- **Errors handled, not swallowed**: Failures surface to the user (Alert) and to Sentry;
  silent catches are forbidden.
- **Responsiveness**: Layouts MUST follow existing responsive patterns and stay usable across
  supported breakpoints. (Accessibility lives in Principle V.)

**Rationale**: Sustained quality, not one-off cleverness, keeps the codebase healthy as it
grows.

## Technology Stack Constraints

The following stack is fixed unless amended through governance:

| Area | Requirement |
| --- | --- |
| Runtime | Node.js >= 22.12.0 |
| Framework | Vue 3.5.x (Composition API) |
| Language | TypeScript preferred for new modules; JS legacy allowed |
| State | Pinia 3.x (setup stores) |
| Routing | Vue Router 4.x (module-scoped, lazy-loaded) |
| Bundler | Rspack with Module Federation |
| HTTP | Axios via `httpClientFactory` + `api/` clients/adapters |
| UI | `@weni/unnnic-system` + project components |
| i18n | vue-i18n with ICU message compiler (`en`, `pt_br`, `es`, `ro`) |
| Tests | Vitest 3.x, `@vue/test-utils`, `@pinia/testing` |
| Lint | ESLint with `@weni/eslint-config` |
| Observability | Sentry for Vue (preserve existing integration patterns) |

Forbidden without explicit plan justification: new UI frameworks, alternate state libraries,
parallel bundlers, the Options API, or direct DOM manipulation bypassing Vue reactivity.

## XI. Non-Negotiable Principles

These five principles are absolute and override convenience:

1. **Product Spec is the single source of truth.**
2. **Implementation never contradicts Product Specs.**
3. **Binding decisions must be respected.**
4. **Divergences require a formal amendment** (update the spec/constitution before the code).
5. **Engineering defines the "how"; product defines the "what" and "why".**

Plus the cross-cutting hard rules: behavior-first deterministic tests (Principle VIII), full
four-language i18n with no hardcoded strings (Principle V), and HTTP only through the
`api/` layer (Principle II).

## Development Workflow & Quality Gates

1. **Before planning**: Read `.specify/memory/constitution.md`, the governing Product/Frontend
   Spec, and relevant `.cursor/rules/*.mdc`.
2. **Before implementation**: Pass the Constitution Check in `plan.md`; resolve CRITICAL
   issues from `/speckit-analyze` before `/speckit-implement`.
3. **During implementation**: Run `npm run lint` on touched files; run targeted Vitest suites
   for changed units.
4. **Before merge**: Satisfy every item in Principle IX (Code Review Rules).
5. **Cursor rules**: Domain-specific guidance lives in `.cursor/rules/` (one concern per
   file, kebab-case `.mdc` names) and MUST NOT contradict this constitution.

## Governance

This constitution is the highest-level binding document for AI-assisted and human development
on Agent Builder Webapp. When `.cursor/rules/`, Spec Kit templates, or ad-hoc instructions
conflict with a principle here, this constitution wins unless formally amended. When a Product
Spec conflicts with an implementation, the Product Spec wins (Principle XI).

**Amendment procedure**

1. Propose changes with rationale and impact on active specs/plans.
2. Update `.specify/memory/constitution.md` and bump `CONSTITUTION_VERSION` (semver):
   - MAJOR: remove or redefine a principle, or restructure the principle set.
   - MINOR: add or materially expand a principle/section.
   - PATCH: clarifications only.
3. Propagate required updates to `.specify/templates/*` when gates or mandatory sections change.
4. Record ratification/amendment dates on the version line below.

**Compliance review**

All `/speckit-plan`, `/speckit-analyze`, and code review checkpoints MUST verify alignment
with the Core Principles, Technology Stack Constraints, and the governing Product Spec.
Violations MUST be documented and justified in the plan's Complexity Tracking section, or
resolved before implementation.

**Version**: 1.0.0 | **Ratified**: 2026-06-22 | **Last Amended**: 2026-06-22
