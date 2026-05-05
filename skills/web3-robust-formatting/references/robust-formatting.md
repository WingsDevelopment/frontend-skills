# Robust Formatting Reference

Use this reference when implementing mapper/mock formatting logic with `web3-robust-formatting`.

## Core Rules

- Keep formatting in mapper/mock layers; never inline formatter calls in JSX.
- Use robust wrappers as data-ingestion boundaries and preserve diagnostics.
- Pass outputs to UI via local display wrappers (`@/app/components/display-values`).
- Prefer `context` values that identify feature + field path.

## Preferred Wrapper Selection

- `robustFormatBigIntToViewTokenAmount`: token amounts from base units.
- `robustFormatBigIntToViewNumber`: fiat/value-like bigint base-unit values.
- `robustFormatNumberToViewNumber`: plain numeric values.
- `robustFormatPercentToViewPercent`: ratios/percent values.
- `robustCalculateTokenValue`: token amount x token price calculations.

## Diagnostics Contract

Every robust wrapper returns:

```ts
{
  value: T | undefined
  warnings: string[]
  errors: string[]
}
```

Rules:

- Do not assume `value` exists when `errors` is empty.
- Keep `warnings`/`errors` on mapper output.
- Use `mergeRobustDiagnostics` for multi-step pipelines.

## Required Field Handling

- Use `requiredFields` for hard requirements at mapper boundaries.
- For optional fields, allow `value: undefined` and handle fallback in mapper shape.
- Avoid custom ad-hoc required-field helpers in feature code.

## Mapper Example

```ts
import {
  robustCalculateTokenValue,
  robustFormatBigIntToViewNumber,
  robustFormatPercentToViewPercent,
  mergeRobustDiagnostics,
} from "web3-robust-formatting"

const apy = robustFormatPercentToViewPercent({
  context: "portfolio.mapper.positions[0].apy",
  input: { value: raw.apy },
  requiredFields: ["value"],
})

const calc = robustCalculateTokenValue({
  context: "portfolio.mapper.positions[0].nav.calculate",
  input: {
    tokenAmount: raw.balanceRaw,
    tokenPrice: raw.priceRaw,
    tokenDecimals: raw.tokenDecimals,
    tokenPriceDecimals: raw.priceDecimals,
  },
})

const nav = robustFormatBigIntToViewNumber({
  context: "portfolio.mapper.positions[0].nav.format",
  input: {
    bigIntValue: calc.value?.tokenValueRaw,
    decimals: calc.value?.tokenValueDecimals,
    symbol: "$",
  },
})

const diagnostics = mergeRobustDiagnostics(calc, nav)
```

## Anti-Patterns

- Formatting in React render functions.
- Creating mapper-local wrappers that only repackage `robustFormat*` calls.
- Stripping diagnostics before passing to UI.
- Concatenating units/symbols into raw strings before formatting.
- Mixing source switching/mock logic into mapper formatting functions.
