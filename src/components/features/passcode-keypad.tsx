'use client'

import { useEffect, useRef } from 'react'
import { Delete } from 'lucide-react'

interface PasscodeKeypadProps {
  value: string
  onChange: (value: string) => void
  onComplete: (code: string) => void
  error?: string
  isLoading?: boolean
}

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function PasscodeKeypad({
  value,
  onChange,
  onComplete,
  error,
  isLoading,
}: PasscodeKeypadProps) {
  const completeCalledRef = useRef(false)

  // Reset complete flag when value changes to less than 6
  useEffect(() => {
    if (value.length < 6) {
      completeCalledRef.current = false
    }
  }, [value])

  function handleDigit(digit: string) {
    if (value.length >= 6 || isLoading) return
    const next = value + digit
    onChange(next)
    if (next.length === 6 && !completeCalledRef.current) {
      completeCalledRef.current = true
      setTimeout(() => {
        onComplete(next)
      }, 100)
    }
  }

  function handleBackspace() {
    if (value.length === 0 || isLoading) return
    onChange(value.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Dot display row */}
      <div
        className={[
          'flex flex-row gap-3 justify-center items-center h-20',
          error ? 'animate-shake' : '',
          isLoading ? 'animate-pulse' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Passcode entry progress"
        role="status"
      >
        {Array.from({ length: 6 }, (_, i) => {
          const filled = i < value.length
          return (
            <div
              key={i}
              className={[
                'w-3 h-3 rounded-full border-2 transition-colors duration-200',
                filled
                  ? 'bg-[#FFE600] border-transparent'
                  : 'border-[#E0E0E0] bg-transparent',
              ].join(' ')}
              aria-hidden="true"
            />
          )
        })}
      </div>

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mt-8">
        {/* Keys 1–9 */}
        {DIGIT_KEYS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            disabled={isLoading}
            aria-label={digit}
            className="w-16 h-16 bg-[#F5F5F5] rounded-full text-xl font-bold text-[#212121] active:bg-[#E0E0E0] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {digit}
          </button>
        ))}

        {/* Empty cell (bottom-left placeholder) */}
        <div className="w-16 h-16 invisible" aria-hidden="true" />

        {/* Key 0 */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          disabled={isLoading}
          aria-label="0"
          className="w-16 h-16 bg-[#F5F5F5] rounded-full text-xl font-bold text-[#212121] active:bg-[#E0E0E0] transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          0
        </button>

        {/* Backspace key */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={isLoading}
          aria-label="Delete digit"
          className="w-16 h-16 bg-[#F5F5F5] rounded-full active:bg-[#E0E0E0] transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Delete className="w-6 h-6 text-[#212121]" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="text-xs text-[#F44336] mt-4 text-center"
        >
          {error}
        </p>
      )}
    </div>
  )
}
