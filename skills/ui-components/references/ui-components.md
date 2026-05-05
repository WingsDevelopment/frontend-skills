# UI Components Architecture

## Table of Contents
- [Component usage](#component-usage)
- [Styling Conventions](#styling-conventions)
- [Typography](#typography)
- [Display Values (web3-display-components + web3-robust-formatting)](#display-values-web3-display-components--web3-robust-formatting)
- [StatItem Pattern](#statitem-pattern)
- [Font Setup](#font-setup)
- [Dependencies](#dependencies)
- [Section Layout Example](#section-layout-example)
- [DataTooltip Pattern](#datatooltip-pattern)
- [Tooltip Trigger](#tooltip-trigger)
- [Button as Link](#button-as-link)
- [HTML Nesting & Hydration](#html-nesting--hydration)
- [Common Mistakes](#common-mistakes)



### Component usage

Always check `app/components/` for shared components before creating new ones. This is the main location for reusable UI elements in this project. The `libs/ui/components/` folder contains more generic primitives that are not specific to this app.

### Generic UI Components (`libs/ui/components/`)

Reusable primitives that could work in any project:

- `Typography` - text styling with variants
- `Button`, `Switch`, `ScrollArea` - interactive elements
- Base UI wrappers with CVA styling

### Project-Specific Components (`app/components/`)

Shared components specific to this app:

- `layout/` — `PageWrapper`, `SectionCard`, `SectionTitle`, `SectionGrid`, `StatItem`, `StatLabel`
- `DataTooltip` — building blocks for data-rich tooltips (`DataTooltipBody`, `DataTooltipHeader`, `DataTooltipList`, `DataTooltipLabel`, `DataTooltipFooter`)
- `OracleProviderIcon`, `OracleProviderList` — oracle provider display with tooltips

**Rule:** Shared components go in `app/components/`, NOT in route folders like `vault/[address]/components/`. Layout components go in `app/components/layout/`, not `libs/ui/`.


## Styling Conventions

### Use CVA (class-variance-authority) Object Approach

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "rounded-lg font-medium transition-colors", // base classes
  {
    variants: {
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      intent: {
        primary: "bg-aquamarine-700 text-text-button",
        secondary: "bg-background-600 text-text-primary",
      },
    },
    defaultVariants: {
      size: "md",
      intent: "primary",
    },
  },
)
```

### Tailwind Best Practices

1. **Use canonical class names** - `max-w-333` not `max-w-[1332px]`
2. **Data attribute selectors** - `data-[disabled]:opacity-50` NOT `[&:data-disabled]:opacity-50`
3. **Grids/flex inline** - Don't abstract simple layouts into components
4. **No over-coupling** - Don't create variants like `header`, `content`, `sidebar` that couple unrelated concerns
5. **Cross-framework migration mapping** - If source uses MUI/CSS-in-JS and target uses Tailwind, map spacing/typography/color tokens explicitly before implementing classes

### React Compiler Memoization Rule

- This repo assumes React Compiler optimization.
- Do not introduce `useMemo`, `useCallback`, or `React.memo` for routine render optimization.
- Prefer straightforward derived values in render unless there is a measured, documented exception.


## Typography

Always use the `Typography` component for text, never raw Tailwind text classes.

```tsx
import { Typography } from "@/libs/ui"

// Correct
<Typography variant="mono1">$1,234.56</Typography>
<Typography variant="body1" color="subText">Label text</Typography>

// Wrong - don't use raw classes
<span className="text-lg">$1,234.56</span>
```

### Typography Variants

| Variant                  | Use Case                            |
| ------------------------ | ----------------------------------- |
| `mono1`                  | Numeric values, prices, percentages |
| `mono2`, `mono3`         | Smaller numeric values              |
| `subtitle1`, `subtitle2` | Section headers, important values   |
| `body1`                  | Default body text, labels           |
| `body2`                  | Secondary text, descriptions        |

### Typography with Color

```tsx
<Typography variant="mono1" color="success">0x1234...5678</Typography>
<Typography variant="body1" color="subText">Oracle price</Typography>
```

### Typography Parity Rules (Migration/Review)

- Do not swap `subText`/`secondary`/`primary` colors without checking source semantics.
- Do not promote/demote variants (`body2` to `subtitle`, etc.) for visual preference.
- Validate copy and casing before visual polish; typography parity includes exact text content.


## Display Values (web3-display-components + web3-robust-formatting)

### Wrapper Import Source (Required)

In app code, import display components from the local wrapper folder:

- `@/app/components/display-values`
- filesystem path: `app/components/display-values` or the app's equivalent wrapper folder

Do not import `DisplayValue`/`DisplayTokenValue`/`DisplayPercentage` directly from `web3-display-components` in app UI files; use local wrappers so app-level error icon/tooltip/query-state behavior stays consistent.

```tsx
import {
  DisplayValue,
  DisplayText,
  DisplayPercentage,
  DisplayTokenAmount,
  DisplayTokenValue,
} from "@/app/components/display-values"
```

### Pattern: Typography Wraps DisplayValue

```tsx
// Correct - Typography wraps DisplayValue
<Typography variant="mono1">
  <DisplayTokenValue {...mockVault.oraclePrice} />
</Typography>

// Correct - with color
<Typography variant="mono1" color="success">
  <DisplayTokenValue {...mockVault.balance} />
</Typography>
```

### Format in Mock/Mapper, Not Render

```tsx
// Correct - `web3-robust-formatting` formatters in mock object
const mockVault = {
  oraclePrice: robustFormatNumberToViewNumber({
    input: { value: 1.0, symbol: "$" },
  }),
  supplyApy: robustFormatPercentToViewPercent({
    input: { value: 0.0828 },
  }),
  totalSupply: robustFormatNumberToViewNumber({
    input: { value: 12_345_678, symbol: "$" },
  }),
}

// Usage - just spread
<DisplayTokenValue {...mockVault.oraclePrice} />

// Wrong - formatting at render time
<DisplayTokenValue
  {...robustFormatNumberToViewNumber({ input: { value: price, symbol: "$" } })}
/>
```

### Query-State Spread Pattern

For async-backed UI values, keep query state on response/entity objects (for example `{ isLoading, isPending, isError, error, data }`) and spread that query state directly into display components.

```tsx
// Entity/query shape
const position = {
  isLoading: query.isLoading,
  isPending: query.isPending,
  isError: query.isError,
  error: query.error,
  data: {
    id: robustFormatNumberToViewNumber({
      input: { value: 2, symbol: "" },
    }),
    marketLabel: "Sentora RLUSD",
  },
}

// Render pattern: spread query response directly + spread formatted value directly
<DisplayTokenValue {...position} {...position.data?.id} />
<DisplayValue {...position} viewValue={position.data?.marketLabel} />
```

Rules:

- Avoid adapter/wrapper helper functions that remap display props.
- Do not rebuild/clone query-state objects (`const x = { isLoading: ..., isError: ... }`) before rendering.
- Prefer spreading the original response object directly (`...position`, `...queryState`) into display components.
- In app UI files, import display components from `@/app/components/display-values`, not directly from `web3-display-components`.
- Keep display components close to source data: pass query state (`isLoading`, `isPending`, `isError`, `error`) directly.
- Use display components for all query-backed values (numbers, percentages, and loaded text labels).
- Treat text labels that load asynchronously the same way as numbers: render via `DisplayValue`.
- Do not format numbers inline in JSX; formatting remains in mapper/mock/query transformation.
- Keep numeric value and unit in the same display component. Use formatter symbols (for example `robustFormatNumberToViewNumber({ input: { value: 1.06, symbol: "x" } })`) and render once.
- Do not append unit text as a second display component (for example avoid `<DisplayValue viewValue="x" />` next to a number display).
- Keep fixed UI copy in JSX/CVA (labels, button text, static chip text). Do not move constant UI strings into fetched mock/query data.
- Keep fixed presentation styles in JSX/CVA (for example token icon gradients/colors). Do not store presentation-only style tokens in fetched mocks.
- Keep static interactive copy/config (for example local metric switcher options and tooltip titles) in component JSX/config, not in fetched mocks.
- Do not spread query loading state into fixed labels/copy; only query-backed values should skeletonize.

### Fixed-Schema Cards and Rows

For cards/rows with known, stable fields (for example six predefined stats), implement explicit JSX slots instead of mapping heterogeneous metric configs.

```tsx
<StatItem>
  <StatLabel>Net asset value</StatLabel>
  <Typography variant="subtitle2">
    <DisplayTokenValue {...position} {...position.data?.netAssetValue} />
  </Typography>
</StatItem>
```

Rules:

- Do not render fixed-schema UIs via `metrics.map(...)` + `kind` switches.
- Keep each field explicit in markup (label, value component, suffix/actions), so parity edits are local and reviewable.
- Reserve config-driven maps for truly dynamic schemas (unknown field count/order at runtime).

### Loading Placeholders for Cards/Rows

When list/card data is loading, render a fixed number of placeholder items (for stable layout) with:

- `data: undefined`
- loading query flags set (`isLoading: true` or `isPending: true`)

and let display components render skeleton states automatically.


## StatItem Pattern

For label+value pairs in grids:

```tsx
<StatItem>
  <StatLabel>Oracle price</StatLabel>
  <Typography variant="mono1">
    <DisplayTokenValue {...mockVault.oraclePrice} />
  </Typography>
</StatItem>

<StatItem>
  <StatLabel>Market</StatLabel>
  <Typography variant="subtitle2" className="font-medium">
    {mockVault.market}
  </Typography>
</StatItem>
```

**No StatValue wrapper** - use Typography directly for values.


## Font Setup

### Self-Hosted Inter Variable Font

The project uses a self-hosted Inter variable font for full OpenType feature support (slashed-zero, tabular-nums).

```css
/* globals.css */
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 1000;
  font-display: swap;
  src: url("/fonts/Inter.var.woff2") format("woff2-variations");
}
```

**Why not Google Fonts?** Google Fonts' Inter is outdated and doesn't support `font-variant-numeric: slashed-zero`.

**Why not rsms.me CDN?** The CDN version requires `font-feature-settings: 'zero'` instead of `font-variant-numeric`, which isn't compatible with Tailwind's utilities.

### Numeric Typography

The `mono1`, `mono2`, `mono3` variants include:

- `lining-nums` - uniform height numbers
- `slashed-zero` - zeros with slash for clarity
- `tabular-nums` - fixed-width numbers for alignment


## Dependencies

Do not import project-private design packages directly in this project. Copy approved assets (fonts, icons) directly instead.


## Section Layout Example

```tsx
<SectionCard>
  <SectionTitle>Overview</SectionTitle>
  <SectionGrid>
    <StatItem>
      <StatLabel>Oracle price</StatLabel>
      <Typography variant="mono1">
        <DisplayTokenValue {...mockVault.oraclePrice} />
      </Typography>
    </StatItem>
    <StatItem>
      <StatLabel>Market</StatLabel>
      <Typography variant="subtitle2" className="font-medium">
        {mockVault.market}
      </Typography>
    </StatItem>
    {/* ... more items */}
  </SectionGrid>
</SectionCard>
```


## DataTooltip Pattern

For structured data tooltips (oracle details, risk parameters, etc.), use the `DataTooltip` building blocks from `app/components/DataTooltip`. These are NOT the tooltip primitive — they compose inside `TooltipContent`.

```tsx
import { Tooltip, TooltipContent, TooltipTrigger, Button } from "@/libs/ui"
import {
  DataTooltipBody,
  DataTooltipHeader,
  DataTooltipList,
  DataTooltipLabel,
  DataTooltipFooter,
} from "@/app/components/DataTooltip"
;<Tooltip>
  <TooltipTrigger>
    <Avatar src="/providers/Chainlink.svg" alt="Chainlink" size={24} />
  </TooltipTrigger>
  <TooltipContent side="top" size="medium">
    <DataTooltipBody>
      <DataTooltipHeader>Oracle Details</DataTooltipHeader>
      <DataTooltipList>
        <DataTooltipLabel label="Provider">
          <span className="typography-body1 text-text-primary">Chainlink</span>
        </DataTooltipLabel>
        <DataTooltipLabel label="Address">
          <Typography as="span" variant="mono3" color="success">
            0x1234...abcd
          </Typography>
        </DataTooltipLabel>
      </DataTooltipList>
      <DataTooltipFooter>
        <Button variant="stroke" size="sm" fullWidth render={<Link href="..." target="_blank" />}>
          View more info
        </Button>
      </DataTooltipFooter>
    </DataTooltipBody>
  </TooltipContent>
</Tooltip>
```

**Rules:**

- `DataTooltipLabel` uses plain `<span>` with Tailwind classes, NOT `Typography` — keeps it dependency-free
- Values inside `DataTooltipLabel` use `<span className="typography-body1 text-text-primary">` for plain text, `Typography` only when you need special variants like `mono3`
- Use `DataTooltipFooter` + `Button` for action links, not raw `<a>` tags


## Tooltip Trigger

`TooltipTrigger` uses Base UI's `render` prop internally. The child **must be a single `ReactElement` that forwards refs** (e.g. `Avatar`, `Button`). Don't wrap in `<span>` or `<div>`.

```tsx
// Correct - Avatar forwards refs
<TooltipTrigger>
  <Avatar src="/icon.svg" alt="icon" size={24} />
</TooltipTrigger>

// Wrong - <span> doesn't forward tooltip props
<TooltipTrigger>
  <span><Avatar src="/icon.svg" alt="icon" size={24} /></span>
</TooltipTrigger>
```

Interactive tooltip components (hover, click) require `"use client"` directive.


## Button as Link

Use the `render` prop to render a `Button` as a Next.js `Link` for navigation:

```tsx
import { Button } from "@/libs/ui"
import Link from "next/link"
;<Button variant="stroke" size="sm" render={<Link href="/path" target="_blank" />}>
  View more info
</Button>
```

**Don't** use raw `<a>` tags styled to look like buttons. Always use `Button` + `render={<Link />}`.


## HTML Nesting & Hydration

**Critical:** `body1` and `body2` render as `<p>` tags. Block elements (`<div>`, `<ul>`, etc.) inside `<p>` cause hydration errors in Next.js.

```tsx
// Wrong - <div> inside <p> causes hydration error
<Typography variant="body1">
  <div className="flex items-center gap-2">...</div>
</Typography>

// Correct - use as="div" when children contain block elements
<Typography as="div" variant="body1">
  <div className="flex items-center gap-2">...</div>
</Typography>

// Also correct - use a span-based variant (mono1, subtitle2, etc.)
<Typography variant="mono1">
  <DisplayTokenValue {...value} />
</Typography>
```

**Rule:** If Typography children contain `<div>`, `<ul>`, `<table>`, or any block element, always add `as="div"`.

### Variant → HTML Tag Mapping

| Variant                 | Tag           | Can contain `<div>`?            |
| ----------------------- | ------------- | ------------------------------- |
| `h1`–`h6`               | `<h1>`–`<h6>` | No                              |
| `subtitle1`–`subtitle3` | `<h6>`        | No                              |
| `body1`, `body2`        | `<p>`         | **No** — use `as="div"`         |
| `mono1`–`mono3`         | `<span>`      | No (but inline content is fine) |
| `input1`, `input2`      | `<span>`      | No                              |


## Common Mistakes

| Mistake                                                     | Correct                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `<Typography variant="body1"><div>...</div></Typography>`   | `<Typography as="div" variant="body1"><div>...</div></Typography>`    |
| `<TooltipTrigger><span><Avatar/></span></TooltipTrigger>`   | `<TooltipTrigger><Avatar/></TooltipTrigger>` (ref-forwarding element) |
| Raw `<a>` styled as button                                  | `<Button render={<Link href="..." />}>`                               |
| `Typography` inside DataTooltipLabel                        | Plain `<span className="typography-body1">`                           |
| Components in route folders (`vault/[address]/components/`) | Shared components in `app/components/`                                |
| `[&:data-disabled]:opacity-50`                              | `data-[disabled]:opacity-50`                                          |
| `max-w-[1332px]`                                            | `max-w-333`                                                           |
| Layout in `libs/ui/`                                        | Layout in `app/components/layout/`                                    |
| Wrapping DisplayValue in StatValue                          | Typography wraps DisplayValue directly                                |
| Formatting at render time                                   | Format in mock/mapper objects                                         |
| Importing display components from `web3-display-components` | Import local wrappers from `@/app/components/display-values`          |
| Google Fonts Inter                                          | Self-hosted Inter.var.woff2                                           |
| Importing from private design packages                      | Copy approved assets to project                                       |

## Migration Guardrails

When migrating a page from legacy/screenshot, do not treat this as freeform UI work:

- **Preserve source layout architecture first**
- Copy outer/inner container model and spacing constants before styling internals.
- Do not collapse distinct shells into one generic wrapper.

- **Preserve semantic interaction contracts**
- Keep element type parity for controls (`button`, `a`, form elements).
- Keep keyboard/focus behavior parity and preserve control geometry (hit area, icon size, padding).
- Do not change interactive controls to non-interactive wrappers.

- **Do not approximate iconography or help affordances**
- Reuse legacy icon source paths/components when available.
- Match exact icon family/style/glyph, not semantic look-alikes.
- If source icon/label exposes tooltip or popover behavior, migrate full behavior and content.

- **Keep numbers in formatted data objects**
- Apply `robustFormatNumberToViewNumber` / `robustFormatPercentToViewPercent` in mock/mapper objects.
- Render with `DisplayTokenValue` / `DisplayPercentage` only; never format inline in JSX.

- **Use CVA for repeated class groups**
- Tabs, cards, chips, headers, and repeated row/cell styles should use CVA slot variants.
- Avoid long duplicated class strings across multiple components.

- **Split route-specific UI cleanly**
- Route-specific components in `app/(pages)/<route>/components/`.
- Shared feature-agnostic components in `app/components/`.
- One component per file unless the helper is trivially small.
