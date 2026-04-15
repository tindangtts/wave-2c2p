'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { BackHeader } from '@/components/layout/back-header'
import { useRegistrationStore } from '@/stores/registration-store'

export default function TermsPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const setConsent = useRegistrationStore((s) => s.setConsent)

  const [tcChecked, setTcChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const bothChecked = tcChecked && privacyChecked

  const handleAgree = async () => {
    if (!bothChecked || isLoading) return
    setIsLoading(true)
    setError('')

    const acceptedAt = new Date().toISOString()
    const version = '1.0'

    // Persist to store first (optimistic)
    setConsent(acceptedAt, version)

    try {
      const res = await fetch('/api/auth/register/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcAcceptedAt: acceptedAt, tcVersion: version }),
      })

      if (!res.ok) {
        // Non-fatal — store already updated, proceed anyway
        console.warn('Consent API failed, continuing with store-only persistence')
      }

      router.push('/register/daily-limit')
    } catch {
      // Non-fatal — proceed with local store
      router.push('/register/daily-limit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('compliance.terms.title')}
        onBack={() => router.back()}
      />

      <div className="flex-1 flex flex-col px-4 pt-6 pb-[64px]">
        {/* Scrollable T&C text area */}
        <div
          role="region"
          aria-label="Terms and Conditions text"
          className="overflow-y-auto border border-[#E0E0E0] rounded-xl p-4 animate-fade-in"
          style={{ maxHeight: 'calc(100vh - 380px)' }}
        >
          <p className="text-base text-[#212121] leading-relaxed">
            {/* Placeholder T&C body — production will load from CMS/static file */}
            By using 2C2P Wave, you agree to our{' '}
            <a href="#" className="text-[#0091EA] underline">
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#0091EA] underline">
              Privacy Policy
            </a>
            . These terms govern your use of the application and our cross-border remittance services between Thailand and Myanmar. Please read them carefully before proceeding.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="mt-6 flex flex-col gap-2 animate-fade-up stagger-3">
          {/* T&C checkbox */}
          <label className="flex items-start gap-3 py-3 cursor-pointer">
            <Checkbox
              id="tc-checkbox"
              checked={tcChecked}
              onCheckedChange={(v) => setTcChecked(v === true)}
              aria-required="true"
              aria-checked={tcChecked}
              className="mt-0.5 shrink-0"
            />
            <span className="text-base text-[#212121] leading-snug">
              {t('compliance.terms.checkbox1')}
            </span>
          </label>

          {/* Privacy checkbox */}
          <label className="flex items-start gap-3 py-3 cursor-pointer">
            <Checkbox
              id="privacy-checkbox"
              checked={privacyChecked}
              onCheckedChange={(v) => setPrivacyChecked(v === true)}
              aria-required="true"
              aria-checked={privacyChecked}
              className="mt-0.5 shrink-0"
            />
            <span className="text-base text-[#212121] leading-snug">
              {t('compliance.terms.checkbox2')}
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <p role="alert" aria-live="assertive" className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}

        <div className="flex-1" />
      </div>

      {/* Fixed bottom CTA */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleAgree}
          disabled={!bothChecked || isLoading}
          aria-disabled={!bothChecked || isLoading}
          className="w-full h-12 rounded-full bg-[#FFE600] text-[#212121] font-semibold text-base hover:bg-[#FFD600] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('cta.saving')}
            </>
          ) : (
            t('compliance.terms.cta')
          )}
        </Button>
      </div>
    </div>
  )
}
