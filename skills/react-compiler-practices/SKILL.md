---
name: react-compiler-practices
description: React/Next.js coding rules for projects using React Compiler. Use for any React component/page/hook implementation, refactor, migration, or review where memoization decisions and hook usage matter.
---

# React Compiler Practices

1. Read `references/react-compiler.md` before editing React code.
2. Assume React Compiler is available for optimization in this repo.
3. Default rule: do not introduce `useMemo`, `useCallback`, or `React.memo`.
4. Prefer direct derived values in render over memoization wrappers.
5. Keep hook usage for actual state/effect logic (`useState`, `useEffect`, etc.), not render micro-optimizations.
6. If manual memoization is truly required, add it only with explicit rationale and measured need.
7. For review tasks, flag unnecessary memoization and provide a simpler compiler-friendly rewrite.
8. Pair with `ui-components` for UI architecture/styling and with `web3-display-components` + `web3-robust-formatting` for value rendering/formatting rules.
