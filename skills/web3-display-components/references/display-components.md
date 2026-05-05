# Display Components Reference

Use this reference for display-layer rendering with `web3-display-components`.

## Core Rules

- In app UI code, import from `@/app/components/display-values`.
- Keep rendering concerns in UI; keep formatting in mapper/mock (`web3-robust-formatting`).
- Spread query state directly from source responses (`...query`, `...position`), not remapped helper objects.
- Keep numeric value and symbol/unit in one display component.

## Wrapper Selection

- `DisplayValue`: general text/value display.
- `DisplayTokenAmount`: token amount values.
- `DisplayTokenValue`: fiat/value numbers (for example with `$`).
- `DisplayPercentage`: percentage values.

When robust outputs are available (`value`, `warnings`, `errors`), use wrappers that integrate `resolveDisplayErrorState`.

## Recommended Pattern

```tsx
import { DisplayPercentage, DisplayTokenValue } from "@/app/components/display-values"

<DisplayTokenValue {...position} {...position.data?.netAssetValue} />
<DisplayPercentage {...position} {...position.data?.yourRoe} />
```

## Query State Rules

- Pass `isLoading`, `isPending`, `isError`, and `error` directly to display wrappers.
- Keep fixed labels/static copy outside query-state spread.
- Let wrappers handle loading skeletons and error icons/tooltips.

## Scaffold Workflow

When asked to initialize local wrappers/fields, run:

```bash
node skills/web3-display-components/scripts/init-display-fields.mjs --target <path>
```

Use `--force` only when explicitly replacing existing files.

## Anti-Patterns

- Importing directly from `web3-display-components` in app UI files.
- Formatting values inline during render.
- Appending unit text as separate elements instead of formatter symbol output.
- Hiding warnings/errors from robust outputs before rendering.
