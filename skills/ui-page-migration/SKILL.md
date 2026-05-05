---
name: ui-page-migration
description: Migrate legacy pages/components into the new app with screenshot parity. Use when a user asks to "migrate/rebuild this page", "match this screenshot", or "port this route/component" and strict layout, typography, icon, tooltip, and visual-test fidelity is required.
---

# UI Page Migration

1. Read `references/migration-checklist.md` before coding.
2. Build a source-of-truth parity map before coding:
   - source implementation is primary, screenshot is secondary
   - layout shells and spacing constants
   - exact copy, labels, counters, and badge text
   - icons, warnings, and tooltip/popover behavior
   - typography variants and weights
   - exact icon identity (`data-icon`/glyph), not just semantic similarity
   - semantic HTML element types and interactive behavior (`button`, `a`, keyboard/focus)
   - tooltip/popover interaction model (hover vs click), content structure, and action set
3. Create route-scoped structure before full implementation:
   - page-specific: `app/(pages)/<route>/components/`
   - generic shared: `app/components/`
   - UI primitives: `libs/ui/components/`
4. Implement with `ui-components` conventions:
   - CVA slot variants for repeated style groups
   - `Typography` and `DisplayValue` patterns
   - hydration-safe HTML nesting
   - `web3-display-components` rules for query-state spread and unit/symbol rendering
   - in app code, import display wrappers from `@/app/components/display-values`
5. Keep all number formatting in mock/mapper objects using `web3-robust-formatting`:
   - `robustFormatNumberToViewNumber` / `robustFormatPercentToViewPercent`
   - render only via app display wrappers from `@/app/components/display-values` (`DisplayTokenValue` / `DisplayPercentage`)
6. Reuse legacy icon/tooltip sources instead of approximating.
   - if legacy uses FontAwesome, match exact icon name/family/glyph
   - if pro packages are unavailable, use a fallback only when glyph and behavior are equivalent
   - do not change interactive element type or control dimensions without explicit parity justification
   - do not reduce interactive tooltips/popovers to static text-only tooltips
7. Run visual tests and inspect artifacts on every meaningful pass.
8. Do not close the task until runtime/build overlays are gone and visual mismatches are fixed or documented with rationale.
9. If required behavior is unclear from source + screenshot, ask for clarification before accepting parity.
