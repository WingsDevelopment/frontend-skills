---
name: ui-tables-migration
description: Workflow for migrating legacy tables into the new app with parity, URL filter state, and robust loading/error behavior.
---

# UI Tables Migration

1. Read `references/tables-migration.md` before coding.
2. Before implementation, confirm rendering mode:
   - if the request does not explicitly say table rendering mode, ask: `Should this table migration be client-side rendering (CSR) or server-side rendering (SSR)?`
   - do not start implementation until this is confirmed.
3. Pair this skill with:
   - `ui-page-migration` for parity checks and visual workflow
   - `ui-components` for local component architecture
   - `react-compiler-practices` for React rules
   - `data-fetching-best-practice` for fetch/mapper/hook layering
4. Keep URL filter/search/sort/pagination state in `nuqs`.
5. Keep table filtering source-aware in fetch layer:
   - mapper/hook can pass filter params through
   - fetch applies filtering per source (mock: JS filtering, backend: pass filter params to API)
6. Table states are non-negotiable:
   - loading: render deterministic skeleton rows/placeholders
   - error: render a table-level error state instead of data rows/cards
   - success: render data rows/cards only
7. Keep display formatting in mapper using `web3-robust-formatting` and render via app wrappers from `@/app/components/display-values`.
8. Run Playwright visual tests on meaningful changes and inspect artifacts before closing.
