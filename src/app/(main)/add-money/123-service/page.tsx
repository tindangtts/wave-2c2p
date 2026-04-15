'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Barcode from 'react-barcode'
import { format } from 'date-fns'
import { BackHeader } from '@/components/layout/back-header'
import { QRExpiryTimer } from '@/components/features/qr-expiry-timer'
import { useWallet } from '@/hooks/use-wallet'

interface BarcodeData {
  barcodeValue: string
  ref1: string
  ref2: string
  amount: number
  expiresAt: string
  channel: string
}

interface TopupResponse {
  transaction_id: string
  barcode_data: BarcodeData
  status: string
}

function Service123Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('wallet')
  const { mutate: mutateWallet } = useWallet()
  const amount = searchParams.get('amount') ?? '0'
  const [loading, setLoading] = useState(true)
  const [barcodeData, setBarcodeData] = useState<BarcodeData | null>(null)
  const [expired, setExpired] = useState(false)
  const hasFetched = useRef(false)

  const createTopup = useCallback(async () => {
    const amountSatang = parseInt(amount, 10)
    if (!amountSatang || amountSatang <= 0) {
      toast.error('Invalid amount.')
      router.replace('/add-money')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/mock-payment/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountSatang, channel: 'service_123' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string })?.error ?? 'Top-up request failed')
      }
      const data: TopupResponse = await res.json()
      setBarcodeData(data.barcode_data)
      setExpired(false)
    } catch {
      toast.error(t('errors.topupFailed'))
      router.replace('/add-money')
    } finally {
      setLoading(false)
    }
  }, [amount, router, t])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    createTopup()
  }, [createTopup])

  function handleGenerateNew() {
    hasFetched.current = false
    createTopup()
  }

  async function handleDone() {
    await mutateWallet()
    router.push('/add-money')
  }

  return (
    <div className="flex flex-col min-h-full">
      <BackHeader title={t('screenTitles.topup123Service')} />
      <div className="flex-1 px-4 py-6 flex flex-col gap-6">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-sm text-muted-foreground">Generating barcode...</p>
          </div>
        ) : barcodeData ? (
          <>
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 border border-border">
              <div className={expired ? 'opacity-40' : ''}>
                <Barcode
                  value={barcodeData.barcodeValue || '00000000000000000001'}
                  format="CODE128"
                  width={2}
                  height={80}
                  displayValue={false}
                  background="transparent"
                />
              </div>
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref.1</span>
                  <span className="font-medium text-foreground font-mono">{barcodeData.ref1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref.2</span>
                  <span className="font-medium text-foreground font-mono">{barcodeData.ref2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labels.amountThb')}</span>
                  <span className="font-bold text-foreground">{barcodeData.amount.toFixed(2)} THB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('labels.pleasePayBefore')}</span>
                  <span className="font-medium text-foreground text-xs">
                    {format(new Date(barcodeData.expiresAt), 'dd MMM yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </div>
            {!expired ? (
              <QRExpiryTimer expiresAt={barcodeData.expiresAt} onExpired={() => setExpired(true)} />
            ) : (
              <p className="text-xs font-bold text-center text-destructive">{t('errors.barcodeExpired')}</p>
            )}
          </>
        ) : null}
        <div className="mt-auto flex flex-col gap-3">
          {expired && (
            <button
              type="button"
              onClick={handleGenerateNew}
              className="w-full h-14 rounded-full bg-primary text-foreground font-semibold text-base active:opacity-80 transition-opacity"
            >
              {t('ctas.generateNewBarcode')}
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

export default function AddMoney123ServicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-full">
          <BackHeader title="123 Service" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        </div>
      }
    >
      <Service123Content />
    </Suspense>
  )
}
