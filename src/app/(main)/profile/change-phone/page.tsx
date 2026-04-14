'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { BackHeader } from '@/components/layout/back-header'

type Step = 1 | 2 | 'success'

function maskPhone(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return phone
  const visible = digits.slice(-4)
  const masked = '*'.repeat(digits.length - 4)
  return masked + visible
}

export default function ChangePhonePage() {
  const router = useRouter()
  const t = useTranslations('profile')

  const [step, setStep] = useState<Step>(1)
  const [countryCode, setCountryCode] = useState<'+66' | '+95'>('+66')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  // Resend timer
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (step !== 2) return
    setTimeLeft(60)
    setCanResend(false)
  }, [step])

  useEffect(() => {
    if (step !== 2) return
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step, timeLeft])

  const maskedPhone = `${countryCode} ${maskPhone(phone)}`

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, countryCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP')
        return
      }

      setStep(2)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = useCallback(
    async (token: string) => {
      if (token.length !== 6 || isLoading) return

      setIsLoading(true)
      setError('')

      try {
        const res = await fetch('/api/auth/verify-change-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone.replace(/\D/g, ''),
            countryCode,
            otp: token,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? t('changePhone.errorOtpInvalid'))
          setOtp('')
          setShakeKey((k) => k + 1)
          return
        }

        setStep('success')
      } catch {
        setError('Something went wrong. Please try again.')
        setOtp('')
        setShakeKey((k) => k + 1)
      } finally {
        setIsLoading(false)
      }
    },
    [phone, countryCode, isLoading, t]
  )

  async function handleResend() {
    setCanResend(false)
    setTimeLeft(60)
    setError('')
    setOtp('')

    try {
      await fetch('/api/auth/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), countryCode }),
      })
    } catch {
      // Non-fatal
    }
  }

  const minDigits = countryCode === '+66' ? 9 : 7
  const phoneDigits = phone.replace(/\D/g, '')
  const isStep1CtaEnabled = phoneDigits.length >= minDigits && !isLoading

  // Success screen
  if (step === 'success') {
    return (
      <div className="flex flex-col min-h-screen">
        <BackHeader
          title={t('changePhone.title')}
          onBack={() => router.push('/profile')}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 gap-4">
          <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#4CAF50]" />
          </div>
          <h2 className="text-xl font-bold text-foreground text-center">
            {t('changePhone.successHeading')}
          </h2>
          <p className="text-sm text-[#595959] text-center">
            {t('changePhone.successBody')}
          </p>
          <div className="flex-1" />
          <Button
            onClick={() => router.push('/profile')}
            className="w-full h-14 rounded-full bg-[#FFE600] text-foreground font-semibold text-base hover:bg-[#FFD600]"
          >
            {t('changePhone.successCta')}
          </Button>
        </div>
      </div>
    )
  }

  // Step 2: OTP verification
  if (step === 2) {
    return (
      <div className="flex flex-col min-h-screen">
        <BackHeader
          title={t('changePhone.title')}
          onBack={() => {
            setStep(1)
            setOtp('')
            setError('')
          }}
        />
        <div className="flex-1 flex flex-col px-4 pt-8 pb-8">
          <p className="text-base text-foreground">
            {t('changePhone.step2Instruction', { phone: maskedPhone })}
          </p>

          {/* OTP Input */}
          <div className="mt-8 flex justify-center">
            <div key={shakeKey} className={shakeKey > 0 ? 'animate-shake' : ''}>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleVerifyOtp}
                autoComplete="one-time-code"
                aria-label="6-digit verification code"
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg font-bold" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg font-bold" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive mt-2 text-center">
              {error}
            </p>
          )}

          {/* Resend */}
          <div className="mt-4 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-xs text-[#0091EA]"
              >
                {t('changePhone.resendCode')}
              </button>
            ) : (
              <p className="text-xs text-[#595959]">
                {t('changePhone.resendIn', { n: timeLeft })}
              </p>
            )}
          </div>

          <div className="flex-1" />

          <Button
            onClick={() => handleVerifyOtp(otp)}
            disabled={otp.length !== 6 || isLoading}
            aria-busy={isLoading}
            className="w-full h-14 rounded-full bg-[#FFE600] text-foreground font-semibold text-base hover:bg-[#FFD600] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              t('changePhone.step2Cta')
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Step 1: Phone input
  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('changePhone.title')}
        onBack={() => router.push('/profile')}
      />
      <div className="flex-1 flex flex-col px-4 pt-8 pb-8">
        <p className="text-base text-[#595959] mb-6">
          {t('changePhone.step1Instruction')}
        </p>

        <div className="space-y-2">
          <Label className="text-sm text-foreground">Phone Number</Label>
          <div className="flex gap-2">
            <Select
              value={countryCode}
              onValueChange={(v) => {
                if (v) setCountryCode(v as '+66' | '+95')
              }}
            >
              <SelectTrigger className="w-24 h-12 rounded-xl border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+66">+66</SelectItem>
                <SelectItem value="+95">+95</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (error) setError('')
              }}
              className="flex-1 h-12 rounded-xl border-border"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive mt-2">
            {error}
          </p>
        )}

        <div className="flex-1" />

        <Button
          onClick={handleSendOtp}
          disabled={!isStep1CtaEnabled}
          aria-busy={isLoading}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground font-semibold text-base hover:bg-[#FFD600] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            t('changePhone.step1Cta')
          )}
        </Button>
      </div>
    </div>
  )
}
