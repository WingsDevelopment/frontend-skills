---
name: ui-components
description: App-specific UI component architecture and styling conventions for this repository. Use when building, refactoring, migrating, reviewing, or debugging React/Next.js UI code, especially for shared component placement (`app/components` vs `libs/ui/components`), CVA variants, Typography and display wrapper usage, tooltip composition, Button-as-Link patterns, and hydration-safe HTML nesting.
---

# UI Components

1. Read `references/ui-components.md` before editing UI code.
2. Apply component placement rules first:
   - shared app components in `app/components/` (layout in `app/components/layout/`)
   - generic primitives in `libs/ui/components/`
3. Apply styling and composition rules from the reference:
   - CVA object-based variants
   - canonical Tailwind tokens and selectors
   - `Typography` + `web3-display-components` patterns
   - in app code, use wrapper imports from `@/app/components/display-values`
   - direct query-state spread into `web3-display-components` wrappers
4. Apply interaction patterns from the reference:
   - `DataTooltip` composition
   - `TooltipTrigger` ref-forwarding child rules
   - `Button` with `render={<Link />}` for links
5. Prevent hydration issues:
   - when `Typography` children include block elements, set `as="div"`
6. For review tasks, report violations with a direct compliant replacement.
7. When the request is screenshot/legacy page migration, pair this with `ui-page-migration` for parity workflow and QA gates.
8. When the request involves async value formatting/loading/error states, pair this with `web3-display-components` and `web3-robust-formatting`.
9. Pair with `react-compiler-practices` for React hook/memoization decisions in component code.
10. Pair with `data-fetching-best-practice` when implementing or reviewing model/fetch/query/hook flows tied to UI components.
11. If parity-critical behavior is ambiguous after checking source and screenshots, ask for clarification before finalizing.
