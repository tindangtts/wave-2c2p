'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle2, XCircle } from 'lucide-react'

import { BackHeader } from '@/components/layout/back-header'
import { CameraOverlay } from '@/components/features/camera-overlay'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

type CaptureStep =
  | 'capture-front'
  | 'review-front'
  | 'capture-back'
  | 'review-back'
  | 'confirm'
  | 'submitted'

interface SubmitResult {
  success: boolean
  verificationId?: string
  error?: string
}

export default function WorkPermitUpdatePage() {
  const t = useTranslations('kyc')
  const router = useRouter()

  const [step, setStep] = useState<CaptureStep>('capture-front')
  const [frontImage, setFrontImage] = useState('')
  const [backImage, setBackImage] = useState('')
  const [tempImage, setTempImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mock-kyc/work-permit-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: 'work_permit' }),
      })
      const data = await res.json()
      setResult({
        success: data.success,
        verificationId: data.verification_id,
        error: data.rejection_reasons?.[0],
      })
      setStep('submitted')
    } catch {
      setResult({ success: false, error: t('workPermitUpdate.failBody') })
      setStep('submitted')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Capture front ---
  if (step === 'capture-front') {
    return (
      <>
        <CameraOverlay
          variant="document"
          instruction={t('workPermitUpdate.frontInstruction')}
          helper={t('capture.helper')}
          galleryLabel={t('capture.gallery')}
          onCapture={(imageData) => {
            setTempImage(imageData)
            setStep('review-front')
          }}
          onBack={() => setCancelDialogOpen(true)}
        />

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('workPermitUpdate.cancelDialog.title')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('workPermitUpdate.cancelDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelDialogOpen(false)}>
                {t('workPermitUpdate.cancelDialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/profile')}>
                {t('workPermitUpdate.cancelDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // --- Review front ---
  if (step === 'review-front') {
    return (
      <div className="flex flex-col min-h-screen">
        <BackHeader
          title={t('review.title')}
          onBack={() => {
            setTempImage('')
            setStep('capture-front')
          }}
        />
        <div className="flex flex-col flex-1 items-center px-4 pt-6 pb-8">
          <div className="w-full max-w-[300px] rounded-lg border-2 border-border overflow-hidden">
            {tempImage ? (
              <img
                src={tempImage}
                alt="Work permit front"
                className="w-full object-cover"
              />
            ) : (
              <div className="w-full aspect-[85.6/54] bg-secondary flex items-center justify-center">
                <p className="text-[#767676] text-sm">No image</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#595959] text-center mt-4">
            {t('review.hint')}
          </p>
          <div className="flex gap-4 mt-6 w-full max-w-[300px]">
            <Button
              variant="outline"
              onClick={() => {
                setTempImage('')
                setStep('capture-front')
              }}
              className="flex-1 h-12 rounded-full"
            >
              {t('review.retake')}
            </Button>
            <Button
              onClick={() => {
                setFrontImage(tempImage)
                setTempImage('')
                setStep('capture-back')
              }}
              className="flex-1 h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              {t('review.usePhoto')}
            </Button>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    )
  }

  // --- Capture back ---
  if (step === 'capture-back') {
    return (
      <CameraOverlay
        variant="document"
        instruction={t('workPermitUpdate.backInstruction')}
        helper={t('capture.helper')}
        galleryLabel={t('capture.gallery')}
        onCapture={(imageData) => {
          setTempImage(imageData)
          setStep('review-back')
        }}
        onBack={() => {
          setStep('review-front')
        }}
      />
    )
  }

  // --- Review back ---
  if (step === 'review-back') {
    return (
      <div className="flex flex-col min-h-screen">
        <BackHeader
          title={t('review.title')}
          onBack={() => {
            setTempImage('')
            setStep('capture-back')
          }}
        />
        <div className="flex flex-col flex-1 items-center px-4 pt-6 pb-8">
          <div className="w-full max-w-[300px] rounded-lg border-2 border-border overflow-hidden">
            {tempImage ? (
              <img
                src={tempImage}
                alt="Work permit back"
                className="w-full object-cover"
              />
            ) : (
              <div className="w-full aspect-[85.6/54] bg-secondary flex items-center justify-center">
                <p className="text-[#767676] text-sm">No image</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#595959] text-center mt-4">
            {t('review.hint')}
          </p>
          <div className="flex gap-4 mt-6 w-full max-w-[300px]">
            <Button
              variant="outline"
              onClick={() => {
                setTempImage('')
                setStep('capture-back')
              }}
              className="flex-1 h-12 rounded-full"
            >
              {t('review.retake')}
            </Button>
            <Button
              onClick={() => {
                setBackImage(tempImage)
                setTempImage('')
                setStep('confirm')
              }}
              className="flex-1 h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              {t('review.usePhoto')}
            </Button>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    )
  }

  // --- Confirm (submit) screen ---
  if (step === 'confirm') {
    return (
      <div className="flex flex-col min-h-screen">
        <BackHeader
          title={t('workPermitUpdate.title')}
          onBack={() => setStep('review-back')}
        />
        <div className="flex flex-col flex-1 items-center px-4 pt-6 pb-8">
          <p className="text-sm text-[#595959] text-center mb-6">
            {t('workPermitUpdate.subtitle')}
          </p>

          {/* Front + back thumbnails */}
          <div className="flex gap-4 w-full max-w-[320px] mb-8">
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs text-[#595959] text-center">
                {t('fields.documentFront')}
              </p>
              <div className="rounded-lg border-2 border-border overflow-hidden">
                <img
                  src={frontImage}
                  alt="Work permit front"
                  className="w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs text-[#595959] text-center">
                {t('fields.documentBack')}
              </p>
              <div className="rounded-lg border-2 border-border overflow-hidden">
                <img
                  src={backImage}
                  alt="Work permit back"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-[320px] h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90 font-semibold"
          >
            {isSubmitting
              ? t('workPermitUpdate.submittingLabel')
              : t('workPermitUpdate.submitCta')}
          </Button>

          <div className="flex-1" />
        </div>
      </div>
    )
  }

  // --- Submitted (result) screen ---
  if (step === 'submitted') {
    if (result?.success) {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center px-6 pb-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
          <h1 className="text-xl font-bold text-foreground text-center mb-3">
            {t('workPermitUpdate.successTitle')}
          </h1>
          <p className="text-sm text-[#595959] text-center mb-8">
            {t('workPermitUpdate.successBody')}
          </p>
          <Button
            onClick={() => router.push('/profile')}
            className="w-full max-w-[320px] h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90 font-semibold"
          >
            {t('workPermitUpdate.successCta')}
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 pb-12">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-xl font-bold text-foreground text-center mb-3">
          {t('workPermitUpdate.failTitle')}
        </h1>
        <p className="text-sm text-[#595959] text-center mb-8">
          {result?.error ?? t('workPermitUpdate.failBody')}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setResult(null)
            setFrontImage('')
            setBackImage('')
            setTempImage('')
            setStep('capture-front')
          }}
          className="w-full max-w-[320px] h-12 rounded-full"
        >
          {t('workPermitUpdate.failCta')}
        </Button>
      </div>
    )
  }

  return null
}
