# Migration Checklist

Use this checklist for every screenshot-driven or legacy-to-new migration.

Migrate the given legacy page into the target app.

## 1. Source Audit Before Coding

- Read the legacy route/page and all directly rendered subcomponents.
- Build a parity map before implementation: layout shells, text nodes, controls, icons, and help affordances.
- Trace icon, warning, and badge sources in legacy code instead of inferring from screenshots.
- Record exact user-facing copy and casing for every visible label and value heading.
- If any behavior is ambiguous in source/screenshot, ask for clarification before finalizing parity-sensitive UI.

## 2. Layout Parity First

- Recreate outer shell and inner content shells separately; do not collapse them.
- Copy spacing constants from source wrappers, theme tokens, or style objects.
- Do not eyeball spacing from screenshots when source constants are available.
- If legacy and target frameworks differ (for example MUI to Tailwind), map spacing and sizing token-by-token first.

## 3. Typography and Text Fidelity

- Match typography variant first, then weight, then color token.
- Do not substitute nearby text styles when an exact variant exists.
- Audit every text node before merge: content, casing, variant, weight, color, line-height, and letter spacing.
- Validate small metadata text (suffix IDs, helper labels, warnings) with the same rigor as headings.

## 4. Semantic and Interaction Parity

- Preserve semantic element types for interactive controls (`button`, `a`, form controls).
- Keep keyboard/focus behavior equivalent to legacy.
- Match control and icon geometry (hit area, icon size, alignment, padding) before cosmetic tweaks.
- Do not replace interactive elements with non-interactive tags.

## 5. Icons, Warnings, Tooltips, and Popovers

- Reuse legacy icon source/component path when possible.
- Match exact icon identity (library family, weight/style, glyph), not semantic similarity.
- Preserve warning composition: icon, text, tone, and placement.
- Match tooltip/popover trigger mode (hover/focus/click), placement/offset, dismiss behavior, and focus handling.
- Migrate full interactive content inside tooltips/popovers (actions, toggles, links), not only headline text.

## 6. Component Architecture

- Route-specific components belong in `app/(pages)/<route>/components/`.
- Shared app-level components belong in `app/components/`.
- Reusable primitives belong in `libs/ui/components/`.
- Keep one component per file unless the helper is trivially small and local.
- Use CVA variants for repeated style groups instead of duplicated class strings.
- For fixed-schema cards/rows, render explicit field slots in JSX instead of `metrics.map(...)` patterns.
- In React Compiler projects, avoid adding `useMemo`/`useCallback`/`React.memo` unless there is a measured, documented need.

## 7. Number Formatting Rules (Non-Negotiable)

Use `web3-robust-formatting` for mapper/mock formatting and `web3-display-components` for rendering.
In app UI files, import display components from local wrappers at `@/app/components/display-values`.

- Format numeric data in mock/mapper objects only.
- Render numeric values with display components only.
- Do not import `DisplayTokenValue` / `DisplayPercentage` directly from `web3-display-components` in app UI files.
- Pass query/loading/error flags by spreading the source response object directly (`...position`, `...query`), not remapped helper objects.
- Keep value + unit/symbol in the same display component (do not append units as separate display values).
- Keep fixed labels/button copy/static helper text in JSX/CVA, not in fetched mock objects.
- Keep presentation-only styles (icon gradients/colors/chip cosmetics) in JSX/CVA, not in fetched mock objects.
- Keep static interactive copy/config (local switcher options, tooltip titles) in JSX/config, not in fetched mock objects.
- Ensure loading states affect only query-backed values; fixed labels/copy stay visible.

```tsx
import { DisplayPercentage, DisplayTokenValue } from "@/app/components/display-values"
import {
  robustFormatNumberToViewNumber,
  robustFormatPercentToViewPercent,
} from "web3-robust-formatting"

// Correct
const mockData = {
  price: robustFormatNumberToViewNumber({
    input: { value: 1.0, symbol: "$" },
  }),
  apy: robustFormatPercentToViewPercent({
    input: { value: 0.0828 },
  }),
}
<DisplayTokenValue {...mockData.price} />
<DisplayPercentage {...mockData.apy} />

// Wrong
<DisplayTokenValue {...robustFormatNumberToViewNumber({ input: { value: price, symbol: "$" } })} />
```

## 8. Visual Test Workflow

- Run `pnpm test:visual` on each meaningful migration pass.
- After baseline parity is accepted, use strict mode for regression checks: `pnpm test:visual:strict`.
- Inspect test artifacts (`actual`, `diff`, and error context) for each failure.
- When diffs are large, verify viewport, device scale, fonts, and async data/render timing before style debugging.

## 9. Debugging Guardrails

- Resolve runtime/build overlays before visual tuning.
- Fail tests on runtime exceptions, hydration errors, and console errors.
- Treat unknown-prop leakage to DOM as failures.
- Treat semantic regressions as failures even when screenshots look close.

## 10. Acceptance Gate

- No runtime/build/hydration errors.
- Layout and spacing map to source constants.
- Text, typography, and copy are parity-checked.
- Icons, warnings, and tooltip/popover behavior are parity-checked.
- Numeric values are preformatted in data objects and rendered via display components.
- Visual diff is either fixed or explicitly documented with rationale.
