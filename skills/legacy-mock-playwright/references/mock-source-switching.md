# Mock Source Switching

## Goal

Use deterministic mock data during legacy rebuilds while keeping the model architecture aligned with `data-fetching-best-practice`.

This reference is intentionally fetch-focused. Do not redefine mapper/hook workflow here; follow:

- `./../../data-fetching-best-practice/SKILL.md`
- `./../../data-fetching-best-practice/references/data-fetching.md`

## Layer Ownership

- `model.fetch.ts`
  - Own source selection (`mock` vs `real`)
  - Own environment boolean resolution
  - Own options-based source override
  - Own source-specific filtering behavior (mock-side JS filtering vs backend filter params)
  - Return one stable raw contract
- `model.mapper.ts`
  - Own validation, shaping, formatting via `web3-robust-formatting`
  - Own partial-failure handling (`safeCall`) as defined by `data-fetching-best-practice`
  - Do not read environment or test booleans
- `model.hook.ts`
  - Own thin `useQuery` wrapper with `queryConfig.hookQuery`
  - Do not branch on mock/test mode

## Source Options Contract (Fetch Only)

Use a typed options object in fetch functions:

```ts
export type FetchSource = "mock" | "real" | "auto"

export interface FetchSourceOptions {
  source?: FetchSource
}
```

Rules:

- `source: "mock"` -> always mock fetcher
- `source: "real"` -> always real fetcher
- `source: "auto"` (default) -> resolve via env boolean in fetch layer
- callers should omit `options.source` for normal flows; default auto resolution is the baseline behavior
- if runtime is production, mock must be rejected even when requested by source/env
- do not expose this options object in mapper/hook public signatures

## Playwright Wiring

Inject mock mode through Playwright env and call standard fetch entrypoints (no explicit `source` needed):

```ts
// test/visual/playwright.config.ts
webServer: {
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
    FRONTEND_APP_USE_MOCKS: "1",
  },
}
```

## Fetch Pattern (Options + Env Resolution)

```ts
// feature/model/model.fetch.ts
import { getQueryClient } from "@/app/model/query-client"
import { queryConfig } from "@/app/model/query-config"

export type FetchSource = "mock" | "real" | "auto"
export interface FetchSourceOptions {
  source?: FetchSource
}

const isMockEnvEnabled = () => process.env.FRONTEND_APP_USE_MOCKS === "1"
const isProductionRuntime = () => process.env.NODE_ENV === "production"

function parseFetchSource(input?: FetchSource): FetchSource {
  if (!input) return "auto"
  if (input === "mock" || input === "real" || input === "auto") return input
  throw new Error(`[model.fetch] Unsupported source option: ${String(input)}`)
}

function resolveFetchSource(options?: FetchSourceOptions): "mock" | "real" {
  const requestedSource = parseFetchSource(options?.source)
  const resolvedSource =
    requestedSource === "auto" ? (isMockEnvEnabled() ? "mock" : "real") : requestedSource

  if (isProductionRuntime() && resolvedSource === "mock") {
    throw new Error(
      "[model.fetch] Mock source is forbidden in production. Check NODE_ENV, FRONTEND_APP_USE_MOCKS, and source options.",
    )
  }

  return resolvedSource
}

export interface FeatureRaw {
  items: Array<{ id: string; valueRaw: string }>
}

async function fetchFeatureMock(params: { account: string }): Promise<FeatureRaw> {
  // Deterministic fixture payload used by visual tests
  return { items: [{ id: "mock-1", valueRaw: "1000000" }] }
}

async function fetchFeatureReal(params: { account: string }): Promise<FeatureRaw> {
  // Real API/onchain call (replace when backend is ready)
  return { items: [] }
}

/**
 * Resolves source and fetches raw payload without cache.
 * Keep internal so exported fetch stays cache-backed.
 */
async function fetchFeatureRawUncached(
  params: { account: string },
  options?: FetchSourceOptions,
) {
  const source = resolveFetchSource(options)
  return source === "mock" ? fetchFeatureMock(params) : fetchFeatureReal(params)
}

export const getFeatureRawQuery = (
  params: { account: string },
  options?: FetchSourceOptions,
) => {
  const source = resolveFetchSource(options)

  return {
    queryKey: ["featureRaw", params.account, source] as const,
    queryFn: () => fetchFeatureRawUncached(params, { source }),
    ...queryConfig.sensitiveQuery,
  }
}

/**
 * Fetches raw payload via query client cache.
 * Mapper and hook remain source-agnostic.
 */
export async function fetchFeatureRaw(
  params: { account: string },
  options?: FetchSourceOptions,
) {
  return getQueryClient().fetchQuery(getFeatureRawQuery(params, options))
}
```

## Anti-Patterns

- Reading `process.env` in `model.mapper.ts` or `model.hook.ts`
- Adding `useMocks` / `isPlaywright` to mapper/hook public params
- Returning different raw shapes for mock vs real fetch paths
- Formatting numeric display values in fetch instead of mapper
- Making Playwright depend on live backend responses
- Allowing production (`NODE_ENV=production`) to resolve mock source via env or options

## Review Checklist

- Fetch layer contains the only source switch.
- Fetch functions accept typed `options`/`settings` for source selection.
- Production runtime rejects mock source resolution from both env and options.
- Mapper/hook contain zero mock/test knowledge.
- Mock/real fetchers share one raw interface.
- Playwright config injects mock boolean in `webServer.env`.
- Mapper formatting follows `web3-robust-formatting` rules from `data-fetching-best-practice`.
