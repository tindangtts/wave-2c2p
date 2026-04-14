import { z } from 'zod/v4'
import type { TransactionType, TransactionStatus } from '@/types'

/**
 * Top-up amount schema (satang units)
 * Min 15000 satang = 150 THB (D-02)
 * Max 2500000 satang = 25,000 THB (D-02)
 */
export const topupAmountSchema = z.object({
  amountSatang: z
    .number()
    .int('Amount must be a whole number')
    .min(15000, 'belowMinimum')
    .max(2500000, 'aboveMaximum'),
})

export type TopupAmountInput = z.infer<typeof topupAmountSchema>

/**
 * Withdrawal amount schema (satang units)
 * Amount must be > 0
 * Balance check is done at API level with the wallet balance
 */
export const withdrawAmountSchema = z.object({
  amountSatang: z
    .number()
    .int('Amount must be a whole number')
    .min(1, 'Amount must be greater than 0'),
})

export type WithdrawAmountInput = z.infer<typeof withdrawAmountSchema>

/**
 * Top-up channel enum (D-03)
 * Banks: SCB, KTB, Bay, BBL, KBANK, GSB
 * Convenience stores: 123 Service, CenPay
 */
export const topupChannelSchema = z.enum([
  'scb',
  'ktb',
  'bay',
  'bbl',
  'kbank',
  'gsb',
  'service_123',
  'cenpay',
])

export type TopupChannel = z.infer<typeof topupChannelSchema>

/**
 * Transaction history filter schema (D-12/D-14)
 * All filter fields are optional
 */
export const historyFilterSchema = z.object({
  type: z
    .string()
    .optional()
    .transform((val) => (val === 'all' ? undefined : (val as TransactionType | undefined))),
  status: z
    .string()
    .optional()
    .transform((val) => (val === 'all' ? undefined : (val as TransactionStatus | undefined))),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
})

export type HistoryFilterInput = z.infer<typeof historyFilterSchema>
