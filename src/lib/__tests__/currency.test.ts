import { describe, it, expect } from 'vitest'
import { formatCurrency, convertSatangToPya, toSmallestUnit, fromSmallestUnit } from '../currency'

describe('formatCurrency', () => {
  it('formats THB with 2 decimal places', () => {
    expect(formatCurrency(10000, 'THB')).toContain('100.00')
  })

  it('formats THB zero', () => {
    expect(formatCurrency(0, 'THB')).toContain('0.00')
  })

  it('formats MMK with 0 decimal places', () => {
    const result = formatCurrency(581480, 'MMK')
    expect(result).toContain('5,815')
    expect(result).not.toContain('.')
  })

  it('formats MMK zero', () => {
    const result = formatCurrency(0, 'MMK')
    expect(result).toContain('0')
  })

  it('formats large THB amount with commas', () => {
    const result = formatCurrency(100000000, 'THB')
    expect(result).toContain('1,000,000.00')
  })

  it('formats large MMK amount with commas', () => {
    const result = formatCurrency(10000000000, 'MMK')
    expect(result).toContain('100,000,000')
  })

  it('formats negative THB amount with minus sign', () => {
    const result = formatCurrency(-10000, 'THB')
    expect(result).toContain('-')
    expect(result).toContain('100.00')
  })
})

describe('convertSatangToPya', () => {
  it('converts 100 THB at rate 58.148', () => {
    expect(convertSatangToPya(10000, 58.148)).toBe(581480)
  })

  it('rounds to nearest pya', () => {
    expect(convertSatangToPya(1, 58.148)).toBe(58)
  })

  it('handles zero', () => {
    expect(convertSatangToPya(0, 58.148)).toBe(0)
  })

  it('handles large conversion without overflow', () => {
    expect(convertSatangToPya(2500000, 58.148)).toBe(145370000)
  })
})

describe('toSmallestUnit', () => {
  it('converts baht to satang', () => {
    expect(toSmallestUnit(100, 'THB')).toBe(10000)
  })

  it('converts kyat to pya', () => {
    expect(toSmallestUnit(5815, 'MMK')).toBe(581500)
  })

  it('converts fractional baht to satang', () => {
    expect(toSmallestUnit(100.50, 'THB')).toBe(10050)
  })

  it('rounds fractional kyat to nearest pya', () => {
    expect(toSmallestUnit(100.999, 'MMK')).toBe(10100)
  })
})

describe('fromSmallestUnit', () => {
  it('converts satang to baht', () => {
    expect(fromSmallestUnit(10000, 'THB')).toBe(100)
  })

  it('converts pya to kyat', () => {
    expect(fromSmallestUnit(581500, 'MMK')).toBe(5815)
  })

  it('converts 1 satang to 0.01 baht', () => {
    expect(fromSmallestUnit(1, 'THB')).toBe(0.01)
  })
})
