'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ScanLine } from 'lucide-react'
import { BackHeader } from '@/components/layout/back-header'
import { Input } from '@/components/ui/input'
import { useP2PStore } from '@/stores/p2p-store'

// Wallet ID format: W- followed by 6 or more digits
const WALLET_ID_REGEX = /^W-\d{6,}$/

export default function P2PWalletIdPage() {
  const router = useRouter()
  const { setReceiverWalletId } = useP2PStore()

  const [walletId, setWalletId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback((id: string): string | null => {
    if (!id.trim()) return null
    if (!WALLET_ID_REGEX.test(id.trim())) {
      return 'Please enter a valid wallet ID'
    }
    return null
  }, [])

  const handleBlur = useCallback(() => {
    setError(validate(walletId))
  }, [walletId, validate])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletId(e.target.value)
    // Clear error while typing
    if (error) setError(null)
  }, [error])

  const handleContinue = useCallback(() => {
    const trimmed = walletId.trim()
    const validationError = validate(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }
    setReceiverWalletId(trimmed)
    router.push('/transfer/p2p/amount')
  }, [walletId, validate, setReceiverWalletId, router])

  const handleScanQR = useCallback(() => {
    router.push('/scan')
  }, [router])

  const isEmpty = walletId.trim().length === 0
  const isDisabled = isEmpty

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <BackHeader title="Send to Wallet" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        {/* Wallet ID input */}
        <div className="mb-1">
          <Input
            autoFocus
            type="text"
            value={walletId}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter wallet ID (e.g. W-123456)"
            className={[
              'h-14 rounded-xl bg-secondary text-base',
              error ? 'border-[#F44336] focus-visible:ring-[#F44336]' : '',
            ].join(' ')}
            aria-invalid={!!error}
            aria-describedby={error ? 'wallet-id-error' : undefined}
          />
        </div>

        {/* Error message */}
        {error && (
          <p
            id="wallet-id-error"
            role="alert"
            className="text-xs text-[#F44336] mt-1"
          >
            {error}
          </p>
        )}

        {/* OR divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-sm text-[#595959]">OR</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Scan QR button */}
        <button
          type="button"
          onClick={handleScanQR}
          className="w-full h-12 rounded-xl border border-[#0091EA] text-[#0091EA] flex items-center justify-center gap-2 font-medium text-sm"
        >
          <ScanLine className="w-4 h-4" />
          Scan Wallet QR
        </button>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white px-4 pb-6 pt-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isDisabled}
          className="w-full h-14 rounded-xl bg-[#FFE600] text-foreground font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enter Amount
        </button>
      </div>
    </div>
  )
}
