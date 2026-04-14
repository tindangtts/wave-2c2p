'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { LanguageSelector } from '@/components/features/language-selector'

export default function LanguagePage() {
  const router = useRouter()
  const t = useTranslations('profile')
  const currentLocale = useLocale()

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('language.title')}
        onBack={() => router.push('/profile')}
      />
      <div className="flex-1 pt-6">
        <LanguageSelector currentLocale={currentLocale} />
      </div>
    </div>
  )
}
