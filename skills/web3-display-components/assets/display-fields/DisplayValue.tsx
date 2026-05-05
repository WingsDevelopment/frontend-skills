import * as React from "react"
import {
  DisplayValue,
  resolveDisplayErrorState as resolveDisplayErrorStateBase,
  resolvePropertyDisplayProps,
} from "web3-display-components"

export interface LocalRobustDisplayValue<T> {
  value?: T | null
  warnings?: string[] | null
  errors?: string[] | null
}

export type DisplayFieldRobustProps<T = unknown> =
  React.ComponentProps<typeof DisplayValue> & Partial<LocalRobustDisplayValue<T>>

export type DisplayValueFieldProps = DisplayFieldRobustProps<unknown>

function dedupeNonEmptyLines(lines: Array<string | undefined>): string[] {
  return Array.from(
    new Set(
      lines
        .map((line) => line?.trim())
        .filter((line): line is string => Boolean(line && line.length > 0)),
    ),
  )
}

function extractQueryErrorMessage(props: React.ComponentProps<typeof DisplayValue>): string | undefined {
  const queryErrorMessage =
    typeof props.errorMessage === "string" ? props.errorMessage : undefined
  const queryErrorFromObject =
    props.error instanceof Error
      ? props.error.message
      : typeof props.error === "string"
      ? props.error
      : undefined

  const lines = dedupeNonEmptyLines([queryErrorMessage, queryErrorFromObject])
  return lines.length > 0 ? lines.join("\n") : undefined
}

function extractProperty<T>(props: DisplayFieldRobustProps<T>): LocalRobustDisplayValue<T> | undefined {
  const hasValue = "value" in props
  const hasWarnings = "warnings" in props
  const hasErrors = "errors" in props

  if (!hasValue && !hasWarnings && !hasErrors) {
    return undefined
  }

  return {
    value: props.value as T | undefined,
    warnings: Array.isArray(props.warnings) ? props.warnings : [],
    errors: Array.isArray(props.errors) ? props.errors : [],
  }
}

/**
 * Resolves robust value metadata + query state from flat display props.
 * - hard errors: icon only
 * - warnings with value: value + warning icon
 */
export function resolveDisplayErrorState<T>(
  props: DisplayFieldRobustProps<T>,
): ReturnType<typeof resolveDisplayErrorStateBase> {
  const queryState =
    props.isError != null || props.error != null || props.errorMessage != null
      ? {
          isError: props.isError,
          error: props.error,
          errorMessage: props.errorMessage,
        }
      : undefined

  const property = extractProperty(props)
  const resolved = resolveDisplayErrorStateBase(queryState, property)

  const queryErrorMessage = extractQueryErrorMessage(props)
  const hasQueryStateError = Boolean(props.isError || queryErrorMessage)

  if (!hasQueryStateError) {
    return resolved
  }

  const normalizedQueryErrorMessage = queryErrorMessage ?? "Query request failed."

  return {
    ...resolved,
    isError: true,
    displayErrorAndValue: false,
    error: props.error ?? new Error(normalizedQueryErrorMessage),
    errorMessage: normalizedQueryErrorMessage,
    severity: "error",
  }
}

function DisplayValueTooltip({ trigger, message }: { trigger: React.ReactNode; message: string }) {
  return (
    <span title={message} className="inline-flex items-center">
      {trigger}
    </span>
  )
}

function DisplayValueErrorIcon() {
  return (
    <span aria-hidden className="mx-1 inline-flex text-[0.875em] text-red-500">
      !
    </span>
  )
}

function DisplayValueWarningIcon() {
  return (
    <span aria-hidden className="mx-1 inline-flex text-[0.875em] text-amber-500">
      !
    </span>
  )
}

function DisplayValueEmptyCell() {
  return (
    <span aria-hidden="true" className="mb-0.5 inline-flex items-center justify-center align-middle">
      <span className="inline-block h-0.5 w-4 translate-y-[0.5px] bg-slate-400" />
    </span>
  )
}

const displayValueBaseComponents = {
  TooltipComponent: DisplayValueTooltip,
  emptyCell: <DisplayValueEmptyCell />,
} as const

export function getDisplayValueInjectedComponents(severity: "none" | "warning" | "error") {
  return {
    ...displayValueBaseComponents,
    ErrorIconComponent: severity === "warning" ? DisplayValueWarningIcon : DisplayValueErrorIcon,
  } as const
}

/**
 * Local DisplayValue wrapper with app-level tooltip/error icon + robust error behavior.
 * Accepts flat props: DisplayValueProps + optional value/warnings/errors.
 */
export function DisplayValueField({
  value,
  warnings,
  errors,
  ...props
}: DisplayValueFieldProps) {
  const resolvedInput = {
    ...props,
    value,
    warnings,
    errors,
  }

  const { severity, ...resolvedErrorState } = resolveDisplayErrorState(resolvedInput)
  const injectedComponents = getDisplayValueInjectedComponents(severity)

  return (
    <DisplayValue
      {...resolvePropertyDisplayProps(value)}
      {...props}
      {...resolvedErrorState}
      {...injectedComponents}
    />
  )
}
