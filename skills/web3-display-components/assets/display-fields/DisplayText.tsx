import { DisplayValueField, type DisplayValueFieldProps } from "./DisplayValue"

export type DisplayTextValueProps = DisplayValueFieldProps

/**
 * Wrapper for plain text with shared robust/query error mapping.
 */
export function DisplayTextValue(props: DisplayTextValueProps) {
  return <DisplayValueField {...props} />
}

export type DisplayTextProps = DisplayTextValueProps
export const DisplayText = DisplayTextValue
