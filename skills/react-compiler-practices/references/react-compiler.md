# React Compiler Reference

## Default Policy

- React Compiler handles memoization in this codebase.
- Do not add `useMemo`, `useCallback`, or `React.memo` by default.
- Write straightforward React code; let the compiler optimize.

## Preferred Patterns

- Compute derived arrays/objects inline in render when inexpensive.
- Keep event handlers simple without callback memo wrappers.
- Use `useState`/`useEffect` only for stateful behavior and side effects.
- use `computed` when you can
- leverage on memorization that comes out of books for react-compiler - hooks and components being memorized unless params change

## When Manual Memoization Is Allowed

Only with explicit need and rationale, for example:

- proven performance issue that remains with compiler optimizations
- stable identity requirements for external APIs/effect dependencies
- interoperability edge cases that require referential stability

If used, include:

- short comment explaining why compiler optimization is insufficient
- evidence source (profile, benchmark, or concrete bug)

## Review Checklist

- Remove unnecessary `useMemo`.
- Remove unnecessary `useCallback`.
- Remove unnecessary `React.memo`.
- Prefer simpler code unless measured performance or behavior requires manual memoization.
