'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, CheckCircle } from 'lucide-react'
import { useWallet } from '@/hooks/use-wallet'
import { formatCurrency } from '@/lib/currency'

function formatReceiptDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = String(hours % 12 || 12).padStart(2, '0')
  return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`
}

function WithdrawReceiptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate: mutateWallet } = useWallet()

  const transactionId = searchParams.get('transactionId') ?? ''
  const amountSatang = parseInt(searchParams.get('amount') ?? '0', 10)
  const recipientName = searchParams.get('recipientName') ?? ''
  const receiptDate = new Date()

  // Revalidate wallet balance on mount
  useEffect(() => {
    mutateWallet()
  }, [mutateWallet])

  // Guard: if no transaction ID, redirect
  useEffect(() => {
    if (!transactionId) {
      router.replace('/home')
    }
  }, [transactionId, router])

  if (!transactionId) return null

  function handleDone() {
    router.push('/home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      {/* Header with X close button — terminal screen */}
      <header className="sticky top-0 z-40">
        <div className="wave-status-bar h-11 safe-top" />
        <div className="wave-header-gradient px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Withdrawal</h1>
          <button
            type="button"
            onClick={handleDone}
            aria-label="Close receipt"
            className="p-1 -mr-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Receipt card */}
        <div className="mx-4 mt-4 bg-white rounded-xl border border-border p-4">
          {/* Success header */}
          <div className="flex flex-col items-center pb-4 border-b border-gray-100">
            <CheckCircle className="w-12 h-12 text-[#00C853] mb-2" />
            <p className="text-base font-bold text-[#00C853]">Completed</p>
            <p className="text-sm text-[#595959] mt-1">2C2P WAVE</p>
            <p className="text-xs text-[#595959] mt-1">
              {formatReceiptDate(receiptDate)}
            </p>
          </div>

          {/* Reference number */}
          <p className="text-xs text-[#595959] text-center mt-3">
            Ref: {transactionId}
          </p>

          {/* Details section */}
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#595959]">Type</span>
              <span className="text-sm font-bold text-foreground">Withdrawal</span>
            </div>

            {recipientName && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#595959]">Recipient</span>
                <span className="text-sm font-bold text-foreground text-right max-w-[180px] truncate">
                  {recipientName}
                </span>
              </div>
            )}

            <div className="border-t border-border my-2" />

            <div className="flex justify-between items-center">
              <span className="text-base text-[#595959]">Amount</span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(amountSatang, 'THB')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base text-[#595959]">Fee</span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(0, 'THB')}
              </span>
            </div>

            <div className="border-t border-border my-2" />

            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(amountSatang, 'THB')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Done CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={handleDone}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground text-base font-bold active:scale-[0.98] transition-transform"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default function WithdrawReceiptPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-muted items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#0091EA] border-t-transparent animate-spin" />
      </div>
    }>
      <WithdrawReceiptContent />
    </Suspense>
  )
}
