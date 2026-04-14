'use client'

import { useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { AmountInput } from '@/components/features/amount-input'
import { PasscodeSheet } from '@/components/features/passcode-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useWallet } from '@/hooks/use-wallet'
import { useWalletOpsStore } from '@/stores/wallet-ops-store'
import { toSmallestUnit, formatCurrency } from '@/lib/currency'
import type { Recipient } from '@/types'

interface RecipientsData {
  recipients: Recipient[]
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('fetch failed')
    return r.json()
  })

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function transferTypeLabel(type: string): string {
  switch (type) {
    case 'wave_agent': return 'Wave Agent'
    case 'wave_app': return 'Wave App'
    case 'bank_transfer': return 'Bank Transfer'
    case 'cash_pickup': return 'Cash Pickup'
    default: return type.replace(/_/g, ' ')
  }
}

function WithdrawAmountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipientId = searchParams.get('recipientId') ?? ''

  const { setWithdrawAmount, resetWithdraw } = useWalletOpsStore()
  const { data: walletData, isLoading: walletLoading } = useWallet()
  const { data: recipientsData, isLoading: recipientLoading } = useSWR<RecipientsData>(
    '/api/recipients',
    fetcher
  )

  const [amount, setAmount] = useState('')
  const [passcodeOpen, setPasscodeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [withdrawalTransactionId, setWithdrawalTransactionId] = useState<string | null>(null)

  const recipient = recipientsData?.recipients.find((r) => r.id === recipientId) ?? null
  const wallet = walletData?.wallet
  // Balance in baht for display (satang / 100)
  const balanceSatang = wallet?.balance ?? 0
  const balanceBaht = balanceSatang / 100

  const amountNum = parseFloat(amount) || 0
  const amountSatang = toSmallestUnit(amountNum, 'THB')
  const isInsufficient = amountNum > 0 && amountSatang > balanceSatang
  const isCTADisabled = amountNum <= 0 || isInsufficient || isSubmitting || walletLoading

  const handleWithdraw = useCallback(() => {
    if (isCTADisabled) return
    setWithdrawAmount(amount)
    setPasscodeOpen(true)
  }, [isCTADisabled, amount, setWithdrawAmount])

  const handleVerified = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mock-payment/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountSatang,
          recipient_id: recipientId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Withdrawal failed. Please try again.')
        return
      }

      const txId: string = data.transaction_id ?? data.reference_number ?? ''
      setWithdrawalTransactionId(txId)
      resetWithdraw()
      router.push(`/withdraw/receipt?transactionId=${txId}&amount=${amountSatang}&recipientName=${encodeURIComponent(recipient?.full_name ?? '')}`)
    } catch {
      toast.error('Connection error. Please check your internet and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [amountSatang, recipientId, recipient, resetWithdraw, router])

  // Suppress unused warning — withdrawalTransactionId is set before navigation
  void withdrawalTransactionId

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Withdraw" />

      <div className="flex-1 px-4 pt-4 pb-32 overflow-y-auto">
        {/* Recipient summary card */}
        {recipientLoading ? (
          <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        ) : recipient ? (
          <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#FFE600] flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-foreground">
                {getInitials(recipient.full_name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate">{recipient.full_name}</p>
              <p className="text-xs text-[#595959]">
                {recipient.transfer_type ? transferTypeLabel(recipient.transfer_type) : 'Transfer'}
              </p>
            </div>
          </div>
        ) : null}

        {/* Amount display */}
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-foreground leading-tight">
            {amount || '0'}
          </p>
          <p className="text-base text-[#595959]">THB</p>
        </div>

        {/* Balance line */}
        <p className="text-xs text-[#595959] text-center mb-1">
          {walletLoading
            ? 'Loading balance...'
            : `Available: ${formatCurrency(balanceSatang, 'THB')}`}
        </p>

        {/* Insufficient balance error */}
        {isInsufficient && (
          <p className="text-xs text-destructive text-center mb-4">
            Insufficient balance. Enter an amount up to {formatCurrency(balanceSatang, 'THB')}.
          </p>
        )}

        {/* Amount keypad */}
        <div className="mt-4">
          <AmountInput value={amount} onChange={setAmount} disabled={isSubmitting} />
        </div>
      </div>

      {/* Sticky Withdraw CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={isCTADisabled}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Withdraw'}
        </button>
      </div>

      {/* Passcode Sheet */}
      <PasscodeSheet
        open={passcodeOpen}
        onOpenChange={setPasscodeOpen}
        onVerified={handleVerified}
      />
    </div>
  )
}

export default function WithdrawAmountPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-muted">
        <BackHeader title="Withdraw" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-[#0091EA] border-t-transparent animate-spin" />
        </div>
      </div>
    }>
      <WithdrawAmountContent />
    </Suspense>
  )
}
