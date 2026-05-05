---
name: web3-display-components
description: Display-layer rendering patterns for token/value/percentage fields and robust error-state wrappers.
---

# web3-display-components

1. Read `references/display-components.md` before editing display-layer UI.
2. Pair this skill with `web3-robust-formatting` for mapper/mock formatting.
3. In app UI files, import wrappers from `@/app/components/display-values`.
4. Keep rendering concerns here; keep normalization/formatting in mapper/fetch layers.
5. Use `scripts/init-display-fields.mjs` when asked to scaffold wrapper components.

Use this skill when integrating or refactoring UI rendering with `web3-display-components`.

## Scope

This skill covers display-layer usage only:

- `DisplayValue`
- `DisplayTokenAmount`
- `DisplayTokenValue`
- `DisplayPercentage`
- robust wrappers in `components/robust`

Formatting and runtime normalization should be handled by `web3-robust-formatting`.

## Install

```bash
npm install web3-display-components
```

Recommended pair:

```bash
npm install web3-robust-formatting
```

## Wrapper Scaffold (Display Fields)

Use the built-in scaffold script when the user asks to initialize wrapper components/fields:

```bash
node skills/web3-display-components/scripts/init-display-fields.mjs --target src/app/components/display-fields
```

Notes:

- Default target is `src/app/components/display-fields` if `--target` is omitted.
- Use `--force` to overwrite existing files.
- The scaffold writes: `DisplayValue.tsx`, `DisplayText.tsx`, `DisplayPercentage.tsx`, `DisplayTokenAmount.tsx`, `DisplayTokenValue.tsx`, and `index.ts`.
- Generated wrappers type against `web3-robust-formatting` (`ViewPercent`, `ViewNumber`, `ViewBigInt`), so keep that package installed.
- Generated wrappers use flat props: `DisplayValueProps` plus top-level `value`, `warnings`, `errors`.

Prompt examples that should trigger this workflow:

- `Initialize web3-display-components wrapper components.`
- `Create display-fields folder for web3-display-components in src/app/components/display-fields.`
- `Scaffold DisplayPercentageField/DisplayTokenAmountField/DisplayTokenValueField wrappers.`

## Core intent

- Keep rendering concerns separate from formatting concerns.
- Render values consistently across loading, empty, warning, and error states.
- Prefer robust wrappers when upstream data includes diagnostics.

## Component selection

- `DisplayValue`
  - Base renderer for value + symbol + indicator + loading/error/empty behavior.
- `DisplayTokenAmount`
  - Token amount presentation (`symbolPosition="after"` default).
- `DisplayTokenValue`
  - Fiat/token value presentation (`symbol="$"`, `symbolPosition="before"` default).
- `DisplayPercentage`
  - Percentage presentation (`symbol="%"`, `symbolPosition="after"` default).

## Robust wrappers

Use robust wrappers when your data shape includes `{ value, warnings, errors }`:

- `DisplayValueRobust`
- `DisplayTokenAmountRobust`
- `DisplayTokenValueRobust`
- `DisplayPercentRobust`

Aliases also exported for compatibility:

- `DisplayValueField`
- `DisplayTokenAmountField`, `DisplayTokenAmountValue`
- `DisplayTokenValueField`, `DisplayTokenValueValue`
- `DisplayPercentValue`, `DisplayPercentageRobust`, `DisplayPercentageValue`

## Robust error resolution behavior

Use `resolveDisplayErrorState` when you need explicit control:

- resolves severity: `none | warning | error`
- returns injected DisplayValue error props:
  - `isError`
  - `displayErrorAndValue`
  - `error`
  - `errorMessage`

Use `resolvePropertyDisplayProps` to map robust `property.value` into display props.

## Best Practice Examples from blog-examples

Reference implementation files from `web3-libs/blog-examples`:

- `src/app/mock-vaults/components/VaultRow.tsx`
- `src/app/components/display-fields/DisplayValue.tsx`
- `src/app/components/display-fields/DisplayText.tsx`
- `src/app/components/display-fields/DisplayPercentage.tsx`
- `src/app/components/display-fields/DisplayTokenAmount.tsx`
- `src/app/components/display-fields/DisplayTokenValue.tsx`

### 1) Simple text rendering (name, chain, note)

