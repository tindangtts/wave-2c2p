'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { AmountInput } from '@/components/features/amount-input'
import { useTransferStore } from '@/stores/transfer-store'
import { useWallet } from '@/hooks/use-wallet'
import {
  convertSatangToPya,
  formatCurrency,
  toSmallestUnit,
  fromSmallestUnit,
} from '@/lib/currency'

const MIN_THB = 100
const MAX_THB = 25000

export default function AmountPage() {
  const router = useRouter()
  const t = useTranslations('transfer')

  const { selectedRecipient, rate, setAmount, setRate } = useTransferStore()
  const { data: walletData } = useWallet()

  const [amountStr, setAmountStr] = useState('')
  const [isRateLoading, setIsRateLoading] = useState(true)
  const [debouncedAmount, setDebouncedAmount] = useState('')

  // Guard: redirect if no recipient selected
  useEffect(() => {
    if (!selectedRecipient) {
      router.replace('/transfer/recipient')
    }
  }, [selectedRecipient, router])

  // Fetch exchange rate on mount
  useEffect(() => {
    let cancelled = false
    async function fetchRate() {
      setIsRateLoading(true)
      try {
        const res = await fetch('/api/mock-payment/rate')
        if (!res.ok) throw new Error('rate fetch failed')
        const data = await res.json()
        if (!cancelled) {
          setRate(data.rate, data.validUntil)
        }
      } catch {
        // Rate stays at stored value
      } finally {
        if (!cancelled) setIsRateLoading(false)
      }
    }
    fetchRate()
    return () => { cancelled = true }
  }, [setRate])

  // Debounce conversion display
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amountStr)
    }, 100)
    return () => clearTimeout(timer)
  }, [amountStr])

  const amountNum = parseFloat(amountStr) || 0
  const amountSatang = toSmallestUnit(amountNum, 'THB')
  const walletBalanceSatang = walletData?.wallet?.balance ?? 0

  // Validate
  const validationError = (() => {
    if (amountNum === 0) return null
    if (amountNum < MIN_THB) return t('amount_min_error') // Minimum transfer: 100 THB
    if (amountNum > MAX_THB) return t('amount_max_error')
    if (amountSatang > walletBalanceSatang) {
      const balanceTHB = fromSmallestUnit(walletBalanceSatang, 'THB')
      return `Exceeds your available balance of ${balanceTHB.toFixed(2)} THB`
    }
    return null
  })()

  const isNextDisabled = amountNum === 0 || validationError !== null

  // Compute converted amount for debounced display
  const convertedPya = (() => {
    const num = parseFloat(debouncedAmount) || 0
    if (num === 0 || rate === 0) return 0
    return convertSatangToPya(toSmallestUnit(num, 'THB'), rate)
  })()

  const handleNext = useCallback(() => {
    if (isNextDisabled) return
    setAmount(amountSatang)
    router.push('/transfer/channel')
  }, [isNextDisabled, amountSatang, setAmount, router])

  if (!selectedRecipient) return null

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <BackHeader title={t('title_transfer')} />

      {/* Selected recipient summary */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-[#F5F5F5]">
        <div className="w-10 h-10 rounded-full bg-[#FFE600] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[#212121]">
            {selectedRecipient.first_name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[16px] font-bold text-[#212121] truncate">
            {selectedRecipient.full_name}
          </span>
          <span className="text-[12px] text-[#757575]">
            {selectedRecipient.transfer_type?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center pt-12 pb-8 px-4">
        {/* Main amount */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-[48px] font-bold leading-none"
            style={{ color: amountStr ? '#212121' : '#9E9E9E' }}
          >
            {amountStr || '0'}
          </span>
          <span className="text-[16px] text-[#757575]">THB</span>
        </div>

        {/* Converted MMK */}
        <div className="mt-2 h-6 flex items-center">
          {isRateLoading ? (
            <div className="w-[120px] h-[16px] bg-[#E0E0E0] rounded animate-pulse" />
          ) : convertedPya > 0 ? (
            <span className="text-[16px] text-[#757575]">
              = {formatCurrency(convertedPya, 'MMK')}
            </span>
          ) : (
            <span className="text-[16px] text-[#757575]">= 0 MMK</span>
          )}
        </div>

        {/* Rate line */}
        {!isRateLoading && rate > 0 && (
          <div className="mt-1">
            <span className="text-[12px] text-[#757575]">
              1 THB = {rate.toFixed(1)} MMK
            </span>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <p
            role="alert"
            className="mt-3 text-[14px] text-[#F44336] text-center"
          >
            {validationError}
          </p>
        )}
      </div>

      {/* Keypad — pushed to bottom */}
      <div className="mt-auto px-4 mb-4">
        <AmountInput value={amountStr} onChange={setAmountStr} />
      </div>

      {/* Sticky CTA */}
      <div className="px-4 pb-6 safe-bottom">
        <button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          className="w-full h-14 rounded-full text-[16px] font-bold transition-colors"
          style={{
            backgroundColor: isNextDisabled ? '#E0E0E0' : '#FFE600',
            color: isNextDisabled ? '#9E9E9E' : '#212121',
          }}
        >
          {t('cta_next')}
        </button>
      </div>
    </div>
  )
}
