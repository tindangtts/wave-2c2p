'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { BackHeader } from '@/components/layout/back-header'
import { StepIndicator } from '@/components/features/step-indicator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { personalInfoSchema, type PersonalInfoInput } from '@/lib/auth/schemas'
import { useRegistrationStore } from '@/stores/registration-store'

export default function PersonalInfoPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const { firstName, lastName, dateOfBirth, nationality, setPersonalInfo, setStep } =
    useRegistrationStore()

  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: 'thai',
    },
  })

  // Hydration-safe: only read store values after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      form.reset({
        firstName: firstName || '',
        lastName: lastName || '',
        dateOfBirth: dateOfBirth || '',
        nationality: (nationality as PersonalInfoInput['nationality']) || 'thai',
      })
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: PersonalInfoInput) {
    setIsLoading(true)
    try {
      // Save to Zustand store
      setPersonalInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality,
      })

      // POST to API
      const res = await fetch('/api/auth/register/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 1, data }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('Step 1 save failed:', err)
        // On API error, still advance (data is in store)
      }

      setStep(2)
      router.push('/register/id-details')
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleBack() {
    setShowSaveDialog(true)
  }

  function handleSaveAndExit() {
    // Save current form values to store before leaving
    const values = form.getValues()
    setPersonalInfo({
      firstName: values.firstName || '',
      lastName: values.lastName || '',
      dateOfBirth: values.dateOfBirth || '',
      nationality: (values.nationality as PersonalInfoInput['nationality']) || 'thai',
    })
    router.push('/login')
  }

  const errors = form.formState.errors

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <BackHeader title={t('register.step1Title')} onBack={handleBack} />

      <StepIndicator currentStep={1} />

      <div className="flex-1 flex flex-col px-4 pt-6 pb-8">
        <p className="text-base text-[#757575] mb-6">{t('register.step1Subtitle')}</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1" noValidate>
          <div className="flex flex-col gap-6">
            {/* First Name */}
            <div>
              <Label
                htmlFor="firstName"
                className="text-base text-[#212121] font-normal mb-2 block"
              >
                {t('fields.firstName')}
              </Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                className="h-12"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p
                  id="firstName-error"
                  role="alert"
                  className="text-xs text-[#F44336] mt-1"
                >
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label
                htmlFor="lastName"
                className="text-base text-[#212121] font-normal mb-2 block"
              >
                {t('fields.lastName')}
              </Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                className="h-12"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p
                  id="lastName-error"
                  role="alert"
                  className="text-xs text-[#F44336] mt-1"
                >
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <Label
                htmlFor="dateOfBirth"
                className="text-base text-[#212121] font-normal mb-2 block"
              >
                {t('fields.dateOfBirth')}
              </Label>
              <Input
                id="dateOfBirth"
                {...form.register('dateOfBirth')}
                placeholder={t('fields.dobPlaceholder')}
                className="h-12"
                aria-invalid={!!errors.dateOfBirth}
                aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                autoComplete="bday"
                inputMode="numeric"
              />
              {errors.dateOfBirth && (
                <p
                  id="dateOfBirth-error"
                  role="alert"
                  className="text-xs text-[#F44336] mt-1"
                >
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Nationality */}
            <div>
              <Label
                htmlFor="nationality"
                className="text-base text-[#212121] font-normal mb-2 block"
              >
                {t('fields.nationality')}
              </Label>
              <Select
                onValueChange={(value) => {
                  if (value)
                    form.setValue('nationality', value as PersonalInfoInput['nationality'], {
                      shouldValidate: false,
                    })
                }}
                value={form.watch('nationality')}
              >
                <SelectTrigger
                  id="nationality"
                  className="h-12"
                  aria-invalid={!!errors.nationality}
                  aria-describedby={errors.nationality ? 'nationality-error' : undefined}
                >
                  <SelectValue placeholder={t('fields.nationality')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thai">{t('fields.nationalityThai')}</SelectItem>
                  <SelectItem value="myanmar">{t('fields.nationalityMyanmar')}</SelectItem>
                  <SelectItem value="other">{t('fields.nationalityOther')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.nationality && (
                <p
                  id="nationality-error"
                  role="alert"
                  className="text-xs text-[#F44336] mt-1"
                >
                  {errors.nationality.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1" />

          <Button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full h-12 rounded-full bg-[#FFE600] text-[#212121] font-semibold text-base hover:bg-[#FFE600]/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('cta.saving')}
              </>
            ) : (
              t('cta.next')
            )}
          </Button>
        </form>
      </div>

      {/* Save & Exit Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('register.saveDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('register.saveDialogBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowSaveDialog(false)}
              className="border-[#212121] text-[#212121]"
            >
              {t('register.saveDialogCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveAndExit}
              className="bg-[#FFE600] text-[#212121] hover:bg-[#FFE600]/90"
            >
              {t('register.saveDialogConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
