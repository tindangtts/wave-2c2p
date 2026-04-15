'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { QRDisplay } from '@/components/features/qr-display'
import { QRExpiryTimer } from '@/components/features/qr-expiry-timer'
import { useWallet } from '@/hooks/use-wallet'

interface QRData {
  paymentCode: string
  amount: number // baht
  merchantName: string
  expiresAt: string
  channel: string
  referenceNumber: string
}

interface TopupResponse {
  transaction_id: string
  qr_data: QRData
  status: string
}

export default function AddMoneyQRPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('wallet')
  const { mutate: mutateWallet } = useWallet()

  const channel = searchParams.get('channel') ?? ''
  const amount = searchParams.get('amount') ?? '0' // satang

  const [loading, setLoading] = useState(true)
  const [qrData, setQRData] = useState<QRData | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const hasFetched = useRef(false)

  const handleExpired = useCallback(() => {
    setExpired(true)
  }, [])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const amountSatang = parseInt(amount, 10)
    if (!channel || isNaN(amountSatang) || amountSatang <= 0) {
      toast.error('Invalid top-up parameters.')
      router.replace('/add-money')
      return
    }

    async function createTopup() {
      try {
        const res = await fetch('/api/mock-payment/topup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountSatang, channel }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error ?? 'Top-up request failed')
        }

        const data: TopupResponse = await res.json()
        setQRData(data.qr_data)
        setTransactionId(data.transaction_id)
      } catch (err) {
        toast.error(t('errors.topupFailed'))
        router.replace('/add-money')
      } finally {
        setLoading(false)
      }
    }

    createTopup()
  }, [amount, channel, router, t])

  async function handleGenerateNew() {
    setExpired(false)
    setLoading(true)
    setQRData(null)
    hasFetched.current = false

    const amountSatang = parseInt(amount, 10)
    try {
      const res = await fetch('/api/mock-payment/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountSatang, channel }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? 'Top-up request failed')
      }

      const data: TopupResponse = await res.json()
      setQRData(data.qr_data)
      setTransactionId(data.transaction_id)
    } catch {
      toast.error(t('errors.topupFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDone() {
    await mutateWallet()
    router.push('/add-money')
  }

  return (
    <div className="flex flex-col min-h-full">
      <BackHeader title={t('screenTitles.topupWithQr')} />

      <div className="flex-1 px-4 py-6 flex flex-col gap-6">
        {/* QR area */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        ) : qrData ? (
          <>
            <QRDisplay
              paymentCode={qrData.paymentCode}
              amount={qrData.amount}
              merchantName={qrData.merchantName}
              expiresAt={qrData.expiresAt}
              expired={expired}
            />

            {!expired ? (
              <QRExpiryTimer expiresAt={qrData.expiresAt} onExpired={handleExpired} />
            ) : (
              <p className="text-xs font-bold text-center text-destructive">
                {t('errors.qrExpired')}
              </p>
            )}
          </>
        ) : null}

        {/* CTA group */}
        <div className="mt-auto flex flex-col gap-3">
          {expired ? (
            <button
              type="button"
              onClick={handleGenerateNew}
              className="w-full h-14 rounded-full bg-primary text-foreground font-semibold text-base active:opacity-80 transition-opacity"
            >
              {t('ctas.generateNewQr')}
            </button>
          ) : (
            <button
              type="button"
              className="w-full h-14 rounded-full border border-accent text-accent font-semibold text-base active:bg-brand-blue-light transition-colors"
            >
              {t('ctas.viewInstructions')}
            </button>
          )}

          <button
            type="button"
            onClick={handleDone}
            className="w-full h-14 rounded-full bg-primary text-foreground font-semibold text-base active:opacity-80 transition-opacity"
          >
            {t('ctas.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