```tsx
<DisplayText
  value={row?.name}
  {...queryState}
  valueClassName="text-sm font-semibold text-slate-100"
  skeletonWidth={176}
/>

<DisplayText
  value={row?.chain}
  {...queryState}
  valueClassName="text-xs text-slate-400"
  skeletonWidth={80}
/>

<DisplayText
  value={row?.note}
  {...queryState}
  valueClassName="text-xs leading-snug text-slate-500"
  skeletonWidth={288}
/>
```

### 2) Percentage rendering (APY, utilization)

```tsx
<DisplayPercentageField
  {...row?.supplyApy}
  {...row?.supplyApyQueryState}
  {...queryState}
  symbolClassName="text-slate-300"
/>

<DisplayPercentageField
  {...row?.utilization}
  {...row?.utilizationQueryState}
  {...queryState}
  symbolClassName="text-slate-300"
/>
```

### 3) Token amount + token value in one cell

```tsx
<div className="space-y-1">
  <DisplayTokenAmountField
    {...row?.totalSupplyAmount}
    {...row?.totalSupplyAmountQueryState}
    {...queryState}
    symbolClassName="text-slate-300"
  />

  <DisplayTokenValueField
    {...row?.totalSupplyUsd}
    {...row?.totalSupplyUsdQueryState}
    {...queryState}
    symbolClassName="text-slate-500"
  />
</div>
```

### 4) Local injection pattern (tooltip + warning/error icon)

This is app-level concern, not forced by the library.

```tsx
const { severity, ...resolvedErrorState } = resolveDisplayErrorState({
  ...property,
  ...queryState,
})
const ErrorIconComponent = severity === "warning" ? MyWarningIcon : MyErrorIcon

return (
  <DisplayTokenValue
    {...queryState}
    {...resolvedErrorState}
    ErrorIconComponent={ErrorIconComponent}
    {...property?.value}
  />
)
```

## Best-practice checklist from blog-examples

- Keep table row components presentation-only; do formatting in mapper layer.
- Pass robust payloads directly to display wrappers via spread: `{...row?.field}`.
- Merge field-level and global query states explicitly: `{ ...fieldQueryState, ...queryState }`.
- Keep symbol/sign positioning in display components, not pre-concatenated strings.
- Inject tooltip and icon components at app level to match local design system.

## Recommended integration pattern

```tsx
import {
  DisplayPercentRobust,
  type RobustDisplayValue,
} from "web3-display-components"
import { robustFormatPercentToViewPercent } from "web3-robust-formatting"

const robust = robustFormatPercentToViewPercent({
  input: { value: api?.ratio },
})

const property: RobustDisplayValue<unknown> = {
  value: robust.value,
  warnings: robust.warnings,
  errors: robust.errors,
}

return <DisplayPercentRobust property={property} />
```

## Custom icon/tooltip handling

This library does not force warning/error icon injection in robust wrappers.
Use resolver outputs with your own design system components:

```tsx
import {
  DisplayPercentage,
  resolveDisplayErrorState,
  resolvePropertyDisplayProps,
} from "web3-display-components"

const { severity, ...resolved } = resolveDisplayErrorState(queryState, property)
const ErrorIconComponent = severity === "warning" ? MyWarningIcon : MyErrorIcon

return (
  <DisplayPercentage
    {...queryState}
    {...resolved}
    ErrorIconComponent={ErrorIconComponent}
    {...resolvePropertyDisplayProps(property?.value)}
  />
)
```

## Tailwind setup reminder

Consumers must include package files in Tailwind scan paths to generate class names.

## Anti-patterns to avoid

- Do not move formatting logic into this package; keep it in `web3-robust-formatting`.
- Do not concatenate symbols into numeric strings unless required by downstream renderer.
- Do not ignore robust warnings/errors when rendering user-facing financial values.
- Do not hardcode warning/error icon policy in this library; inject at app level.

## Expected Codex behavior in this domain

When using this skill, Codex should:

- choose display primitives by semantic intent (token amount/value/percent/text)
- use robust wrappers when diagnostics exist
- preserve compatibility aliases during migrations
- keep resolver helpers pure and reusable
- update README exports and usage examples whenever public component APIs change
- mirror established VaultRow patterns when adding new table/value cells
