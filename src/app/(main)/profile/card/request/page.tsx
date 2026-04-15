'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import { BackHeader } from '@/components/layout/back-header'
import { PasscodeSheet } from '@/components/features/passcode-sheet'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

// Display constants — not sent to API
const CARD_FEE_THB = 200
const PROCESSING_FEE_THB = 10
const TOTAL_THB = CARD_FEE_THB + PROCESSING_FEE_THB
const EXCHANGE_RATE = 133.0
const MMK_EQUIVALENT = Math.round(CARD_FEE_THB * EXCHANGE_RATE) // 26600

type Step = 'address' | 'confirm'

interface ResultModal {
  type: 'success' | 'fail'
  cardReference?: string
  error?: string
}

export default function CardRequestPage() {
  const router = useRouter()
  const t = useTranslations('profile')

  const [step, setStep] = useState<Step>('address')
  const [deliveryAddress, setDeliveryAddress] = useState<'current' | 'mailing'>('current')
  const [mailingAddressText, setMailingAddressText] = useState('')
  const [passcodeOpen, setPasscodeOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resultModal, setResultModal] = useState<ResultModal | null>(null)

  const isCtaDisabled = deliveryAddress === 'mailing' && mailingAddressText.trim() === ''

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const addressLine =
        deliveryAddress === 'current' ? 'Current Address' : mailingAddressText
      const res = await fetch('/api/mock-payment/visa-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_address: deliveryAddress,
          address_line: addressLine,
          amount_satang: 20000, // 200 THB
          fee_satang: 1000, // 10 THB
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResultModal({ type: 'success', cardReference: data.card_reference })
      } else {
        setResultModal({ type: 'fail', error: data.error })
      }
    } catch {
      setResultModal({ type: 'fail', error: t('card.request.failBody') })
    } finally {
      setIsLoading(false)
    }
  }

  const deliveryAddressLabel =
    deliveryAddress === 'current'
      ? t('card.request.currentAddress')
      : mailingAddressText || t('card.request.mailingAddress')

  return (
    <div className="flex flex-col min-h-screen bg-muted max-w-[430px] mx-auto">
      {/* Step: Address Selection */}
      {step === 'address' && (
        <>
          <BackHeader
            title={t('card.request.title')}
            onBack={() => router.back()}
          />

          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground">
              {t('card.request.subtitle')}
            </p>

            {/* Current Address option */}
            <button
              type="button"
              onClick={() => setDeliveryAddress('current')}
              className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-colors ${
                deliveryAddress === 'current'
                  ? 'border-wave-success'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t('card.request.currentAddress')}
                </span>
                {deliveryAddress === 'current' && (
                  <CheckCircle2 className="w-5 h-5 text-wave-success" />
                )}
              </div>
            </button>

            {/* Mailing Address option */}
            <div>
              <button
                type="button"
                onClick={() => setDeliveryAddress('mailing')}
                className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-colors ${
                  deliveryAddress === 'mailing'
                    ? 'border-wave-success'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t('card.request.mailingAddress')}
                  </span>
                  {deliveryAddress === 'mailing' && (
                    <CheckCircle2 className="w-5 h-5 text-wave-success" />
                  )}
                </div>
              </button>

              {/* Expanded textarea for mailing address */}
              {deliveryAddress === 'mailing' && (
                <textarea
                  value={mailingAddressText}
                  onChange={(e) => setMailingAddressText(e.target.value)}
                  placeholder={t('card.request.addressPlaceholder')}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              )}
            </div>

            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={() => setStep('confirm')}
                disabled={isCtaDisabled}
                className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-sm hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('card.request.confirmCta')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step: Confirmation */}
      {step === 'confirm' && (
        <>
          <BackHeader
            title={t('card.request.confirmTitle')}
            onBack={() => setStep('address')}
          />

          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 flex flex-col gap-4">
            {/* Fee summary card */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              {/* Card Fee */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('card.request.cardFee')}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {t('card.request.cardFeeValue')}
                </span>
              </div>

              <div className="border-t border-border my-3" />

              {/* Processing Fee */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('card.request.fee')}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {t('card.request.feeValue')}
                </span>
              </div>

              <div className="border-t border-border my-3" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {t('card.request.total')}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {TOTAL_THB} THB
                </span>
              </div>

              <div className="border-t border-border my-3" />

              {/* FX Rate */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('card.request.fxRate')}
                </span>
                <span className="text-xs font-medium text-foreground">
                  1 THB = {EXCHANGE_RATE} MMK
                </span>
              </div>

              <div className="border-t border-border my-3" />

              {/* MMK Equivalent */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('card.request.youReceive')}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {MMK_EQUIVALENT.toLocaleString()} MMK
                </span>
              </div>
            </div>

            {/* Delivery address row */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Delivery Address</span>
                <span className="text-xs font-medium text-foreground text-right max-w-[60%]">
                  {deliveryAddressLabel}
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={() => setPasscodeOpen(true)}
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-sm hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : t('card.request.confirmCta')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Passcode gate */}
      <PasscodeSheet
        open={passcodeOpen}
        onOpenChange={setPasscodeOpen}
        onVerified={handlePayment}
      />

      {/* Success modal */}
      <AlertDialog open={resultModal?.type === 'success'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('card.request.successTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('card.request.successBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {resultModal?.cardReference && (
            <div className="px-1 pb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-wave-success">
                {resultModal.cardReference}
              </span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => router.push('/profile/card')}
              className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-sm hover:bg-primary/90"
            >
              {t('card.request.successCta')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Failure modal */}
      <AlertDialog open={resultModal?.type === 'fail'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('card.request.failTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {resultModal?.error ?? t('card.request.failBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setResultModal(null)}
              className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-sm hover:bg-primary/90"
            >
              {t('card.request.failCta')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
