/**
 * Amount formatting utilities for Brazilian currency (R$)
 */

/**
 * Formats a number as Brazilian currency string (e.g., "123,45")
 * Converts from cents to formatted display value
 */
export function formatAmountForDisplay(cents: number): string {
  if (!cents) return ""
  return (cents / 100).toFixed(2).replace('.', ',')
}

/**
 * Parses a formatted amount string (e.g., "123,45") to cents
 * Removes all non-digit characters and returns the numeric value in cents
 */
export function parseAmountToCents(formattedAmount: string): number {
  const cleaned = formattedAmount.replace(/[^\d]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

/**
 * Formats amount input as user types (bank-style formatting)
 * Only allows digits and auto-formats with comma as decimal separator
 */
export function formatAmountInput(value: string): string {
  // Allow only numbers
  const cleaned = value.replace(/[^\d]/g, '')
  
  if (!cleaned) {
    return ""
  }

  // Convert to number (from cents) and format for display
  const numValue = parseFloat(cleaned) / 100
  return numValue.toFixed(2).replace('.', ',')
}

/**
 * Removes the last digit from a formatted amount string
 * Used for backspace handling in amount inputs
 */
export function removeLastDigit(formattedAmount: string): string {
  const cleaned = formattedAmount.replace(/[^\d]/g, '')
  if (cleaned.length > 1) {
    const newCleaned = cleaned.slice(0, -1)
    const numValue = parseFloat(newCleaned) / 100
    return numValue.toFixed(2).replace('.', ',')
  }
  return ""
}
