'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackHeader } from '@/components/layout/back-header'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

function maskPhone(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return phone
  const visible = digits.slice(-4)
  const masked = '*'.repeat(digits.length - 4)
  return masked + visible
}

function OTPPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')

  const rawPhone = searchParams.get('phone') ?? ''
  const countryCode = (searchParams.get('cc') ?? '+66') as '+66' | '+95'
  const maskedPhone = `${countryCode} ${maskPhone(rawPhone)}`

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  // Resend timer: 60s countdown
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
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
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(1, '0')
    const ss = String(seconds % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  const handleVerify = useCallback(
    async (token: string) => {
      if (token.length !== 6 || isLoading) return

      setIsLoading(true)
      setError('')

      try {
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: rawPhone,
            countryCode,
            token,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? t('errors.otpIncorrect'))
          setOtp('')
          setShakeKey((k) => k + 1)
          return
        }

        // Navigate based on user registration status
        if (data.isNewUser || !data.registrationComplete) {
          const step = data.registrationStep ?? 1
          if (step === 1 || data.isNewUser) {
            router.push('/register/pre-reg-info')
          } else if (step === 2) {
            router.push('/register/id-details')
          } else if (step === 3) {
            router.push('/register/create-passcode')
          } else {
            router.push('/register/personal-info')
          }
        } else {
          router.push('/home')
        }
      } catch {
        setError(t('errors.generic'))
        setOtp('')
        setShakeKey((k) => k + 1)
      } finally {
        setIsLoading(false)
      }
    },
    [rawPhone, countryCode, isLoading, router, t]
  )

  async function handleResend() {
    setCanResend(false)
    setTimeLeft(60)
    setError('')
    setOtp('')

    try {
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: rawPhone, countryCode }),
      })
    } catch {
      // Non-fatal — timer already reset
    }
  }

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('otp.title')}
        onBack={() => router.push('/login')}
      />

      <div className="flex-1 flex flex-col px-4 pt-8 pb-8">
        {/* Instruction — phone number highlighted in blue per Pencil design */}
        <p className="text-base text-accent">
          {t('otp.instruction', { phone: '' })}
          <br />
          <span className="font-semibold">({countryCode}){rawPhone}</span>
        </p>

        {/* OTP Input */}
        <div className="mt-8 flex justify-center">
          <div
            key={shakeKey}
            className={shakeKey > 0 ? 'animate-shake' : ''}
          >
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
              autoComplete="one-time-code"
              aria-label="6-digit verification code"
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold" aria-label="Digit 1 of 6" />
                <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold" aria-label="Digit 2 of 6" />
                <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold" aria-label="Digit 3 of 6" />
                <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold" aria-label="Digit 4 of 6" />
                <InputOTPSlot index={4} className="w-12 h-12 text-lg font-bold" aria-label="Digit 5 of 6" />
                <InputOTPSlot index={5} className="w-12 h-12 text-lg font-bold" aria-label="Digit 6 of 6" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Ref Code — per Pencil design */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          Ref Code: {Math.random().toString(36).substring(2, 6).toUpperCase()}
        </p>

        {/* Error message */}
        {error && (
          <p role="alert" aria-live="polite" className="text-xs text-destructive mt-2 text-center">
            {error}
          </p>
        )}

        {/* Resend timer / link */}
        <div className="mt-4 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-xs text-accent"
            >
              {t('otp.resendLink')}
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('otp.resendTimer', { time: formatTime(timeLeft) })}
            </p>
          )}
        </div>

        {/* Test OTP hint — only shown when DEMO_MODE is on */}
        {isDemoMode && (
          <button
            type="button"
            onClick={() => { setOtp('987654'); setTimeout(() => handleVerify('987654'), 100) }}
            className="mt-3 mx-auto px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700"
          >
            Test OTP: 987654
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Button
          onClick={() => handleVerify(otp)}
          disabled={otp.length !== 6 || isLoading}
          aria-busy={isLoading}
          className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('cta.verifying')}
            </>
          ) : (
            t('cta.verify')
          )}
        </Button>
      </div>
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense>
      <OTPPageContent />
    </Suspense>
  )
}
