/**
 * Currency utilities using integer arithmetic (satang/pya).
 * Per D-07: All financial calculations use smallest currency unit.
 * Per D-08: THB = 2 decimal places, MMK = 0 decimal places.
 * Per D-09: Never calculate with floating-point display values.
 */

export type CurrencyCode = 'THB' | 'MMK'

/**
 * Format an integer amount in smallest unit for display.
 * THB: satang -> baht (divide by 100, 2 decimal places)
 * MMK: pya -> kyat (divide by 100, 0 decimal places)
 */
export function formatCurrency(amountInSmallestUnit: number, currency: CurrencyCode): string {
  const displayAmount = amountInSmallestUnit / 100

  if (currency === 'THB') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayAmount)
}

/**
 * Convert THB satang to MMK pya using integer arithmetic.
 *
 * @param satang - amount in Thai satang (smallest THB unit)
 * @param rateKyatPerBaht - exchange rate in kyat per baht (e.g. 58.148)
 * @returns amount in Myanmar pya (smallest MMK unit)
 *
 * Derivation: satang / 100 = baht; baht * rate = kyat; kyat * 100 = pya.
 * Simplification: (satang / 100) * rate * 100 = satang * rate.
 * Formula: Math.round(satang * rateKyatPerBaht) = pya.
 * Example: 10000 satang (100 THB) * 58.148 = 581480 pya (5814.80 kyat).
 */
export function convertSatangToPya(satang: number, rateKyatPerBaht: number): number {
  return Math.round(satang * rateKyatPerBaht)
}

/**
 * Convert display amount to smallest unit.
 * THB: baht -> satang (multiply by 100)
 * MMK: kyat -> pya (multiply by 100)
 */
export function toSmallestUnit(displayAmount: number, currency: CurrencyCode): number {
  return Math.round(displayAmount * 100)
}

/**
 * Convert smallest unit to display amount.
 * THB: satang -> baht (divide by 100)
 * MMK: pya -> kyat (divide by 100)
 */
export function fromSmallestUnit(amountInSmallestUnit: number, currency: CurrencyCode): number {
  return amountInSmallestUnit / 100
}
