### Available skills

- `ui-components`: App-specific UI component architecture and styling conventions for this repository.
  - file: `skills/ui-components/SKILL.md`
- `ui-page-migration`: Workflow for migrating legacy pages/components to the new app with screenshot parity, exact layout/typography/icon/tooltip matching, and persistent visual-regression checks.
  - file: `skills/ui-page-migration/SKILL.md`
- `cell-migration`: Reusable workflow for migrating legacy cells with parity and capturing only generic rules for future migrations.
  - file: `skills/cell-migration/SKILL.md`
- `ui-tables-migration`: Workflow for migrating legacy tables with parity, nuqs URL filter state, and fetch-layer filtering by source.
  - file: `skills/ui-tables-migration/SKILL.md`
- `web3-display-components`: Display-layer patterns for `DisplayValue` token/value/percentage rendering, robust wrappers, and resolver helpers.
  - file: `skills/web3-display-components/SKILL.md`
- `web3-robust-formatting`: Formatting/normalization patterns for safe numeric/percent/token pipelines with diagnostics.
  - file: `skills/web3-robust-formatting/SKILL.md`
- `react-compiler-practices`: React/Next rules for React Compiler projects, with default no-manual-memoization (`useMemo`/`useCallback`/`React.memo`) unless explicitly justified.
  - file: `skills/react-compiler-practices/SKILL.md`
- `data-fetching-best-practice`: Fetch/mapper/hook model architecture, queryConfig cache rules, safeCall usage, mapper-level formatting, and robust loading/error handling.
  - file: `skills/data-fetching-best-practice/SKILL.md`
- `legacy-mock-playwright`: Mock-first legacy rebuild workflow with Playwright coverage, fetch-only options-driven source switching, and source-agnostic mapper/hook boundaries.
  - file: `skills/legacy-mock-playwright/SKILL.md`
- `ui-forms-best-practice`: Provider-first forms workflow for amount/slider forms with debounced shared state, mock-first migration, and Playwright parity checks.
  - file: `skills/ui-forms-best-practice/SKILL.md`

### How to use skills

- Trigger when the skill name is mentioned in a prompt, or when the request clearly matches the skill description.
- For React/Next component and page tasks, also trigger `react-compiler-practices` by default.
- For model/fetch/query/hook/data-shaping tasks, also trigger `data-fetching-best-practice` by default.
- For table migration tasks, also trigger `ui-tables-migration`; confirm CSR vs SSR before implementation when rendering mode is not specified.
- For display rendering and numeric/percent formatting tasks, trigger both `web3-display-components` and `web3-robust-formatting`.
- For legacy rebuild tasks that require deterministic Playwright snapshots on mocked data, also trigger `legacy-mock-playwright`.
- For form tasks (especially amount + slider + summary flows), also trigger `ui-forms-best-practice`.
- Read the skill's `SKILL.md` first, then only the specific referenced files needed for the task.
- Prefer reusing assets/templates/scripts referenced by the skill instead of recreating from scratch.

<!-- web3-display-components-codex-skill:start -->
## Codex Skill Routing (web3-display-components)
- Use `web3-display-components` skill for display-layer tasks: `DisplayValue`, token/value/percentage renderers, robust display wrappers, and `resolveDisplayErrorState` integration.
- Use `web3-robust-formatting` skill for formatting/normalization tasks and then pass robust outputs into these components.
- If asked to initialize wrapper/field components, run `node skills/web3-display-components/scripts/init-display-fields.mjs --target <path>` and scaffold the full folder.
<!-- web3-display-components-codex-skill:end -->

<!-- web3-robust-formatting-codex-skill:start -->
## Codex Skill Routing (web3-robust-formatting)
- Use `web3-robust-formatting` skill for formatting, normalization, robust wrappers, diagnostics helpers, and token value calculations.
- Use `web3-display-components` skill for display rendering and robust display wrappers that consume these outputs.
<!-- web3-robust-formatting-codex-skill:end -->

<!-- legacy-mock-playwright-codex-skill:start -->
## Codex Skill Routing (legacy-mock-playwright)
- Use `legacy-mock-playwright` for mock-first legacy rebuilds that must keep Playwright tests running on deterministic mocked data.
- Keep source switching in `*.fetch.ts` only via typed options/settings (with env fallback in fetch); do not leak source/test mode into mapper or hook layers.
- Enforce production safety: never allow mock source resolution when `NODE_ENV=production`, even if env flags/options request mock.
- Pair this skill with `data-fetching-best-practice` for Fetch -> Mapper -> Hook layering, queryConfig usage, and mapper-level formatting.
<!-- legacy-mock-playwright-codex-skill:end -->

<!-- ui-forms-best-practice-codex-skill:start -->
## Codex Skill Routing (ui-forms-best-practice)
- Use `ui-forms-best-practice` for form migrations/new builds with amount input + slider + summary flows.
- Require form-scoped providers/context where provider state is canonical debounced values only.
- Keep debounce logic in input/slider wrappers (library/helper-based), not in provider `useEffect` timer flows.
- Pair with `ui-page-migration` for screenshot parity, `legacy-mock-playwright` for mock-first fetch behavior, and `data-fetching-best-practice` for fetch/mapper/hook architecture.
- In app UI files, render values through local wrappers from `@/app/components/display-values`.
<!-- ui-forms-best-practice-codex-skill:end -->

<!-- ui-tables-migration-codex-skill:start -->
## Codex Skill Routing (ui-tables-migration)
- Use `ui-tables-migration` for legacy/new table migration tasks with strict parity and deterministic states.
- Confirm table rendering mode (CSR vs SSR) before implementing if the user did not specify it.
- Use `nuqs` for URL-backed table filter/search/sort/pagination state.
- Keep source-specific filtering in fetch layer (mock filtering in JS, backend filtering via API params), not in table render components.
<!-- ui-tables-migration-codex-skill:end -->

<!-- cell-migration-codex-skill:start -->
## Codex Skill Routing (cell-migration)
- Use `cell-migration` when migrating legacy cells/components into the new app and you need a repeatable parity workflow.
- Update skill guidance with generic conventions discovered during migrations; keep one-off cell specifics out of shared rules.
- Pair with `react-compiler-practices` and `ui-components` for UI implementation, and `data-fetching-best-practice` when model-layer changes are required.
<!-- cell-migration-codex-skill:end -->
