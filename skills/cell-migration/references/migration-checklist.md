# Cell Migration Checklist

## 1. Scope

- Identify legacy source files and target files.
- Confirm parity source of truth.
- Confirm rendering/data expectations and acceptance gates.

## 2. Build

- Recreate behavior and layout from the parity map.
- Keep architecture boundaries consistent with project standards.
- Avoid introducing one-off abstractions into shared layers.
- Prefer compositional variants over mode flags (no `asCompact`-style branching APIs).
- Use style variants in `styles.ts`/`styles.tsx` (CVA) for shared visual slots.
- Prefer injected React nodes/slots over string formatting controls for rendering (for example separators).

## 3. Validate

- Run required local checks for touched files.
- Validate loading, empty, error, and success states.
- Validate any interaction parity requirements.
- Validate theme compatibility.
- Use theme tokens for color/border/radius/spacing.
- Avoid hard-coded visual literals when token alternatives exist.
- Confirm rendering under default and at least one alternate theme scope.
- Validate mocked `*.stories.tsx` coverage for all supported cell variants.

## 4. Extract Rules

- Review all migration decisions.
- Add only generic rules to `generic-rules.md`.
- Keep cell-specific details out of the shared skill.
