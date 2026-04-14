'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { BackHeader } from '@/components/layout/back-header'
import { KYCStatusCard } from '@/components/features/kyc-status-card'
import { Button } from '@/components/ui/button'
import { useKYCStore } from '@/stores/kyc-store'

export default function KYCStatusPage() {
  const t = useTranslations('kyc')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const { kycStatus, rejectionReasons, submissionId, documentType } =
    useKYCStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-redirect on approval (per D-12)
  useEffect(() => {
    if (!mounted) return
    if (kycStatus === 'approved') {
      const timer = setTimeout(() => {
        router.push('/home')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [mounted, kycStatus, router])

  if (!mounted) return null

  const statusKey = kycStatus === 'not_started' ? 'pending' : kycStatus
  const submittedDate = new Date().toLocaleDateString()

  const handleBack = () => {
    if (kycStatus === 'approved') {
      router.push('/home')
    } else {
      router.back()
    }
  }

  const isModalState = statusKey === 'rejected' || statusKey === 'expired'

  return (
    <div className={`flex flex-col min-h-screen ${isModalState ? 'bg-gradient-to-b from-[#FFE600]/30 to-white' : ''}`}>
      {!isModalState && (
        <BackHeader
          title={t(`status.${statusKey}.title`)}
          onBack={handleBack}
        />
      )}

      <div className={`flex flex-col flex-1 items-center px-4 pb-8 ${isModalState ? 'justify-center' : 'pt-8'}`}>
        <KYCStatusCard
          status={statusKey as 'pending' | 'approved' | 'rejected' | 'expired'}
          submittedAt={submittedDate}
          documentType={documentType || undefined}
          verificationId={submissionId || undefined}
          rejectionReasons={
            rejectionReasons.length > 0 ? rejectionReasons : undefined
          }
        />

        {/* Auto-redirect announcement for screen readers */}
        {kycStatus === 'approved' && (
          <div aria-live="assertive" className="sr-only">
            {t('status.approved.redirect')}
          </div>
        )}

        <div className="flex-1" />

        {/* Action area based on status */}
        <div className="w-full mt-6">
          {kycStatus === 'approved' && (
            <Button
              onClick={() => router.push('/home')}
              className="w-full h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              {t('status.approved.cta')}
            </Button>
          )}

          {kycStatus === 'rejected' && (
            <Button
              onClick={() => router.push('/kyc/resubmit')}
              className="w-full h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              {t('status.rejected.cta')}
            </Button>
          )}

          {(kycStatus === 'pending' || kycStatus === 'not_started') && (
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full h-12 rounded-full"
              >
                {t('status.pending.cta')}
              </Button>
              <p className="text-xs text-[#595959] mt-2 text-center">
                {t('status.pending.note')}
              </p>
            </div>
          )}

          {kycStatus === 'expired' && (
            <Button
              onClick={() => router.push('/kyc/document-type')}
              className="w-full h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              {t('status.expired.cta')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
