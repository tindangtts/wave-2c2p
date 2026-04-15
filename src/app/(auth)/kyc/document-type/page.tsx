'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CreditCard, FileText, FileCheck, Stamp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { BackHeader } from '@/components/layout/back-header'
import { StepIndicator } from '@/components/features/step-indicator'
import { DocumentTypeCard } from '@/components/features/document-type-card'
import { Button } from '@/components/ui/button'
import { useKYCStore } from '@/stores/kyc-store'
import type { DocumentType } from '@/lib/kyc/schemas'

const DOCUMENT_TYPES: { type: DocumentType; icon: LucideIcon }[] = [
  { type: 'national_id', icon: CreditCard },
  { type: 'work_permit', icon: FileText },
  { type: 'pink_card', icon: CreditCard },
  { type: 'owic', icon: FileCheck },
  { type: 'visa', icon: Stamp },
]

export default function DocumentTypePage() {
  const t = useTranslations('kyc')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType | ''>('')

  const { documentType, setDocumentType, setCaptureStep } = useKYCStore()

  // Hydration-safe: only read store values after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && documentType) {
      setSelectedType(documentType)
    }
  }, [mounted, documentType])

  const handleContinue = () => {
    if (!selectedType) return
    setDocumentType(selectedType as DocumentType)
    setCaptureStep('capture-front')
    router.push('/kyc/capture')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader title={t('title')} />
      <StepIndicator currentStep={1} totalSteps={5} namespace="kyc" />

      <div className="flex flex-col flex-1 px-4 pt-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('selectDocType.title')}
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          {t('selectDocType.subtitle')}
        </p>

        <div
          role="radiogroup"
          aria-label="Document type selection"
          className="flex flex-col gap-3"
        >
          {DOCUMENT_TYPES.map((dt) => (
            <DocumentTypeCard
              key={dt.type}
              type={dt.type}
              label={t(`docTypes.${dt.type}`)}
              icon={dt.icon}
              selected={selectedType === dt.type}
              onSelect={() => setSelectedType(dt.type)}
            />
          ))}
        </div>

        <div className="flex-1" />

        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          className="w-full h-12 rounded-full bg-primary text-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {t('cta.continue')}
        </Button>
      </div>
    </div>
  )
}
