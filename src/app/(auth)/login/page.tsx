'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { phoneSchema } from '@/lib/auth/schemas'
import { useRegistrationStore } from '@/stores/registration-store'

const LOCALES = [
  { code: 'en', label: 'English', flag: '🌐' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'mm', label: 'မြန်မာ', flag: '🇲🇲' },
] as const

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const { setPhone: storeSetPhone } = useRegistrationStore()

  const [countryCode, setCountryCode] = useState<'+66' | '+95'>('+66')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  // Read current locale from cookie
  const [currentLocale, setCurrentLocale] = useState('en')
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
    if (match?.[1]) setCurrentLocale(match[1])
  }, [])

  function handleLocaleChange(code: string | null) {
    if (!code) return
    setCurrentLocale(code)
    document.cookie = `locale=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    router.refresh()
  }

  // Minimum digit thresholds per country code
  const minDigits = countryCode === '+66' ? 9 : 7
  const digits = phone.replace(/\D/g, '')
  const isCtaEnabled = digits.length >= minDigits && !isLoading

  function validatePhone() {
    const result = phoneSchema.safeParse({ phone, countryCode })
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? t('errors.phoneInvalid')
      setError(msg)
      return false
    }
    setError('')
    return true
  }

  function handleBlur() {
    if (touched) validatePhone()
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(e.target.value)
    setTouched(true)
    if (error) {
      // Re-validate inline on change once error is already visible
      const result = phoneSchema.safeParse({ phone: e.target.value, countryCode })
      if (result.success) setError('')
    }
  }

  function handleCountryChange(value: string | null) {
    if (!value) return
    const cc = value as '+66' | '+95'
    setCountryCode(cc)
    setError('')
    // Re-validate if phone already entered
    if (touched && phone) {
      const result = phoneSchema.safeParse({ phone, countryCode: cc })
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? t('errors.phoneInvalid'))
      }
    }
  }

  async function handleSubmit() {
    setTouched(true)
    if (!validatePhone()) return

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'permanently_rejected') {
          setIsRejected(true)
          return
        }
        setError(data.error ?? t('errors.generic'))
        return
      }

      // Store phone in registration store for use across the flow
      storeSetPhone(phone, countryCode)

      const encodedPhone = encodeURIComponent(phone)
      router.push(`/otp?phone=${encodedPhone}&cc=${encodeURIComponent(countryCode)}`)
    } catch {
      setError(t('errors.generic'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Status bar */}
      <div className="h-11 safe-top" />

      <div className="flex-1 flex flex-col px-4 pt-4 pb-8">
        {/* Top row: back arrow + language selector pill */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Language selector — design: rounded pill with blue border */}
          <Select value={currentLocale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-auto h-8 gap-1.5 rounded-full border-[#026fa2] border-[0.5px] bg-white px-3 text-xs shadow-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" stroke="#026fa2" strokeWidth="2"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="#026fa2" strokeWidth="2"/>
              </svg>
              <SelectValue />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M6 9l6 6 6-6" stroke="#026fa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((loc) => (
                <SelectItem key={loc.code} value={loc.code}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-foreground">{t('login.title')}</h1>
        <p className="text-base text-[#595959] mt-2">{t('login.subtitle')}</p>

        {/* Phone Number field group — card wrapper per design */}
        <div className="mt-8 bg-secondary rounded-2xl p-4">
          <Label
            htmlFor="phone-input"
            className="text-xs text-[#595959] mb-2 block"
          >
            {t('login.phoneLabel')}
          </Label>

          <div className="flex items-center gap-2">
            <Select
              value={countryCode}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger
                className="w-[120px] h-10 bg-transparent border-none shadow-none text-base font-medium"
                aria-label={t('login.phoneLabel')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+66" aria-label="Thailand +66">
                  🇹🇭 TH(+66)
                </SelectItem>
                <SelectItem value="+95" aria-label="Myanmar +95">
                  🇲🇲 MM(+95)
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={t('login.phonePlaceholder')}
              value={phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              aria-label={t('login.phoneLabel')}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'phone-error' : undefined}
              className="flex-1 h-10 bg-transparent border-none shadow-none text-base"
            />
          </div>
        </div>

        {/* Hint text */}
        <p className="text-xs text-[#767676] text-center mt-2">
          {countryCode === '+66' ? 'Example +66 9xxx' : 'Example +95 9xxx'}
        </p>

        {error && (
          <p
            id="phone-error"
            role="alert"
            className="text-xs text-destructive mt-1 text-center"
          >
            {error}
          </p>
        )}

        {/* Push CTA to bottom */}
        <div className="flex-1" />

        {/* CTA — design: gradient shadow rounded button */}
        <Button
          onClick={handleSubmit}
          disabled={!isCtaEnabled}
          aria-busy={isLoading}
          className="w-full h-12 rounded-full bg-gradient-to-b from-[#F5F5F5] to-[#E0E0E0] text-[#0091EA] font-semibold text-base shadow-sm hover:from-[#EEEEEE] hover:to-[#D6D6D6] disabled:opacity-50 border border-border"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('cta.sendingOtp')}
            </>
          ) : (
            t('login.submitButton')
          )}
        </Button>

        {/* Sample account info */}
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={() => { setCountryCode('+66'); setPhone('992345678'); setTouched(true) }}
            className="mt-3 mx-auto px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700"
          >
            Demo: +66 992345678
          </button>
        )}

        {/* Need Help link — design: yellow icon + blue text */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-lg">💬</span>
          <span className="text-sm font-medium text-[#0091EA]">
            {t('login.helpLink')}
          </span>
        </div>
      </div>

      {/* AUTH-04: Rejection modal — shown when permanently_rejected=true */}
      <AlertDialog open={isRejected}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-sm mx-4 p-6 text-center">
          <div className="flex flex-col items-center">
            <XCircle className="w-12 h-12 mb-4 mx-auto" style={{ color: '#F44336' }} />
            <AlertDialogTitle className="text-xl font-bold text-foreground mb-2">
              Registration is Rejected
            </AlertDialogTitle>
            <p className="text-xs font-normal text-[#595959] mb-6">
              Sorry, Your profile is rejected. For more information please contact support.
            </p>
            <AlertDialogAction
              onClick={() => setIsRejected(false)}
              className="w-full h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
            >
              Ok
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
