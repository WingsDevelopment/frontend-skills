# Generic Rules Ledger

Use this file to track durable rules that should apply across cell migrations.

## Active Rules

- Rule: Build migrated cells to be theme-compatible by default.
- Why: Route-scoped branding and curator/market variants must restyle existing cells without per-cell rewrites.
- Applies to: All migrated cell UI code (container, typography, state styles, icons, badges, alerts).
- Enforcement: Use semantic theme tokens for color, border, radius, and spacing; reject hard-coded values when a token exists; verify cell under default and alternate theme scopes before completion.
- Rule: Do not introduce hardcoded visual literals in migrated cells.
- Why: Hardcoded values block future theme packs and create one-off maintenance work.
- Applies to: Colors, gradients, border styles, radii, shadows, and theme-driven spacing/typography decisions.
- Enforcement: Route visual styling through semantic CSS variables/theme tokens; if a literal is temporarily unavoidable, record it as a candidate rule debt with an explicit follow-up.
- Rule: Organize theme tokens by `theme/common/page` structure.
- Why: Shared component styling should be reusable across pages while page-specific layout tokens stay isolated and maintainable.
- Applies to: New theme work and cell migrations that introduce or modify styling tokens.
- Enforcement: Place reusable component tokens in per-theme `common.css`; keep route/page-only tokens in per-theme page files (for example `portfolio.css`); import theme files centrally from app layout.
- Rule: Use composition wrappers instead of mode-flag APIs for cell variants.
- Why: Mode flags couple rendering branches and make variant behavior hard to evolve safely.
- Applies to: Cell variants such as compact, section header, and page header presentations.
- Enforcement: Expose dedicated components (`*Cell`, `*CompactCell`, `*PageHeaderCell`, etc.) and share internals through injected props/slots.
- Rule: Prefer React node slots over string render controls.
- Why: String formatting props (for example separators with surrounding spaces) leak presentation concerns into data API and reduce composability.
- Applies to: Separators, prefix/suffix glyphs, inline icons, and similar render-only elements.
- Enforcement: Accept React node injection props/slots (for example `separatorElement`) and render spacing/styling with explicit elements/classes.
- Rule: Add mocked story coverage for each migrated cell.
- Why: Cells appear in multiple contexts; fast visual review across variants/themes prevents regressions during subsequent migrations.
- Applies to: Every migrated cell module.
- Enforcement: Create a colocated mocked `*.stories.tsx` file covering all supported variants and at least default + alternate theme previews.
- Rule: Configure migrated cell stories for controllable docs and code-first source rendering.
- Why: Migration review is faster when component options are tunable and docs show explicit story-authored code snippets.
- Applies to: Every migrated cell `*.stories.tsx` in the new app.
- Enforcement: Use typed CSF `Meta`/`StoryObj`, define practical `argTypes` controls, and set docs source rendering to code (`parameters.docs.source.type = "code"`), with complex non-serializable props marked `control: false`.
- Rule: Preserve legacy inline separator readability by keeping separators typography-driven and spacing-aware.
- Why: Raw slash separators often drift vertically or wrap onto separate lines when migrated unless they inherit the same text metrics as adjacent labels.
- Applies to: Cell rows that render inline joined values (markets, symbols, addresses, etc.).
- Enforcement: Render separators with the same typography variant/class context as neighboring text, and keep default separators as explicit spacing-aware text tokens (for example `" / "`), while still allowing React node slot overrides.
- Rule: Asset/token icon cells must support real token logos with deterministic fallback avatars.
- Why: Legacy cells render token logos when available; dropping to initials-only icons regresses recognizability and causes migration parity drift.
- Applies to: Cell UIs that accept token metadata (for example `symbol`, `addressInfo`, `logoURI`).
- Enforcement: Render `logoURI` when present (with image-error fallback), and use theme-token-driven fallback icon styles keyed by token identity to keep consistent visuals across themes.

## Candidate Rules

Use this section for rules observed once that may be promoted later.

## Rule Template

- Rule:
- Why:
- Applies to:
- Enforcement:
