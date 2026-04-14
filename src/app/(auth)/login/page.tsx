'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
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
import { phoneSchema } from '@/lib/auth/schemas'
import { useRegistrationStore } from '@/stores/registration-store'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const { setPhone: storeSetPhone } = useRegistrationStore()

  const [countryCode, setCountryCode] = useState<'+66' | '+95'>('+66')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      <div className="wave-status-bar h-11 safe-top" />

      <div className="flex-1 flex flex-col px-4 pt-12 pb-8">
        {/* Heading */}
        <h1 className="text-xl font-bold text-[#212121]">{t('login.title')}</h1>
        <p className="text-base text-[#757575] mt-2">{t('login.subtitle')}</p>

        {/* Phone Number field group */}
        <div className="mt-8">
          <Label
            htmlFor="phone-input"
            className="text-base text-[#212121] mb-2 block"
          >
            {t('login.phoneLabel')}
          </Label>

          <div className="flex gap-2">
            <Select
              value={countryCode}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger
                className="w-[110px] h-12"
                aria-label={t('login.phoneLabel')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+66" aria-label="Thailand +66">
                  🇹🇭 +66
                </SelectItem>
                <SelectItem value="+95" aria-label="Myanmar +95">
                  🇲🇲 +95
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
              className="flex-1 h-12"
            />
          </div>

          {error && (
            <p
              id="phone-error"
              role="alert"
              className="text-xs text-[#F44336] mt-1"
            >
              {error}
            </p>
          )}
        </div>

        {/* Push CTA to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        <Button
          onClick={handleSubmit}
          disabled={!isCtaEnabled}
          aria-busy={isLoading}
          className="w-full h-12 rounded-full bg-[#FFE600] text-[#212121] font-semibold text-base hover:bg-[#FFD600] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('cta.sendingOtp')}
            </>
          ) : (
            t('cta.continue')
          )}
        </Button>

        {/* Help link */}
        <p className="text-xs text-[#0091EA] text-center mt-4">
          {t('login.helpLink')}
        </p>
      </div>
    </div>
  )
}
