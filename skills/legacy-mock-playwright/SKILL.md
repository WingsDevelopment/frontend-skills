---
name: legacy-mock-playwright
description: Mock-first model-layer workflow for legacy rebuilds in this repo. Use when migrating/rebuilding features that must run Playwright on deterministic mock data now while keeping a clean replacement path for real backend data later. Enforce data-source switching in `*.fetch.ts` only (options-driven source selection); keep `*.mapper.ts` and `*.hook.ts` unaware of mock mode; pair with `data-fetching-best-practice`.
---

# Legacy Mock Playwright

1. Read `references/mock-source-switching.md` before implementing `model.fetch.ts`, `model.mapper.ts`, or `model.hook.ts`.
2. Always pair this skill with `data-fetching-best-practice`.
3. Keep source switching in fetch layer only:
   - accept a typed `options`/`settings` object in fetch entrypoints
   - accept filter params in mapper/hook-facing entrypoints and apply filtering in fetch per source
   - support explicit source selection (for example `options.source: "mock" | "real" | "auto"`)
   - when source is `auto`, resolve environment boolean (for example `FRONTEND_APP_USE_MOCKS`) only inside `*.fetch.ts`
   - branch `mock` vs `real` calls only in `*.fetch.ts`
   - enforce production guardrails: if `NODE_ENV === "production"`, never allow mock source resolution
4. Keep mapper and hook source-agnostic:
   - mapper validates, shapes, and formats; no environment/source checks
   - hook is a thin `useQuery` wrapper; no mock/test branching
   - never add `useMocks`, `isPlaywright`, or env checks to mapper/hook signatures
   - do not redefine mapper/hook architecture here; follow `data-fetching-best-practice` directly
5. Keep fetch contracts stable:
   - mock and real fetchers return the same raw type/interface
   - mapper logic should not change when switching source
6. Make Playwright deterministic:
   - set mock boolean in Playwright `webServer.env` and call normal fetch entrypoints without passing `source: "auto"`
   - pass `source` only when you need an explicit override (`"mock"` or `"real"`)
   - run visual tests on stable, versioned mock payloads
7. Protect production strictly:
   - if runtime is production and either `options.source` requests `"mock"` or env would resolve to mock, throw a configuration error in fetch layer
   - do not silently fall back to mock in production
8. Keep replacement path simple:
   - swap real fetch implementation when backend is ready
   - retain mock fetch path for Playwright regression coverage
9. Reject implementations that leak mock/test concerns outside fetch layer.
