---
name: ui-forms-best-practice
description: Form architecture and migration workflow for app forms. Use when building or migrating forms (especially amount-input + slider flows) from legacy/screenshot with form-scoped context/providers, debounced shared state for summaries, mock-first data during rebuild, and Playwright parity checks. Pair with `ui-page-migration`, `legacy-mock-playwright`, `data-fetching-best-practice`, `ui-components`, and `react-compiler-practices`.
---

# UI Forms Best Practice

1. Read `references/forms-workflow.md` before implementing form code.
2. Always pair this skill with:
   - `ui-page-migration` for screenshot/legacy parity
   - `legacy-mock-playwright` for mock-first fetch switching and Playwright-safe mocks
   - `data-fetching-best-practice` for fetch/mapper/hook architecture and cache rules
   - `ui-components` + `react-compiler-practices` for UI composition and React rules
3. Wrap each form in form-scoped context/providers:
   - keep canonical form state inside provider/context
   - avoid prop drilling through component trees
   - do not share one provider across unrelated forms
4. Keep provider state debounced-only:
   - provider/context should store only debounced/canonical amount + slider values
   - do not store immediate keystroke/drag state in provider
   - never debounce provider state with ad-hoc `useEffect` timers
5. Build form primitives through wrappers:
   - use amount input wrappers in the app's `app/components/amount-input/` folder
   - add slider wrappers similar to amount-input wrappers when form behavior is needed
   - wrappers own immediate UI state and push debounced updates to provider via a debounce library/helper
   - keep display rendering through `@/app/components/display-values` wrappers
6. Keep form data mock-first during migration:
   - start with deterministic mocks for default, warning, and error states
   - ensure mock payloads mimic all states visible in legacy/screenshot
   - keep source switching in fetch layer only (`legacy-mock-playwright`)
7. Keep forms isolated:
   - do not couple business/state logic between forms
   - shared hooks/utils are allowed only for truly generic behavior (for example debounce helpers)
8. Keep summaries driven by debounced values only:
   - summary components must consume provider values (already debounced/canonical)
   - query keys should include these provider values for stable caching behavior
9. Run Playwright visual tests on meaningful changes and inspect artifacts before closing.
