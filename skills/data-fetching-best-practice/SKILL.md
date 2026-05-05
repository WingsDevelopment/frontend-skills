---
name: data-fetching-best-practice
description: Fetch/mapper/hook architecture for data access in this repo. Use for any feature model work (`*.fetch.ts`, `*.mapper.ts`, `*.hook.ts`), query caching decisions, formatting pipelines, and loading/error handling patterns.
---

# Data Fetching Best Practice

1. Read `references/data-fetching.md` before implementing model-layer code.
2. Use the required architecture: `Fetch -> Mapper -> UI` with one fetch/mapper/hook set per query domain.
   - Example: `feature/queries/header/header.fetch.ts` + `header.mapper.ts` + `header.hook.ts` and `feature/queries/table/table.fetch.ts` + `table.mapper.ts` (+ hook only if table is client-driven).
3. Keep fetchers hook-free and cache-driven (`queryClient.fetchQuery` + `queryConfig.*` spreads).
4. Keep mappers as plain async functions with early returns, `Promise.all`, and `safeCall` for partial-failure paths.
5. Validate and normalize raw backend/chain fields in mappers using `web3-robust-formatting` robust wrappers/diagnostics before formatting or calculations.
6. Do not add thin wrapper helpers around robust formatter calls (for example `mapCurrencyViewNumber`); call robust formatters directly at each mapped field.
7. Keep hooks thin (`useQuery`, `enabled`, `queryKey`, `...queryConfig.hookQuery`) and no business logic.
   - Hooks must not `throw` for missing params inside `queryFn`; gate with `enabled` and typed mapper contracts.
   - If input debouncing is needed for form-driven queries, debounce before calling the hook (provider/field state), not inside hooks.
8. Format all display values in mapper layer using `web3-robust-formatting`; do not pass raw values to UI.
9. Require function doc comments (2-3 lines minimum) for every function; update comments whenever behavior changes.
10. Ensure robust error handling in parent-level flows and by passing query state to app display wrappers from `@/app/components/display-values` for loading/error/success UX.
11. Pair with `web3-display-components` for wrapper contracts, `web3-robust-formatting` for formatter/diagnostic pipelines, and `react-compiler-practices` for hook/memoization decisions.
12. For mapper entrypoints, accept a typed `settings` object (for example feature flags or mode switches) when mapper behavior itself needs runtime configuration.
13. Keep fetch entrypoint naming stable: exported fetchers should be cache-backed and should not use `*Cached` suffixes.
