'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/layout/back-header'
import { AmountInput } from '@/components/features/amount-input'
import { useP2PStore } from '@/stores/p2p-store'
import { useWallet } from '@/hooks/use-wallet'
import { toSmallestUnit, fromSmallestUnit } from '@/lib/currency'

export default function P2PAmountPage() {
  const router = useRouter()
  const { receiverWalletId, setAmount } = useP2PStore()
  const { data: walletData } = useWallet()

  const [amountStr, setAmountStr] = useState('')

  // Guard: redirect if no walletId in store
  useEffect(() => {
    if (!receiverWalletId) {
      router.replace('/transfer/p2p')
    }
  }, [receiverWalletId, router])

  const amountNum = parseFloat(amountStr) || 0
  const amountSatang = toSmallestUnit(amountNum, 'THB')
  const walletBalanceSatang = walletData?.wallet?.balance ?? 0

  // Validate amount
  const validationError = (() => {
    if (amountNum === 0) return null
    if (amountSatang > walletBalanceSatang) {
      const balanceTHB = fromSmallestUnit(walletBalanceSatang, 'THB')
      return `Exceeds your available balance of ${balanceTHB.toFixed(2)} THB`
    }
    return null
  })()

  const isCtaDisabled = amountNum === 0 || validationError !== null

  const handleReview = useCallback(() => {
    if (isCtaDisabled) return
    setAmount(amountSatang)
    router.push('/transfer/confirm?type=p2p')
  }, [isCtaDisabled, amountSatang, setAmount, router])

  // Don't render until we know walletId is present
  if (!receiverWalletId) return null

  // Initials from last 2 chars of wallet ID (e.g. W-123456 -> "56")
  const avatarLabel = receiverWalletId.slice(-2).toUpperCase()

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <BackHeader title="Send Amount" />

      {/* Receiver chip */}
      <div className="mx-4 mt-4 mb-4 flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-foreground">{avatarLabel}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{receiverWalletId}</p>
          <p className="text-xs text-muted-foreground">2C2P WAVE Wallet</p>
        </div>
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-5xl font-bold leading-none ${amountStr ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {amountStr || '0'}
          </span>
          <span className="text-base text-muted-foreground">THB</span>
        </div>

        {/* Validation error */}
        {validationError && (
          <p role="alert" className="mt-3 text-sm text-destructive text-center">
            {validationError}
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="mt-auto px-4 mb-4">
        <AmountInput value={amountStr} onChange={setAmountStr} />
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white px-4 pb-6 pt-2">
        <button
          type="button"
          onClick={handleReview}
          disabled={isCtaDisabled}
          className={`w-full h-14 rounded-xl text-base font-bold transition-colors ${isCtaDisabled ? 'bg-border text-muted-foreground' : 'bg-primary text-foreground'}`}
        >
          Review Transfer
        </button>
      </div>
    </div>
  )
}
