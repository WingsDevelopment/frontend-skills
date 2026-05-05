# Data Fetching Architecture

## 1. Required Structure

Use `Fetch -> Mapper -> UI` with one set of files per query domain:

```text
feature/
└── queries/
    ├── header/
    │   ├── header.fetch.ts
    │   ├── header.mapper.ts
    │   └── header.hook.ts
    └── table/
        ├── table.fetch.ts
        ├── table.mapper.ts
        └── table.hook.ts (only for CSR table flows)
```

Rules:

- each query domain owns its own `*.fetch.ts` / `*.mapper.ts` / `*.hook.ts` (no shared \"god mapper\" across unrelated queries like header + table).
- `*.fetch.ts`: RPC/query calls + cache config only, including source-specific filter application.
- `*.mapper.ts`: business logic, shaping, aggregation, formatting.
- `*.hook.ts`: thin reactive wrapper for UI.

## 2. Query Type Selection

Use `queryConfig.*` presets; never hardcode stale/retry values inline.

| Type                 | staleTime | Use case                            |
| -------------------- | --------- | ----------------------------------- |
| `metaDataQuery`      | `Infinity`| Immutable data (decimals, symbols)  |
| `hookQuery`          | 1 min     | UI-level cache (hooks only)         |
| `walletQuery`        | 1 min     | Wallet data                         |
| `sensitiveQuery`     | 5 min     | Frequently changing data            |
| `semiSensitiveQuery` | 15 min    | Moderately changing data            |
| `lowSensitiveQuery`  | 30 min    | Slow-changing data                  |
| `extensiveQuery`     | 1 hour    | Heavy/expensive calls (has retries) |
| `priceQuery`         | 1 hour    | Price data (has retries)            |

## 3. Function Documentation (Mandatory)

Every function must include a 2-3 line comment describing:

- what it does
- cache/error behavior (where relevant)
- returned shape/intent

Update the comment whenever implementation behavior changes.

## 4. Safe Calls in Mappers

Use `safeCall` for graceful partial failure paths.

```ts
export interface SafeResult<T> {
  data: T | undefined
  error: Error | undefined
}

/**
 * Wraps async execution and converts throw -> { data, error }.
 * Use in mapper paths where partial data is acceptable.
 */
export async function safeCall<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn()
    return { data, error: undefined }
  } catch (error) {
    return { data: undefined, error: error as Error }
  }
}
```

## 5. Fetchers (`*.fetch.ts`)

- No React hooks.
- Use `getQueryClient().fetchQuery(...)`.
- Build query option creators and spread `queryConfig.*`.
- Export cache-backed fetch entrypoints without `*Cached` suffixes.

```ts
export const getTokenBalanceQuery = (token: Address, chainId: number, account: Address) => ({
  ...readContractQueryOptions(getWagmiConfig(), {
    abi: erc20Abi,
    address: token,
    chainId,
    functionName: "balanceOf",
    args: [account],
  }),
  ...queryConfig.sensitiveQuery,
})

/**
 * Fetches token balance for the account.
 * Uses sensitiveQuery cache semantics.
 */
export async function fetchTokenBalance(token: Address, chainId: number, account: Address) {
  return getQueryClient().fetchQuery(getTokenBalanceQuery(token, chainId, account))
}
```

## 6. Mappers (`*.mapper.ts`)

- Plain async functions only.
- Mapper entrypoints should accept a typed `settings` object for execution context (for example `dataSource`, feature flags, mode toggles).
- Mapper entrypoints should accept UI filter params and pass them to fetch; source-specific filtering lives in fetch.
- Prefer early returns for empty/invalid inputs.
- Fetch in parallel with `Promise.all`.
- Validate raw backend/chain field types before using them in calculations.
- Apply all display formatting in mapper layer.
- Keep partial failure robust via `safeCall`.

```ts
/**
 * Fetches and formats balances and total value.
 * Balances are required; prices fail gracefully.
 */
export async function displayBalancesMapper(params: {
  tokens: Address[]
  chainId: number
  account: Address
  settings: {
    includePrices: boolean
  }
}) {
  const { tokens, chainId, account, settings } = params
  if (!tokens?.length) return { balances: [], totalValue: { data: undefined, error: undefined } }

  const [balances, pricesResult] = await Promise.all([
    Promise.all(tokens.map((token) => fetchTokenBalance(token, chainId, account))),
    safeCall(() => fetchTokenPrices(tokens)),
  ])

  // Use settings to control mapper behavior in one place.
  const shouldIncludePrices = settings.includePrices

  // Shape + format here.
  return { balances, pricesResult, shouldIncludePrices }
}
```

### 6.1 Robust Formatting + Diagnostics in Mapper

Use `web3-robust-formatting` as the mapper validation/normalization boundary.

Preferred pattern:

```ts
import {
  robustCalculateTokenValue,
  robustFormatBigIntToViewNumber,
  robustFormatBigIntToViewTokenAmount,
  robustFormatPercentToViewPercent,
  mergeRobustDiagnostics,
} from "web3-robust-formatting"

const totalSupply = robustFormatBigIntToViewTokenAmount({
  context: `${baseContext}.totalSupply`,
  input: {
    bigIntValue: raw.totalSupplyRaw,
    decimals: raw.decimals,
    symbol: raw.symbol,
  },
})

const supplyApy = robustFormatPercentToViewPercent({
  context: `${baseContext}.supplyApy`,
  input: { value: raw.supplyApy },
})

const tokenValueCalc = robustCalculateTokenValue({
  context: `${baseContext}.tokenValue.calculate`,
  input: {
    tokenAmount: raw.totalSupplyRaw,
    tokenPrice: raw.priceRaw,
    tokenDecimals: raw.decimals,
    tokenPriceDecimals: raw.priceDecimals,
  },
})

const totalSupplyUsd = robustFormatBigIntToViewNumber({
  context: `${baseContext}.tokenValue.format`,
  input: {
    bigIntValue: tokenValueCalc.value?.tokenValueRaw,
    decimals: tokenValueCalc.value?.tokenValueDecimals,
    symbol: "$",
  },
})

const diagnostics = mergeRobustDiagnostics(tokenValueCalc, totalSupplyUsd)
```

Rules:

- Prefer robust wrappers over ad-hoc type coercion in mapper logic.
- Do not create mapper-local helper wrappers that only proxy robust formatter calls; invoke robust formatters directly at each mapped field.
- Keep diagnostics (`warnings`, `errors`) and pass them through mapper output.
- Keep required-field/invalid-input handling inside robust outputs, not UI code.

## 7. Hooks (`*.hook.ts`)

- Keep hooks dumb: `useQuery` wrapper only.
- `queryFn` should call mapper.
- `enabled` gate should be explicit.
- Always spread `...queryConfig.hookQuery`.

```ts
/**
 * Reactive wrapper for displayBalancesMapper.
 * Returns preformatted UI-ready data.
 */
export function useDisplayBalances(tokens?: Address[], chainId?: number, account?: Address) {
  return useQuery({
    queryKey: ["displayBalances", chainId, tokens, account] as const,
    queryFn: () => displayBalancesMapper({ tokens: tokens!, chainId: chainId!, account: account! }),
    enabled: Boolean(tokens?.length && chainId && account),
    ...queryConfig.hookQuery,
  })
}
```

## 8. Formatting Rules

Use `web3-robust-formatting` in mappers and render via `web3-display-components` wrappers in UI.
In app UI code, consume values through local wrappers from `@/app/components/display-values`.

Format in mapper layer using `web3-robust-formatting` formatters:

- `robustFormatBigIntToViewTokenAmount`
- `robustFormatBigIntToViewNumber`
- `robustFormatNumberToViewNumber`
- `robustFormatPercentToViewPercent`

Never pass raw numeric domain values to UI display components.
Pass mapper outputs (including query state + robust diagnostics) directly into app display wrappers from `@/app/components/display-values`.

## 9. Error and UI State Handling

- Build parent flows to handle both full and partial failures.
- Pass query state (`isLoading`, `isPending`, `isError`, `error`) to display components in UI layer.
- Keep systems resilient: fail gracefully where possible, fail loudly where required.

## 10. Checklist

- Fetchers cached via `queryConfig.*`.
- Mappers use `Promise.all` and `safeCall` where needed.
- Hooks are thin wrappers with `...queryConfig.hookQuery`.
- Mapper output is preformatted via `web3-robust-formatting` for UI.
- UI renders formatted/query-backed values through `web3-display-components`.
- All functions have updated 2-3 line comments.
- Error paths are explicit and tested by design.
