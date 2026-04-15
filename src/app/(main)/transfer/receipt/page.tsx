'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { TransferReceipt } from '@/components/features/transfer-receipt'
import { useTransferStore } from '@/stores/transfer-store'
import { useP2PStore } from '@/stores/p2p-store'
import { useWallet } from '@/hooks/use-wallet'
import { convertSatangToPya } from '@/lib/currency'

function ReceiptPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isP2P = searchParams.get('type') === 'p2p'
  const t = useTranslations('transfer')
  const { mutate: mutateWallet, data: walletData } = useWallet()

  // Standard transfer store
  const {
    transactionId: stdTransactionId,
    amountSatang: stdAmountSatang,
    feeSatang: stdFeeSatang,
    rate: stdRate,
    channel: stdChannel,
    selectedRecipient,
    note,
    status: stdStatus,
    setStatus: stdSetStatus,
    reset: stdReset,
  } = useTransferStore()

  // P2P store
  const {
    transactionId: p2pTransactionId,
    amountSatang: p2pAmountSatang,
    status: p2pStatus,
    setStatus: p2pSetStatus,
    reset: p2pReset,
    receiverWalletId,
  } = useP2PStore()

  // Resolved values based on flow
  const transactionId = isP2P ? p2pTransactionId : stdTransactionId
  const amountSatang = isP2P ? p2pAmountSatang : stdAmountSatang
  const feeSatang = isP2P ? 0 : stdFeeSatang
  const rate = isP2P ? 1 : stdRate
  const channel = isP2P ? ('p2p' as const) : stdChannel
  const status = isP2P ? p2pStatus : stdStatus
  const setStatus = isP2P ? p2pSetStatus : stdSetStatus

  const [createdAt] = useState(() => new Date().toISOString())
  const [secretCode, setSecretCode] = useState<string | undefined>(undefined)

  // Guard: redirect if no transaction ID
  useEffect(() => {
    if (!transactionId) {
      router.replace('/home')
    }
  }, [transactionId, router])

  // Status polling: every 2s until completed/failed, max 60 attempts (2 min)
  useEffect(() => {
    if (!transactionId) return
    if (status === 'success' || status === 'failed') return

    let pollCount = 0
    const MAX_POLLS = 60
    const controller = new AbortController()

    const intervalId = setInterval(async () => {
      if (++pollCount > MAX_POLLS) {
        clearInterval(intervalId)
        setStatus('failed')
        return
      }
      try {
        const res = await fetch(`/api/mock-payment/status/${transactionId}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success' || data.status === 'failed' ||
              data.status === 'processing' || data.status === 'pending') {
            setStatus(data.status)
            // Capture secret_code from status response if present (cash_pickup)
            if (data.secret_code) {
              setSecretCode(data.secret_code)
            }
            if (data.status === 'success' || data.status === 'failed') {
              clearInterval(intervalId)
            }
          }
        }
      } catch {
        // Network error or abort — polling will retry
      }
    }, 2000)

    return () => {
      clearInterval(intervalId)
      controller.abort()
    }
  }, [transactionId, status, setStatus])

  const handleClose = useCallback(() => {
    if (isP2P) {
      p2pReset()
    } else {
      stdReset()
    }
    mutateWallet()
    router.push('/home')
  }, [isP2P, p2pReset, stdReset, mutateWallet, router])

  if (!transactionId) return null

  const convertedPya = isP2P ? 0 : convertSatangToPya(amountSatang, rate)
  const senderName = walletData?.profile?.first_name ?? 'You'
  const recipientName = isP2P ? receiverWalletId : (selectedRecipient?.full_name ?? '')

  return (
    <div className="flex flex-col min-h-screen bg-muted">
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
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
            <p className="text-base text-muted-foreground text-center">
              {t('status_processing')}
              {' — '}
              Processing your transfer...
            </p>
          </div>
        )}

        {/* Completed state: show full receipt */}
        {status === 'success' && channel && (isP2P || selectedRecipient) && (
          <TransferReceipt
            transactionId={transactionId}
            amount={amountSatang}
            fee={feeSatang}
            convertedPya={convertedPya}
            rate={rate}
            channel={channel}
            senderName={senderName}
            senderPhone=""
            recipientName={recipientName}
            recipientType={channel}
            note={isP2P ? undefined : (note || undefined)}
            createdAt={createdAt}
            secretCode={channel === 'cash_pickup' ? secretCode : undefined}
          />
        )}

        {/* Failed state */}
        {status === 'failed' && (
          <div className="flex flex-col items-center justify-center pt-16 px-4 text-center">
            <XCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-xl font-bold text-foreground">Transfer failed</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact support for assistance.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Close CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={handleClose}
          className="w-full h-14 rounded-full bg-primary text-foreground text-base font-bold active:scale-[0.98] transition-transform"
        >
          {t('cta_close')}
        </button>
      </div>
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense>
      <ReceiptPageInner />
    </Suspense>
  )
}
