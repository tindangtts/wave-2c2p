'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { TransferReceipt } from '@/components/features/transfer-receipt'
import { useTransferStore } from '@/stores/transfer-store'
import { useWallet } from '@/hooks/use-wallet'
import { convertSatangToPya } from '@/lib/currency'

export default function ReceiptPage() {
  const router = useRouter()
  const t = useTranslations('transfer')
  const { mutate: mutateWallet, data: walletData } = useWallet()

  const {
    transactionId,
    amountSatang,
    feeSatang,
    rate,
    channel,
    selectedRecipient,
    note,
    status,
    setStatus,
    reset,
  } = useTransferStore()

  const [createdAt] = useState(() => new Date().toISOString())

  // Guard: redirect if no transaction ID
  useEffect(() => {
    if (!transactionId) {
      router.replace('/home')
    }
  }, [transactionId, router])

  // Status polling: every 2s until completed or failed
  useEffect(() => {
    if (!transactionId) return
    if (status === 'completed' || status === 'failed') return

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/mock-payment/status/${transactionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'completed' || data.status === 'failed' ||
              data.status === 'processing' || data.status === 'pending') {
            setStatus(data.status)
            if (data.status === 'completed' || data.status === 'failed') {
              clearInterval(intervalId)
            }
          }
        }
      } catch {
        // Network error — polling will retry
      }
    }, 2000)

    return () => clearInterval(intervalId)
  }, [transactionId, status, setStatus])

  const handleClose = useCallback(() => {
    reset()
    mutateWallet()
    router.push('/home')
  }, [reset, mutateWallet, router])

  if (!transactionId) return null

  const convertedPya = convertSatangToPya(amountSatang, rate)
  const senderName = walletData?.profile?.first_name ?? 'You'

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* Header with close button instead of back */}
      <header className="sticky top-0 z-40">
        <div className="wave-status-bar h-11 safe-top" />
        <div className="wave-header-gradient px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">{t('title_receipt')}</h1>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close receipt"
            className="p-1 -mr-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Pending / Processing state */}
        {(status === 'pending' || status === 'processing') && (
          <div className="flex flex-col items-center justify-center pt-16 px-4">
            <div className="w-6 h-6 rounded-full border-2 border-[#0091EA] border-t-transparent animate-spin mb-4" />
            <p className="text-[16px] text-[#757575] text-center">
              {t('status_processing')}
              {' — '}
              Processing your transfer...
            </p>
          </div>
        )}

        {/* Completed state: show full receipt */}
        {status === 'completed' && channel && selectedRecipient && (
          <TransferReceipt
            transactionId={transactionId}
            amount={amountSatang}
            fee={feeSatang}
            convertedPya={convertedPya}
            rate={rate}
            channel={channel}
            senderName={senderName}
            senderPhone=""
            recipientName={selectedRecipient.full_name}
            recipientType={channel}
            note={note || undefined}
            createdAt={createdAt}
          />
        )}

        {/* Failed state */}
        {status === 'failed' && (
          <div className="flex flex-col items-center justify-center pt-16 px-4 text-center">
            <XCircle className="w-12 h-12 text-[#F44336] mb-4" />
            <p className="text-[20px] font-bold text-[#212121]">Transfer failed</p>
            <p className="text-[14px] text-[#757575] mt-2">
              Please contact support for assistance.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Close CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#FAFAFA] px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={handleClose}
          className="w-full h-14 rounded-full bg-[#FFE600] text-[#212121] text-[16px] font-bold active:scale-[0.98] transition-transform"
        >
          {t('cta_close')}
        </button>
      </div>
    </div>
  )
}
