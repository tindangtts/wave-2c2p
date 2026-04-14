'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { RateTimer } from '@/components/features/rate-timer'
import { PasscodeSheet } from '@/components/features/passcode-sheet'
import { useTransferStore } from '@/stores/transfer-store'
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

export default function ConfirmPage() {
  const router = useRouter()
  const { mutate: mutateWallet, data: walletData } = useWallet()

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

  const [passcodeOpen, setPasscodeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Guard: redirect if no channel selected
  if (!channel || !selectedRecipient) {
    if (typeof window !== 'undefined') {
      router.replace('/transfer/channel')
    }
    return null
  }

  const convertedPya = convertSatangToPya(amountSatang, rate)
  const totalSatang = amountSatang + feeSatang

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
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Transfer failed. Please try again.')
        return
      }

      setTransactionId(data.transfer.reference_number)
      setStatus('pending')
      mutateWallet()
      router.push('/transfer/receipt')
    } catch {
      toast.error('Connection error. Please check your internet and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <BackHeader title="Confirmation" />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {/* Transfer summary header */}
        <div className="text-center">
          <p className="text-[12px] text-[#757575]">Transfer</p>
          <p className="text-[28px] font-bold text-[#212121] mt-1">
            {formatCurrency(amountSatang, 'THB')}
          </p>
          <p className="text-[16px] text-[#757575] mt-1">
            {formatCurrency(convertedPya, 'MMK')}
          </p>
        </div>

        {/* Rate lock timer */}
        <div className="mt-3 flex justify-center">
          {rateValidUntil && (
            <RateTimer validUntil={rateValidUntil} onExpired={handleRateExpired} />
          )}
        </div>

        {/* Sender / Receiver card */}
        <div className="mt-4 bg-white rounded-xl border border-[#E0E0E0] p-4">
          {/* Sender */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
              <span className="text-[16px] font-bold text-[#212121]">
                {getInitials(senderName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#212121] truncate">{senderName}</p>
              {senderPhone && (
                <p className="text-[12px] text-[#757575]">{senderPhone}</p>
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
              <span className="text-[16px] font-bold text-[#212121]">
                {getInitials(selectedRecipient.full_name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[#212121] truncate">
                {selectedRecipient.full_name}
              </p>
              <p className="text-[12px] text-[#757575] capitalize">
                {channel.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Fee breakdown card */}
        <div className="mt-4 bg-white rounded-xl border border-[#E0E0E0] p-4">
          {/* Amount row */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#757575]">Amount</span>
            <span className="text-[16px] font-bold text-[#212121]">
              {formatCurrency(amountSatang, 'THB')}
            </span>
          </div>

          {/* Fee row */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[16px] text-[#757575]">Fee</span>
            <span className="text-[16px] font-bold text-[#F44336]">
              {formatCurrency(feeSatang, 'THB')}
            </span>
          </div>

          {/* Separator */}
          <div className="border-t border-[#E0E0E0] my-3" />

          {/* Total row */}
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-bold text-[#212121]">Total</span>
            <span className="text-[20px] font-bold text-[#212121]">
              {formatCurrency(totalSatang, 'THB')}
            </span>
          </div>
        </div>

        {/* Note field */}
        <div className="mt-4">
          <label htmlFor="transfer-note" className="block text-[16px] text-[#212121] mb-2">
            Note (optional)
          </label>
          <textarea
            id="transfer-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for your recipient..."
            className="w-full rounded-xl border border-[#E0E0E0] px-3 py-2 text-[14px] text-[#212121] placeholder:text-[#9E9E9E] focus:border-[#0091EA] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#FAFAFA] px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => setPasscodeOpen(true)}
          className="w-full h-14 rounded-full bg-[#FFE600] text-[#212121] text-[16px] font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
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
    </div>
  )
}
