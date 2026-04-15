'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'

import { BackHeader } from '@/components/layout/back-header'
import { FieldStatusRow } from '@/components/features/field-status-row'
import { CameraOverlay } from '@/components/features/camera-overlay'
import { Button } from '@/components/ui/button'
import { useKYCStore } from '@/stores/kyc-store'

type RetakeField = 'front' | 'back' | 'selfie' | null

export default function ResubmitPage() {
  const t = useTranslations('kyc')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [retakeMode, setRetakeMode] = useState<RetakeField>(null)
  const [retakenFront, setRetakenFront] = useState(false)
  const [retakenBack, setRetakenBack] = useState(false)
  const [retakenSelfie, setRetakenSelfie] = useState(false)

  const {
    rejectionReasons,
    setFrontImage,
    setBackImage,
    setSelfieImage,
    setCaptureStep,
  } = useKYCStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which fields are rejected based on rejection reasons
  const fieldStatuses = useMemo(() => {
    const reasons = rejectionReasons.join(' ').toLowerCase()

    // Simple heuristic based on rejection reason keywords
    const frontRejected =
      reasons.includes('document') ||
      reasons.includes('blurry') ||
      reasons.includes('unreadable') ||
      reasons.includes('expired') ||
      reasons.includes('name')
    const selfieRejected =
      reasons.includes('face') || reasons.includes('photo')

    // If no specific match, mark front as rejected (ensures at least one needs retake)
    const hasSomeRejection = frontRejected || selfieRejected

    return {
      front: frontRejected || !hasSomeRejection ? 'rejected' : 'accepted',
      back: frontRejected || !hasSomeRejection ? 'rejected' : 'accepted',
      selfie: selfieRejected ? 'rejected' : 'accepted',
    } as const
  }, [rejectionReasons])

  if (!mounted) return null

  // Camera retake mode
  if (retakeMode) {
    const isSelfie = retakeMode === 'selfie'
    return (
      <CameraOverlay
        variant={isSelfie ? 'selfie' : 'document'}
        instruction={
          isSelfie
            ? t('face.instruction')
            : retakeMode === 'front'
              ? t('capture.frontInstruction')
              : t('capture.backInstruction')
        }
        helper={isSelfie ? t('face.helper') : t('capture.helper')}
        galleryLabel={t('capture.gallery')}
        onCapture={(imageData) => {
          if (retakeMode === 'front') {
            setFrontImage(imageData)
            setRetakenFront(true)
          } else if (retakeMode === 'back') {
            setBackImage(imageData)
            setRetakenBack(true)
          } else if (retakeMode === 'selfie') {
            setSelfieImage(imageData)
            setRetakenSelfie(true)
          }
          setRetakeMode(null)
        }}
        onBack={() => setRetakeMode(null)}
      />
    )
  }

  // Check if all rejected fields have been re-captured
  const allRetaken =
    (fieldStatuses.front === 'accepted' || retakenFront) &&
    (fieldStatuses.back === 'accepted' || retakenBack) &&
    (fieldStatuses.selfie === 'accepted' || retakenSelfie)

  const handleResubmit = () => {
    setCaptureStep('processing')
    router.push('/kyc/processing')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('resubmit.title')}
        onBack={() => router.push('/kyc/status')}
      />

      <div className="flex flex-col flex-1 px-4 pt-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('resubmit.sectionTitle')}
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          {t('resubmit.subtitle')}
        </p>

        {/* Field status list */}
        <div className="flex flex-col gap-3">
          <FieldStatusRow
            label={t('fields.documentFront')}
            status={
              fieldStatuses.front === 'rejected' && retakenFront
                ? 'accepted'
                : fieldStatuses.front
            }
            onRetake={
              fieldStatuses.front === 'rejected' && !retakenFront
                ? () => setRetakeMode('front')
                : undefined
            }
          />
          <FieldStatusRow
            label={t('fields.documentBack')}
            status={
              fieldStatuses.back === 'rejected' && retakenBack
                ? 'accepted'
                : fieldStatuses.back
            }
            onRetake={
              fieldStatuses.back === 'rejected' && !retakenBack
                ? () => setRetakeMode('back')
                : undefined
            }
          />
          <FieldStatusRow
            label={t('fields.selfie')}
            status={
              fieldStatuses.selfie === 'rejected' && retakenSelfie
                ? 'accepted'
                : fieldStatuses.selfie
            }
            onRetake={
              fieldStatuses.selfie === 'rejected' && !retakenSelfie
                ? () => setRetakeMode('selfie')
                : undefined
            }
          />
        </div>

        {/* Rejection reasons summary */}
        {rejectionReasons.length > 0 && (
          <div className="mt-6">
            {rejectionReasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#FF9800] mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">{reason}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1" />

        <Button
          onClick={handleResubmit}
          disabled={!allRetaken}
          className="w-full h-12 rounded-full bg-primary text-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {t('resubmit.cta')}
        </Button>
      </div>
    </div>
  )
}
