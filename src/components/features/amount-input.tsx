'use client'

import { useRef, useEffect } from 'react'
import { Delete } from 'lucide-react'

interface AmountInputProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function AmountInput({ value, onChange, disabled }: AmountInputProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleDigit(digit: string) {
    if (disabled) return

    // Max 8 total characters
    if (value.length >= 8) return

    let next = value + digit

    // Strip leading zeros (but allow "0." for decimal input)
    if (next.length > 1 && next.startsWith('0') && next[1] !== '.') {
      next = next.replace(/^0+/, '') || '0'
    }

    onChange(next)
  }

  function handleDecimal() {
    if (disabled) return
    // Only one decimal point allowed
    if (value.includes('.')) return
    // Max 8 chars check
    if (value.length >= 8) return

    const next = value === '' ? '0.' : value + '.'
    onChange(next)
  }

  function handleBackspace() {
    if (disabled) return
    if (value.length === 0) return
    onChange(value.slice(0, -1))
  }

  function handleLongPressStart() {
    if (disabled) return
    longPressTimer.current = setTimeout(() => {
      onChange('')
    }, 300)
  }

  function handleLongPressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function validateDecimalPlaces(val: string): boolean {
    const parts = val.split('.')
    if (parts.length < 2) return true
    return parts[1].length <= 2
  }

  function handleDigitWithDecimalCheck(digit: string) {
    if (disabled) return
    if (value.length >= 8) return

    let next = value + digit

    // Strip leading zeros
    if (next.length > 1 && next.startsWith('0') && next[1] !== '.') {
      next = next.replace(/^0+/, '') || '0'
    }

    // Validate max 2 decimal places
    if (!validateDecimalPlaces(next)) return

    onChange(next)
  }

  // Keyboard input support for WCAG 2.1.1 — allow hardware keyboard entry
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handleDigitWithDecimalCheck(e.key)
      } else if (e.key === '.') {
        e.preventDefault()
        handleDecimal()
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        handleBackspace()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [disabled, value])

  const keyClass =
    'flex items-center justify-center rounded-xl bg-secondary text-xl font-bold text-foreground active:bg-border transition-colors disabled:opacity-40'

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {/* Keys 1–9 */}
      {DIGIT_KEYS.map((digit) => (
        <button
          key={digit}
          type="button"
          style={{ height: '56px', minWidth: '68px' }}
          className={keyClass}
          onClick={() => handleDigitWithDecimalCheck(digit)}
          disabled={disabled}
          aria-label={digit}
        >
          {digit}
        </button>
      ))}

      {/* Decimal point */}
      <button
        type="button"
        style={{ height: '56px', minWidth: '68px' }}
        className={keyClass}
        onClick={handleDecimal}
        disabled={disabled}
        aria-label="decimal point"
      >
        .
      </button>

      {/* 0 */}
      <button
        type="button"
        style={{ height: '56px', minWidth: '68px' }}
        className={keyClass}
        onClick={() => handleDigitWithDecimalCheck('0')}
        disabled={disabled}
        aria-label="0"
      >
        0
      </button>

      {/* Backspace */}
      <button
        type="button"
        style={{ height: '56px', minWidth: '68px' }}
        className={keyClass}
        onClick={handleBackspace}
        onPointerDown={handleLongPressStart}
        onPointerUp={handleLongPressEnd}
        onPointerLeave={handleLongPressEnd}
        disabled={disabled}
        aria-label="Delete digit"
      >
        <Delete className="w-5 h-5 text-foreground" />
      </button>
    </div>
  )
}
