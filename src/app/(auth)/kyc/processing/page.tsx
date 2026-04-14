'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { ProcessingSteps } from '@/components/features/processing-steps'
import { useKYCStore } from '@/stores/kyc-store'

type StepStatus = 'pending' | 'active' | 'complete'

export default function ProcessingPage() {
  const t = useTranslations('kyc')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([
    'pending',
    'pending',
    'pending',
  ])
  const [submitted, setSubmitted] = useState(false)

  const { documentType, frontImage, backImage, selfieImage, setSubmissionResult } =
    useKYCStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const submitToApi = useCallback(async () => {
    if (submitted) return
    setSubmitted(true)

    try {
      const response = await fetch('/api/mock-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: documentType,
          front_image: frontImage,
          back_image: backImage,
          selfie_image: selfieImage,
        }),
      })

      const data = await response.json()

      setSubmissionResult({
        kycStatus: data.status || 'pending',
        rejectionReasons: data.rejection_reasons || [],
        submissionId: data.verification_id || '',
      })

      router.push('/kyc/status')
    } catch {
      // On error, set pending and navigate to status
      setSubmissionResult({
        kycStatus: 'pending',
        rejectionReasons: [],
        submissionId: '',
      })
      router.push('/kyc/status')
    }
  }, [
    submitted,
    documentType,
    frontImage,
    backImage,
    selfieImage,
    setSubmissionResult,
    router,
  ])

  // Animation sequence: step through 3 stages over ~3 seconds
  useEffect(() => {
    if (!mounted) return

    // Step 0: activate first step immediately
    setStepStatuses(['active', 'pending', 'pending'])

    const t1 = setTimeout(() => {
      setStepStatuses(['complete', 'active', 'pending'])
    }, 1000)

    const t2 = setTimeout(() => {
      setStepStatuses(['complete', 'complete', 'active'])
    }, 2000)

    const t3 = setTimeout(() => {
      setStepStatuses(['complete', 'complete', 'complete'])
    }, 3000)

    // Submit after animation completes
    const t4 = setTimeout(() => {
      submitToApi()
    }, 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [mounted, submitToApi])

  // Prevent back navigation during processing
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (!mounted) return null

  const steps = [
    { label: t('processing.steps.document'), status: stepStatuses[0] },
    { label: t('processing.steps.identity'), status: stepStatuses[1] },
    { label: t('processing.steps.face'), status: stepStatuses[2] },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <Loader2 className="w-12 h-12 text-[#FFE600] animate-spin mb-6" />

      <h1 className="text-xl font-bold text-foreground text-center mb-2">
        {t('processing.title')}
      </h1>

      <p className="text-base text-[#595959] text-center mb-8">
        {t('processing.subtitle')}
      </p>

      <ProcessingSteps steps={steps} />
    </div>
  )
}
