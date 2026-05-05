# Tables Migration Reference

Use this reference for legacy-to-new table migrations.

## 1. Rendering Mode Gate

Before any implementation, table rendering mode must be explicit:

- `CSR`: table component fetches/updates data on the client.
- `SSR`: page/server component fetches initial data; client components handle interactive state.

If unspecified, ask one blocking question and wait:

`Should this table migration be client-side rendering (CSR) or server-side rendering (SSR)?`

## 2. URL State With `nuqs`

Use `nuqs` for URL-driven table state:

- search query
- filters
- sort key + direction
- pagination
- tab/segment state tied to the table

Rules:

- use `useQueryState` / `useQueryStates` in client components
- keep history mode explicit (`replace` unless product needs navigation history)
- provide stable defaults through parser `.withDefault(...)`

## 3. Filter Ownership

Filtering behavior belongs to fetch layer and is source-specific:

- mapper/hook pass filter params as typed objects
- fetch applies filters differently by source
  - mock source: filter in JavaScript
  - backend source: pass filters to backend and rely on backend results

Do not keep final filtering in table render components.

## 4. Table State Contract

Table state should be explicit and mutually exclusive:

- loading: show deterministic placeholders
- error: show table-level error state
- success: show table rows/cards
- empty: show empty state message

When query state is error, never render stale row list as primary content.

## 5. Error-State Pattern

```tsx
const isError = Boolean(queryState?.isError)
const errorMessage =
  typeof queryState?.errorMessage === "string"
    ? queryState.errorMessage
    : queryState?.error instanceof Error
    ? queryState.error.message
    : "Failed to load table data."

return isError ? (
  <div className="rounded-2xl border border-red-700 bg-red-700/10 p-4">
    <Typography variant="subtitle3" className="font-semibold text-red-700">
      Failed to load data
    </Typography>
    <Typography variant="body2" color="secondary">
      {errorMessage}
    </Typography>
  </div>
) : (
  <TableRows rows={rows} />
)
```

## 6. Migration Checklist

- parity map completed from legacy source
- CSR/SSR mode explicitly confirmed
- URL table state moved to `nuqs`
- source-aware filtering handled in fetch
- mapper formatting uses `web3-robust-formatting`
- UI uses app display wrappers from `@/app/components/display-values`
- Playwright visual checks executed
