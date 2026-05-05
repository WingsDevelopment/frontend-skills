import { DisplayPercentage, resolvePropertyDisplayProps } from "web3-display-components"
import type { ViewPercent } from "web3-robust-formatting"
import {
  getDisplayValueInjectedComponents,
  resolveDisplayErrorState,
  type DisplayFieldRobustProps,
} from "./DisplayValue"

export type DisplayPercentValueProps = DisplayFieldRobustProps<ViewPercent>

/**
 * Wrapper for percentage values with shared robust/query error mapping.
 */
export function DisplayPercentValue({
  value,
  warnings,
  errors,
  ...props
}: DisplayPercentValueProps) {
  const resolvedInput = {
    ...props,
    value,
    warnings,
    errors,
  }

  const { severity, ...resolvedErrorState } = resolveDisplayErrorState(resolvedInput)
  const injectedComponents = getDisplayValueInjectedComponents(severity)

  return (
    <DisplayPercentage
      {...resolvePropertyDisplayProps(value)}
      {...props}
      {...resolvedErrorState}
      {...injectedComponents}
    />
  )
}

export type DisplayPercentageFieldProps = DisplayPercentValueProps
export const DisplayPercentageField = DisplayPercentValue
