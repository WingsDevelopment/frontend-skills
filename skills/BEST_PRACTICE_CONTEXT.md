# Frontend Codex Best-Practice Context

This document consolidates standards from all folders in:

- `skills/*`

Use this as the default engineering context for migrations, new feature work, and reviews.

## 1. Cross-Cutting Principles

- Preserve parity first, optimize second.
- Keep architecture layered and explicit.
- Keep formatting in model/mapper layers, never inline in JSX.
- Keep UI rendering declarative and thin.
- Keep query state and diagnostics intact end-to-end.
- Prefer composition over mode flags.
- Use theme tokens and semantic styles, not hardcoded visual literals.
- Treat visual parity, runtime correctness, and testability as non-negotiable.

## 2. Canonical Layering

### 2.1 Data Flow Contract

- Required shape: `Fetch -> Mapper -> Hook -> UI`.
- One query domain per `*.fetch.ts`, `*.mapper.ts`, `*.hook.ts` group.
- No god mappers spanning unrelated domains.

### 2.2 Fetch Layer (`*.fetch.ts`)

- Owns RPC/API calls, cache usage, and source-specific filtering.
- Uses `getQueryClient().fetchQuery(...)` and `queryConfig.*`.
- No React hooks in fetchers.
- Export cache-backed entrypoints without `*Cached` suffixes.
- Source switching (`mock` vs `real`) lives only here.

### 2.3 Mapper Layer (`*.mapper.ts`)

- Plain async functions only.
- Owns validation, shaping, aggregation, and all display formatting.
- Use early returns and `Promise.all` for predictable flows.
- Use `safeCall` for partial-failure paths.
- Accept typed `settings` object when mapper behavior needs runtime configuration.
- Keep mapper source-agnostic (no env/mock branching).

### 2.4 Hook Layer (`*.hook.ts`)

- Thin `useQuery` wrapper only.
- `enabled` gates should prevent invalid query execution.
- Spread `...queryConfig.hookQuery`.
- No business logic, no source selection, no mock/env checks.

### 2.5 UI Layer

- Renders formatted values and query state only.
- No data normalization/formatting in render functions.
- Pass query state by direct spread from source object (`...query`, `...position`).

## 3. Robust Formatting + Display Contract

### 3.1 Formatting Rules (`web3-robust-formatting`)

- Use robust wrappers at mapper/mock boundaries:
  - `robustFormatBigIntToViewTokenAmount`
  - `robustFormatBigIntToViewNumber`
  - `robustFormatNumberToViewNumber`
  - `robustFormatPercentToViewPercent`
  - `robustCalculateTokenValue`
- Preserve `warnings` and `errors`; do not strip diagnostics.
- Use `mergeRobustDiagnostics` for multi-step pipelines.
- Do not introduce thin proxy helpers around robust formatters.
- Keep `context` strings field-specific and traceable.

### 3.2 Display Rules (`web3-display-components`)

- In app UI files, import wrappers from:
  - `@/app/components/display-values`
- Do not import display components directly from `web3-display-components` in app UI files.
- Keep value + symbol/unit in one display component.
- Let display wrappers own loading/error/empty behavior.
- Use robust wrappers when payload includes `{ value, warnings, errors }`.

### 3.3 Query + Diagnostics Propagation

- Spread query state directly into display wrappers.
- Spread formatted robust payloads directly (`{...row?.field}`).
- Keep fixed labels/static copy outside query-state spread.

## 4. React + UI Composition Standards

### 4.1 React Compiler Policy

- Default: do not add `useMemo`, `useCallback`, or `React.memo`.
- Use straightforward render logic; rely on React Compiler.
- Add manual memoization only with explicit rationale and measured need.

### 4.2 Component Placement

- Shared app components: `app/components/`.
- Shared layout components: `app/components/layout/`.
- Generic primitives: `libs/ui/components/`.
- Route-specific components: `app/(pages)/<route>/components/`.

### 4.3 Styling and Markup

- Use CVA object variants for repeated style groups.
- Use canonical Tailwind tokens and selectors.
- Avoid coupled "mode flag" APIs for variant behavior.
- Always use `Typography` for text styling.
- Hydration safety:
  - if `Typography` children include block elements, set `as="div"`.
