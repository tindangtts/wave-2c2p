'use client'

import { useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDown, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BackHeader } from '@/components/layout/back-header'
import { RateTimer } from '@/components/features/rate-timer'
import { PasscodeSheet } from '@/components/features/passcode-sheet'
import { useTransferStore } from '@/stores/transfer-store'
import { useP2PStore } from '@/stores/p2p-store'
import { useWallet } from '@/hooks/use-wallet'
import { formatCurrency, convertSatangToPya, fromSmallestUnit } from '@/lib/currency'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ConfirmPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isP2P = searchParams.get('type') === 'p2p'
  const { mutate: mutateWallet, data: walletData } = useWallet()

  const t = useTranslations('wallet')

  const {
    channel,
    selectedRecipient,
    amountSatang,
    feeSatang,
    rate,
    rateValidUntil,
    note,
    setNote,
    setTransactionId,
    setStatus,
    setRate,
  } = useTransferStore()

  const p2pStore = useP2PStore()

  const [passcodeOpen, setPasscodeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [forceConfirm, setForceConfirm] = useState(false)

  // Guard: P2P flow — redirect if no receiver wallet ID
  if (isP2P && !p2pStore.receiverWalletId) {
    if (typeof window !== 'undefined') {
      router.replace('/transfer/p2p')
    }
    return null
  }

  // Guard: standard flow — redirect if no channel selected
  if (!isP2P && (!channel || !selectedRecipient)) {
    if (typeof window !== 'undefined') {
      router.replace('/transfer/channel')
    }
    return null
  }

  // Derive display values based on flow type
  const displayAmount = isP2P ? p2pStore.amountSatang : amountSatang
  const displayFee = isP2P ? 0 : feeSatang
  const displayRate = isP2P ? 1 : rate
  const displayRecipientName = isP2P ? p2pStore.receiverWalletId : (selectedRecipient?.full_name ?? '')
  const displayChannel = isP2P ? 'p2p' : channel

  const convertedPya = isP2P ? 0 : convertSatangToPya(amountSatang, rate)
  const totalSatang = displayAmount + displayFee

  const senderName = walletData?.profile?.first_name ?? 'You'
  const senderPhone = ''

  const handleRateExpired = useCallback(async () => {
    toast.info('Exchange rate expired. Fetching new rate...')
    try {
      const res = await fetch('/api/mock-payment/rate')
      if (res.ok) {
        const data = await res.json()
        setRate(data.rate, data.validUntil)
        toast.success('Exchange rate refreshed.')
      }
    } catch {
      toast.error('Failed to refresh rate. Please try again.')
    }
  }, [setRate])

  async function handleVerified() {
    if (isP2P) {
      // P2P transfer path
      setIsSubmitting(true)
      try {
        const res = await fetch('/api/mock-payment/p2p-transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiver_wallet_id: p2pStore.receiverWalletId,
            amount: p2pStore.amountSatang,
            force_confirm: forceConfirm,
          }),
        })

        const data = await res.json()

        // Duplicate transfer guard (TXN-11)
        if (res.status === 409 && data.error === 'duplicate_transfer') {
          setIsSubmitting(false)
          setDuplicateDialogOpen(true)
          return
        }

        if (!res.ok || !data.success) {
          toast.error(data.error ?? 'Transfer failed. Please try again.')
          return
        }

        p2pStore.setTransactionId(data.transfer?.id ?? data.transfer?.reference_number ?? '')
        p2pStore.setStatus('pending')
        mutateWallet()
        setForceConfirm(false)
        router.push('/transfer/receipt?type=p2p')
      } catch {
        toast.error('Connection error. Please check your internet and try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Standard A/C transfer path
    if (!selectedRecipient || !channel) return

    // Re-check rate not expired
    if (rateValidUntil && new Date(rateValidUntil).getTime() <= Date.now()) {
      await handleRateExpired()
      toast.info('Rate updated. Please confirm again.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mock-payment/process-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: fromSmallestUnit(amountSatang, 'THB'),
          currency: 'THB',
          recipient_id: selectedRecipient.id,
          channel,
          force_confirm: forceConfirm,
        }),
      })

      const data = await res.json()

      // Duplicate transfer guard (TXN-11)
      if (res.status === 409 && data.error === 'duplicate_transfer') {
        setIsSubmitting(false)
        setDuplicateDialogOpen(true)
        return
      }

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Transfer failed. Please try again.')
        return
      }

      setTransactionId(data.transfer.reference_number)
      setStatus('pending')
      mutateWallet()
      setForceConfirm(false)
      router.push('/transfer/receipt')
    } catch {
      toast.error('Connection error. Please check your internet and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Confirmation" />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {/* Transfer summary header */}
        <div className="text-center">
          <p className="text-xs text-[#595959]">Transfer</p>
          <p className="text-[1.75rem] font-bold text-foreground mt-1">
            {formatCurrency(displayAmount, 'THB')}
          </p>
          {!isP2P && (
            <p className="text-base text-[#595959] mt-1">
              {formatCurrency(convertedPya, 'MMK')}
            </p>
          )}
        </div>

        {/* Rate lock timer — hidden for P2P (no rate expiry) */}
        {!isP2P && (
          <div className="mt-3 flex justify-center">
            {rateValidUntil && (
              <RateTimer validUntil={rateValidUntil} onExpired={handleRateExpired} />
            )}
          </div>
        )}

        {/* Sender / Receiver card */}
        <div className="mt-4 bg-white rounded-xl border border-border p-4">
          {/* Sender */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-foreground">
                {getInitials(senderName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate">{senderName}</p>
              {senderPhone && (
                <p className="text-xs text-[#595959]">{senderPhone}</p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <ArrowDown className="w-6 h-6 text-[#E0E0E0]" />
          </div>

          {/* Receiver */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FFE600] flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-foreground">
                {getInitials(displayRecipientName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate">
                {displayRecipientName}
              </p>
              <p className="text-xs text-[#595959]">
                {isP2P ? '2C2P WAVE (P2P)' : (displayChannel ?? '').replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Fee breakdown card */}
        <div className="mt-4 bg-white rounded-xl border border-border p-4">
          {/* Amount row */}
          <div className="flex items-center justify-between">
            <span className="text-base text-[#595959]">Amount</span>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(displayAmount, 'THB')}
            </span>
          </div>

          {/* Fee row */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-base text-[#595959]">Fee</span>
            <span className="text-base font-bold text-destructive">
              {formatCurrency(displayFee, 'THB')}
            </span>
          </div>

          {/* Exchange Rate row — hidden for P2P */}
          {!isP2P && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-base text-[#595959]">Exchange Rate</span>
              <span className="text-base text-[#595959]">
                1 THB = {displayRate.toFixed(2)} MMK
              </span>
            </div>
          )}

          {/* Converted Amount row — hidden for P2P */}
          {!isP2P && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-base text-[#595959]">Converted Amount</span>
              <span className="text-base text-[#595959]">
                {formatCurrency(convertedPya, 'MMK')}
              </span>
            </div>
          )}

          {/* Transfer Type row — P2P only */}
          {isP2P && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-base text-[#595959]">Type</span>
              <span className="flex items-center gap-1 text-base font-bold text-foreground">
                <Wallet className="w-4 h-4 text-[#0091EA]" />
                Wallet Transfer
              </span>
            </div>
          )}

          {/* Separator */}
          <div className="border-t border-border my-3" />

          {/* Total row */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalSatang, 'THB')}
            </span>
          </div>
        </div>

        {/* Note field */}
        <div className="mt-4">
          <label htmlFor="transfer-note" className="block text-base text-foreground mb-2">
            Note (optional)
          </label>
          <textarea
            id="transfer-note"
            rows={3}
            value={isP2P ? '' : note}
            onChange={(e) => { if (!isP2P) setNote(e.target.value) }}
            placeholder="Add a note for your recipient..."
            className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-[#767676] focus:border-[#0091EA] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => setPasscodeOpen(true)}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Confirm'}
        </button>
      </div>

      {/* Passcode Sheet */}
      <PasscodeSheet
        open={passcodeOpen}
        onOpenChange={setPasscodeOpen}
        onVerified={handleVerified}
      />

      {/* Duplicate Transfer Guard Dialog (TXN-11) */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent className="max-w-[380px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('duplicateTransfer.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('duplicateTransfer.body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateDialogOpen(false)}>
              {t('duplicateTransfer.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDuplicateDialogOpen(false)
                setForceConfirm(true)
                setPasscodeOpen(true)
              }}
              className="bg-[#FFE600] text-foreground hover:bg-[#FFD600]"
            >
              {t('duplicateTransfer.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmPageInner />
    </Suspense>
  )
}
