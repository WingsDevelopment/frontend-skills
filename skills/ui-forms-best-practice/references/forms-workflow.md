# Forms Workflow

## Goal

Rebuild form UIs from legacy/screenshot with predictable state architecture:

- form-scoped providers and context (no prop drilling)
- wrapper-local immediate input state + provider-level debounced canonical state
- mock-first data until backend integration is ready
- visual parity enforced through Playwright

## Pairing Rules

Use this reference together with:

- `ui-page-migration` for parity process
- `legacy-mock-playwright` for fetch-layer mock/real switching + production guard
- `data-fetching-best-practice` for fetch/mapper/hook layering
- `ui-components` and `react-compiler-practices` for UI and hook rules

## Form Ownership Boundaries

- Each form owns its provider, state, and summary logic.
- Do not reuse one form's state model in another form.
- Shared utilities are allowed only for generic primitives (for example debounce hooks, numeric parsers, validation helpers).

## Recommended Structure

```text
app/(pages)/<route>/components/forms/<form-name>/
├── <form-name>.provider.tsx
├── <form-name>.context.ts
├── <form-name>.view.tsx
├── <form-name>.summary.tsx
└── fields/
    ├── AmountField.tsx
    └── SliderField.tsx
```

If field behavior is app-reusable, promote wrappers to shared locations under `app/components/`.

## Provider State Contract (Debounced Only)

Provider/context stores only canonical debounced values.
Do not store raw keystroke/drag state in provider.

```tsx
import * as React from "react"

type BorrowFormState = {
  amount: string
  slider: number
  setDebouncedAmount: (value: string) => void
  setDebouncedSlider: (value: number) => void
}

const BorrowFormContext = React.createContext<BorrowFormState | null>(null)

export function BorrowFormProvider({ children }: { children: React.ReactNode }) {
  const [amount, setAmount] = React.useState("")
  const [slider, setSlider] = React.useState(0)

  return (
    <BorrowFormContext.Provider
      value={{
        amount,
        slider,
        setDebouncedAmount: setAmount,
        setDebouncedSlider: setSlider,
      }}
    >
      {children}
    </BorrowFormContext.Provider>
  )
}

export function useBorrowFormState() {
  const ctx = React.useContext(BorrowFormContext)
  if (!ctx) throw new Error("useBorrowFormState must be used inside BorrowFormProvider")
  return ctx
}
```

## Amount + Slider Field Wrappers

- Use form-aware amount wrappers (`app/components/amount-input/form-input.tsx`) for context-connected amount input behavior.
- Add form-aware slider wrappers (for example `app/components/slider/form-slider.tsx`) with the same philosophy.
- Debounce inside wrappers using a debounce library/helper (for example `lodash.debounce`).
- Wrappers keep immediate local UI state and only push debounced values to provider.
- Avoid `useEffect` timer-based debounce logic in provider.
- Keep wrapper APIs small and explicit.

```tsx
import * as React from "react"
import debounce from "lodash.debounce"
import { AmountInput } from "@/libs/ui"
import { useBorrowFormState } from "../borrow-form.context"

const DEBOUNCE_MS = 250

export function BorrowAmountField() {
  const { amount, setDebouncedAmount } = useBorrowFormState()
  const [localAmount, setLocalAmount] = React.useState(amount)

  const pushDebouncedAmount = React.useMemo(
    () => debounce((next: string) => setDebouncedAmount(next), DEBOUNCE_MS),
    [setDebouncedAmount],
  )

  return (
    <AmountInput
      value={localAmount}
      onChange={(next) => {
        setLocalAmount(next)
        pushDebouncedAmount(next)
      }}
    />
  )
}
```

## Summary Data Flow

- Summary components must read provider values (`amount`, `slider`) that are already debounced.
- Fetch hooks should be keyed by these provider values.
- Mapper does all formatting with `web3-robust-formatting`.
- UI renders summary values through local wrappers from `@/app/components/display-values`.

```tsx
import { DisplayTokenValue } from "@/app/components/display-values"

const { amount, slider } = useBorrowFormState()

const summaryQuery = useBorrowSummary({
  amount,
  slider,
})

return <DisplayTokenValue {...summaryQuery} {...summaryQuery.data?.totalBorrowUsd} />
```

## Mock-First Migration Contract

- Start with mocks that cover:
  - default/healthy state
  - warning state
  - error/failure state
- Keep these mocks deterministic for Playwright.
- Keep mock/real switching in fetch only, with `legacy-mock-playwright` options + production guard.

## Visual Testing

- Run: `pnpm test:visual`
- Use strict run when baseline parity is accepted:
  - `pnpm test:visual:strict`
- Check diff artifacts before concluding migration.

## Anti-Patterns

- Prop-drilling form values through many child components
- Storing both immediate and debounced copies of amount/slider in provider state
- Using immediate (non-debounced) amount/slider values for expensive summaries
- Debouncing in provider with `useEffect` timers instead of wrapper-level debounce helpers
- Sharing one form's provider/model between unrelated forms
- Putting mock/real switching into mapper/hook/UI layers
- Rendering display values with direct `web3-display-components` imports instead of local wrappers from `@/app/components/display-values`.
