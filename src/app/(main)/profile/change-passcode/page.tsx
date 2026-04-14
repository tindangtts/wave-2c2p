'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasscodeKeypad } from '@/components/features/passcode-keypad'

type Step = 1 | 2 | 3 | 'success'

export default function ChangePasscodePage() {
  const router = useRouter()
  const t = useTranslations('profile')

  const [step, setStep] = useState<Step>(1)
  const [currentPasscode, setCurrentPasscode] = useState('')
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  // Step title and instruction by step
  const stepTitle = {
    1: t('changePasscode.title'),
    2: t('changePasscode.titleNew'),
    3: t('changePasscode.titleConfirm'),
  }
  const stepInstruction = {
    1: t('changePasscode.step1Instruction'),
    2: t('changePasscode.step2Instruction'),
    3: t('changePasscode.step3Instruction'),
  }

  const currentValue = step === 1 ? currentPasscode : step === 2 ? newPasscode : confirmValue
  const currentOnChange = step === 1 ? setCurrentPasscode : step === 2 ? setNewPasscode : setConfirmValue

  async function handleStep1Complete(code: string) {
    setIsLoading(true)
    setError(undefined)

    try {
      const res = await fetch('/api/auth/passcode/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 423) {
          setError('Account locked. Please try again later.')
        } else {
          const remaining = data.remaining ?? 0
          setError(t('changePasscode.errorCurrentWrong', { n: remaining }))
        }
        setCurrentPasscode('')
        return
      }

      // Current passcode is correct — advance to step 2
      setStep(2)
      setNewPasscode('')
      setError(undefined)
    } catch {
      setError('Something went wrong. Please try again.')
      setCurrentPasscode('')
    } finally {
      setIsLoading(false)
    }
  }

  function handleStep2Complete(code: string) {
    // Store new passcode and advance to confirm step
    setNewPasscode(code)
    setStep(3)
    setConfirmValue('')
    setError(undefined)
  }

  async function handleStep3Complete(code: string) {
    if (code !== newPasscode) {
      setError(t('changePasscode.errorMismatch'))
      setConfirmValue('')
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      const res = await fetch('/api/auth/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode,
          newPasscode: code,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to change passcode')
        setConfirmValue('')
        return
      }

      setStep('success')
    } catch {
      setError('Something went wrong. Please try again.')
      setConfirmValue('')
    } finally {
      setIsLoading(false)
    }
  }

  function handleComplete(code: string) {
    if (step === 1) return handleStep1Complete(code)
    if (step === 2) return handleStep2Complete(code)
    if (step === 3) return handleStep3Complete(code)
  }

  function handleBack() {
    if (step === 1) {
      router.push('/profile')
    } else if (step === 2) {
      setStep(1)
      setCurrentPasscode('')
      setError(undefined)
    } else if (step === 3) {
      setStep(2)
      setNewPasscode('')
      setConfirmValue('')
      setError(undefined)
    }
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className="flex flex-col min-h-screen px-4 pt-16 pb-8 items-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#4CAF50]" />
          </div>
          <h2 className="text-xl font-bold text-foreground text-center">
            {t('changePasscode.successHeading')}
          </h2>
          <p className="text-sm text-[#595959] text-center">
            {t('changePasscode.successBody')}
          </p>
        </div>
        <Button
          onClick={() => router.push('/profile')}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground font-semibold text-base hover:bg-[#FFD600]"
        >
          {t('changePasscode.successCta')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back navigation */}
      <div className="sticky top-0 z-40">
        <div className="wave-status-bar h-11 safe-top" />
        <div className="wave-header-gradient px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-8">
        {/* Title */}
        <h1 className="text-xl font-bold text-foreground text-center">
          {stepTitle[step as 1 | 2 | 3]}
        </h1>

        {/* Instruction */}
        <p className="text-sm text-[#595959] mt-2 text-center">
          {stepInstruction[step as 1 | 2 | 3]}
        </p>

        {isLoading && (
          <div className="flex items-center gap-2 mt-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#595959]" />
          </div>
        )}

        {/* Passcode Keypad */}
        <div className="w-full mt-8">
          <PasscodeKeypad
            key={step}
            value={currentValue}
            onChange={currentOnChange}
            onComplete={handleComplete}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
