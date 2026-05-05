---
name: cell-migration
description: Migrate legacy cell components into the new app with a reusable, rule-driven workflow. Use when implementing the first or subsequent cell migrations, extracting generic conventions (naming, contracts, structure, testing gates) from each migration, and avoiding one-off cell details in shared guidance.
---

# Cell Migration

1. Read `references/migration-checklist.md` and `references/generic-rules.md` before coding.
2. Treat every migration as two deliverables:
   - a migrated, parity-correct cell
   - updated generic rules for future cells
3. Ask for missing inputs before implementation:
   - legacy source path and new target path
   - parity baseline (legacy implementation, screenshot, or both)
   - data mode expectations (mock, backend, or switchable)
   - acceptance gates (tests, typecheck, visual checks)
4. Pair with repo skills when relevant:
   - `react-compiler-practices` for React/Next implementation
   - `ui-components` for structure/styling conventions
   - `data-fetching-best-practice` for fetch/mapper/hook changes
   - `legacy-mock-playwright` when deterministic mocked Playwright coverage is required

## Migration Workflow

1. Build a parity map before coding:
   - structure/layout responsibilities
   - displayed data points and formatting
   - interaction behavior and edge states
2. Implement the migrated cell with clear layer boundaries.
3. Validate theme compatibility for every migrated cell:
   - use semantic theme tokens for color, border, radius, and spacing decisions
   - avoid hard-coded hex values and fixed one-off visual constants when a token exists
   - ensure the cell renders correctly under both default and non-default theme scopes
4. Build variants via composition, not mode flags:
   - avoid coupled render branches such as `asCompact`/`asPageHeader` props
   - prefer dedicated wrapper components (`*CompactCell`, `*PageHeaderCell`, etc.)
   - inject variant-specific elements through props/slots when needed
5. Keep styling split by concern:
   - shared cell variants in `styles.ts`/`styles.tsx` via CVA
   - theme tokens in per-theme `common.css`
   - page-only layout tokens in per-theme page files (for example `portfolio.css`)
6. Add a mocked `*.stories.tsx` for each migrated cell:
   - cover all supported variants
   - include default and alternate theme previews
7. Validate parity and behavior with required project checks.
8. Record only reusable conventions in `references/generic-rules.md`.
9. Leave one-off cell specifics in implementation notes, not in skill rules.

## Rule Capture Protocol

1. Classify each new decision:
   - `generic`: should apply to all or most cells
   - `candidate`: may become generic after repetition
   - `cell-specific`: tied to one interface/use case
2. Add only `generic` decisions to `references/generic-rules.md`.
3. Promote a `candidate` rule to `generic` once repeated or explicitly approved.
4. Write rules as stable conventions, not temporary naming from a single cell.
5. Use this format for every stored rule:
   - Rule:
   - Why:
   - Applies to:
   - Enforcement:

## Completion Standard

1. Migrated cell behavior matches agreed parity baseline.
2. Migrated cell is theme-compatible (token-driven visual styles, no blocking hard-coded values).
3. Required checks pass for touched code.
4. New generic rules are captured in the ledger.
5. Skill text stays technology- and cell-agnostic where possible.
