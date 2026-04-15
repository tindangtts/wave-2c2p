'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ClipboardList, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackHeader } from '@/components/layout/back-header'

export default function PreRegInfoPage() {
  const router = useRouter()
  const t = useTranslations('auth')

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title=""
        onBack={() => router.push('/otp')}
      />

      <div className="flex-1 flex flex-col px-4 pt-8 pb-[64px] overflow-y-auto">
        {/* Focal icon */}
        <div className="flex justify-center mb-6 animate-fade-up stagger-1">
          <ClipboardList className="w-16 h-16 text-accent" aria-hidden="true" />
        </div>

        {/* Heading */}
        <h1 className="text-[20px] font-bold text-foreground text-center animate-fade-up stagger-1">
          {t('compliance.preReg.heading')}
        </h1>

        {/* Subtext */}
        <p className="text-base text-muted-foreground text-center mt-4 animate-fade-up stagger-2">
          {t('compliance.preReg.subtext')}
        </p>

        {/* Document checklist */}
        <ul className="mt-8 flex flex-col gap-4 animate-fade-up stagger-2" role="list">
          <li className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-accent shrink-0" aria-hidden="true" />
            <span className="text-base text-foreground">{t('compliance.preReg.doc1')}</span>
          </li>
          <li className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-accent shrink-0" aria-hidden="true" />
            <span className="text-base text-foreground">{t('compliance.preReg.doc2')}</span>
          </li>
        </ul>

        <div className="flex-1" />
      </div>

      {/* Fixed bottom CTA */}
      <div className="px-4 pb-8 mt-[48px]">
        <Button
          onClick={() => router.push('/register/terms')}
          className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-base hover:bg-primary/90"
        >
          {t('compliance.preReg.cta')}
        </Button>
      </div>
    </div>
  )
}
