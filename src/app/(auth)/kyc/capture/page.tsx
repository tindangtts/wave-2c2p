'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { BackHeader } from '@/components/layout/back-header'
import { StepIndicator } from '@/components/features/step-indicator'
import { CameraOverlay } from '@/components/features/camera-overlay'
import { Button } from '@/components/ui/button'
import { useKYCStore } from '@/stores/kyc-store'
import type { CaptureStep } from '@/stores/kyc-store'

function getStepNumber(captureStep: CaptureStep): number {
  switch (captureStep) {
    case 'capture-front':
    case 'review-front':
      return 2
    case 'capture-back':
    case 'review-back':
      return 3
    case 'capture-selfie':
    case 'review-selfie':
      return 4
    default:
      return 2
  }
}

function getBackStep(captureStep: CaptureStep): CaptureStep | 'document-type' {
  switch (captureStep) {
    case 'capture-front':
      return 'document-type'
    case 'review-front':
      return 'capture-front'
    case 'capture-back':
      return 'review-front'
    case 'review-back':
      return 'capture-back'
    case 'capture-selfie':
      return 'review-back'
    case 'review-selfie':
      return 'capture-selfie'
    default:
      return 'document-type'
  }
}

export default function CapturePage() {
  const t = useTranslations('kyc')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [tempImage, setTempImage] = useState('')

  const {
    captureStep,
    setCaptureStep,
    setFrontImage,
    setBackImage,
    setSelfieImage,
    frontImage,
    backImage,
    selfieImage,
  } = useKYCStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleBack = () => {
    const backStep = getBackStep(captureStep)
    if (backStep === 'document-type') {
      router.push('/(auth)/kyc/document-type')
    } else {
      setCaptureStep(backStep)
      setTempImage('')
    }
  }

  const handleCapture = (imageData: string) => {
    setTempImage(imageData)
    // Move to review state
    if (captureStep === 'capture-front') setCaptureStep('review-front')
    else if (captureStep === 'capture-back') setCaptureStep('review-back')
    else if (captureStep === 'capture-selfie') setCaptureStep('review-selfie')
  }

  const handleRetake = () => {
    setTempImage('')
    if (captureStep === 'review-front') setCaptureStep('capture-front')
    else if (captureStep === 'review-back') setCaptureStep('capture-back')
    else if (captureStep === 'review-selfie') setCaptureStep('capture-selfie')
  }

  const handleUsePhoto = () => {
    if (captureStep === 'review-front') {
      setFrontImage(tempImage)
      setTempImage('')
      setCaptureStep('capture-back')
    } else if (captureStep === 'review-back') {
      setBackImage(tempImage)
      setTempImage('')
      setCaptureStep('capture-selfie')
    } else if (captureStep === 'review-selfie') {
      setSelfieImage(tempImage)
      setTempImage('')
      setCaptureStep('processing')
      router.push('/(auth)/kyc/processing')
    }
  }

  // Camera capture screens
  if (
    captureStep === 'capture-front' ||
    captureStep === 'capture-back' ||
    captureStep === 'capture-selfie'
  ) {
    const isSelfie = captureStep === 'capture-selfie'
    const instruction = isSelfie
      ? t('face.instruction')
      : captureStep === 'capture-front'
        ? t('capture.frontInstruction')
        : t('capture.backInstruction')
    const helper = isSelfie ? t('face.helper') : t('capture.helper')

    return (
      <div className="relative">
        <CameraOverlay
          variant={isSelfie ? 'selfie' : 'document'}
          instruction={instruction}
          helper={helper}
          galleryLabel={t('capture.gallery')}
          onCapture={handleCapture}
          onBack={handleBack}
        />
        {/* Step indicator overlay on dark background */}
        <div className="fixed top-20 left-0 right-0 z-50">
          <StepIndicator
            currentStep={getStepNumber(captureStep)}
            totalSteps={5}
            variant="dark"
            namespace="kyc"
          />
        </div>
      </div>
    )
  }

  // Review screens
  if (
    captureStep === 'review-front' ||
    captureStep === 'review-back' ||
    captureStep === 'review-selfie'
  ) {
    const imageToShow =
      tempImage ||
      (captureStep === 'review-front'
        ? frontImage
        : captureStep === 'review-back'
          ? backImage
          : selfieImage)

    return (
      <div className="flex flex-col min-h-screen">
        <BackHeader title={t('review.title')} onBack={handleRetake} />

        <div className="flex flex-col flex-1 items-center px-4 pt-6 pb-8">
          {/* Image preview */}
          <div className="w-full max-w-[300px] rounded-lg border-2 border-[#E0E0E0] overflow-hidden">
            {imageToShow ? (
              <img
                src={imageToShow}
                alt="Captured document"
                className="w-full object-cover"
              />
            ) : (
              <div className="w-full aspect-[85.6/54] bg-[#F5F5F5] flex items-center justify-center">
                <p className="text-[#9E9E9E] text-sm">No image</p>
              </div>
            )}
          </div>

          <p className="text-xs text-[#757575] text-center mt-4">
            {t('review.hint')}
          </p>

          <div className="flex gap-4 mt-6 w-full max-w-[300px]">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="flex-1 h-12 rounded-full"
            >
              {t('review.retake')}
            </Button>
            <Button
              onClick={handleUsePhoto}
              className="flex-1 h-12 rounded-full bg-[#FFE600] text-[#212121] hover:bg-[#FFE600]/90"
            >
              {t('review.usePhoto')}
            </Button>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    )
  }

  // Fallback — redirect to document type if invalid state
  return null
}
