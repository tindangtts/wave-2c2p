import { describe, it, expect } from 'vitest'
import {
  topupAmountSchema,
  withdrawAmountSchema,
  topupChannelSchema,
  historyFilterSchema,
} from '../schemas'

describe('topupAmountSchema', () => {
  it('accepts minimum amount (15000 satang = 150 THB)', () => {
    const result = topupAmountSchema.safeParse({ amountSatang: 15000 })
    expect(result.success).toBe(true)
  })

  it('accepts maximum amount (2500000 satang = 25000 THB)', () => {
    const result = topupAmountSchema.safeParse({ amountSatang: 2500000 })
    expect(result.success).toBe(true)
  })

  it('rejects amount below minimum (14999)', () => {
    const result = topupAmountSchema.safeParse({ amountSatang: 14999 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('belowMinimum'))).toBe(true)
    }
  })

  it('rejects amount above maximum (2500001)', () => {
    const result = topupAmountSchema.safeParse({ amountSatang: 2500001 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('aboveMaximum'))).toBe(true)
    }
  })
})

describe('withdrawAmountSchema', () => {
  it('accepts minimum amount (1 satang)', () => {
    const result = withdrawAmountSchema.safeParse({ amountSatang: 1 })
    expect(result.success).toBe(true)
  })

  it('rejects zero amount', () => {
    const result = withdrawAmountSchema.safeParse({ amountSatang: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative amount', () => {
    const result = withdrawAmountSchema.safeParse({ amountSatang: -100 })
    expect(result.success).toBe(false)
  })
})

describe('topupChannelSchema', () => {
  it('accepts scb', () => {
    const result = topupChannelSchema.safeParse('scb')
    expect(result.success).toBe(true)
  })

  it('accepts service_123', () => {
    const result = topupChannelSchema.safeParse('service_123')
    expect(result.success).toBe(true)
  })

  it('accepts all valid channel values', () => {
    for (const channel of ['scb', 'ktb', 'bay', 'bbl', 'kbank', 'gsb', 'service_123', 'cenpay'] as const) {
      const result = topupChannelSchema.safeParse(channel)
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid_bank', () => {
    const result = topupChannelSchema.safeParse('invalid_bank')
    expect(result.success).toBe(false)
  })
})

describe('historyFilterSchema', () => {
  it('defaults page to 0 when omitted', () => {
    const result = historyFilterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(0)
    }
  })

  it('defaults limit to 20 when omitted', () => {
    const result = historyFilterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(20)
    }
  })

  it('transforms type="all" to undefined', () => {
    const result = historyFilterSchema.safeParse({ type: 'all' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBeUndefined()
    }
  })

  it('preserves specific type values', () => {
    const result = historyFilterSchema.safeParse({ type: 'transfer' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('transfer')
    }
  })

  it('accepts optional filter fields', () => {
    const result = historyFilterSchema.safeParse({
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      page: 1,
      limit: 10,
    })
    expect(result.success).toBe(true)
  })
})