- Button links must use `Button` with `render={<Link />}`.
- `TooltipTrigger` child must be a single ref-forwarding React element.

### 4.4 Fixed Schema UI

- For known field sets, use explicit JSX slots.
- Do not use generic `metrics.map(...)` + `kind` switching for fixed schemas.

## 5. Migration Workflows

### 5.1 Page Migration

- Build a parity map before coding:
  - layout shells and spacing constants
  - exact copy/casing
  - typography variants
  - icon identity
  - semantic element types
  - tooltip/popover interaction model and content
- Source implementation is primary; screenshot is secondary.
- Reuse legacy icon/tooltip sources where possible.
- Run visual tests on meaningful passes and inspect artifacts.

### 5.2 Cell Migration

- Deliver both:
  - parity-correct migrated cell
  - updated generic rule ledger
- Validate theme compatibility under default and alternate scopes.
- Use token-driven styling (`theme/common/page` split).
- Build variants via composition wrappers, not mode flags.
- Add mocked stories per migrated cell with variant/theme coverage.
- Record only reusable conventions in `generic-rules.md`.

### 5.3 Table Migration

- Confirm rendering mode before implementation:
  - `CSR` or `SSR` (blocking gate if unspecified)
- Keep search/filter/sort/pagination URL state in `nuqs`.
- Filtering logic belongs in fetch layer (source-aware).
- Enforce mutually exclusive table states:
  - loading, error, success, empty
- Use deterministic loading placeholders and table-level error UI.

### 5.4 Form Migration

- Each form has form-scoped provider/context.
- Provider stores only debounced canonical values.
- Immediate input/slider state stays in field wrappers.
- Debounce in wrappers using a debounce helper/library.
- Summary components consume provider debounced values only.
- Query keys include those debounced provider values.
- Keep forms isolated; share only truly generic utilities.

## 6. Mock-First + Playwright Contract

- Mock/real source switching is fetch-only.
- Use typed fetch options:
  - `source: "mock" | "real" | "auto"`
- `auto` resolves env flag only in fetch layer.
- In production (`NODE_ENV=production`), mock source resolution must throw.
- Mock and real fetchers must return the same raw interface.
- Playwright uses deterministic mocks via `webServer.env`.
- Mapper/hook/UI must remain unaware of mock/test mode.

## 7. Theme + Design-System Rules

- Theme compatibility is required for migrated UI.
- Use semantic theme tokens for color/border/radius/spacing.
- Avoid hardcoded visual literals where token equivalents exist.
- Keep reusable tokens in per-theme `common.css`.
- Keep page-only layout tokens in page-specific theme files.

## 8. Required Quality Gates

- Type/build/runtime correctness (no overlay/hydration issues).
- State coverage:
  - loading
  - error
  - empty
  - success
- Visual regression checks on meaningful changes.
- Story coverage for migrated cells/components where required.
- Function doc comments (2-3 lines) for model-layer functions.

## 9. Common Anti-Patterns (Reject by Default)

- Inline formatter calls in JSX.
- Source/mock/env branching in mapper/hook/UI layers.
- Manual query-state remapping helper objects before render.
- Using direct package display imports in app UI.
- Coupled variant flags (`asCompact`, `asPageHeader`) instead of composition.
- Hardcoded visual values when semantic tokens exist.
- Replacing semantic interactive elements with non-interactive tags.
- Introducing unnecessary `useMemo`/`useCallback`/`React.memo`.
- Moving fixed labels/presentation-only styles into fetched data.

## 10. Default Task Checklist

Before closing implementation/review:

- Architecture follows `Fetch -> Mapper -> Hook -> UI`.
- Fetch owns source selection/filtering and cache usage.
- Mapper owns validation + robust formatting + diagnostics.
- Hook is thin and enabled-gated.
- UI uses local display wrappers with direct query-state spread.
- React code is compiler-friendly without unnecessary memoization.
- Styling and component placement follow repo conventions.
- Migration parity (layout/text/icon/interaction) is validated.
- Playwright/visual artifacts inspected where applicable.
