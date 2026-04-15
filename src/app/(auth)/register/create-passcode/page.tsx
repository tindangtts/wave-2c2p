'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { StepIndicator } from '@/components/features/step-indicator'
import { PasscodeKeypad } from '@/components/features/passcode-keypad'
import { useRegistrationStore } from '@/stores/registration-store'

type PasscodeStep = 'create' | 'confirm'

export default function CreatePasscodePage() {
  const t = useTranslations('auth')
  const router = useRouter()

  const [step, setStep] = useState<PasscodeStep>('create')
  const [firstPasscode, setFirstPasscode] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  function handleCreateComplete(code: string) {
    setFirstPasscode(code)
    setStep('confirm')
    setValue('')
    setError(undefined)
  }

  async function handleConfirmComplete(code: string) {
    if (code !== firstPasscode) {
      setError(t('errors.passcodeMismatch'))
      // Clear both and reset to create after 1s
      setTimeout(() => {
        setError(undefined)
        setFirstPasscode('')
        setValue('')
        setStep('create')
      }, 1000)
      return
    }

    setIsLoading(true)
    setError(undefined)
    try {
      const response = await fetch('/api/auth/passcode/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? t('errors.generic'))
        setIsLoading(false)
        setValue('')
        return
      }

      // Clear registration store per D-06
      useRegistrationStore.getState().clearAll()

      router.push('/kyc/document-type')
    } catch {
      setError(t('errors.generic'))
      setIsLoading(false)
      setValue('')
    }
  }

  return (
    <div className="flex flex-col min-h-svh">
      <BackHeader
        title={t('register.step3Title')}
        onBack={() => router.push('/register/id-details')}
        rightContent="Step 3/3"
      />
      <StepIndicator currentStep={3} />

      <div className="flex flex-col flex-1 px-4 pt-8 pb-8 items-center">
        <p className="text-base text-muted-foreground text-center mb-8">
          {step === 'create'
            ? t('register.step3Instruction')
            : t('register.step3ConfirmInstruction')}
        </p>

        <PasscodeKeypad
          value={value}
          onChange={setValue}
          onComplete={
            step === 'create' ? handleCreateComplete : handleConfirmComplete
          }
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
