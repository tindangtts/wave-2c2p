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

import { idDetailsSchema, type IdDetailsInput } from '@/lib/auth/schemas'
import { useRegistrationStore } from '@/stores/registration-store'

export default function IdDetailsPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { idType, idNumber, idExpiry, setIdDetails, setStep } = useRegistrationStore()

  const form = useForm<IdDetailsInput>({
    resolver: zodResolver(idDetailsSchema),
    mode: 'onSubmit',
    defaultValues: {
      idType: 'national_id',
      idNumber: '',
      idExpiry: '',
    },
  })

  // Hydration-safe: only read store values after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      form.reset({
        idType: (idType as IdDetailsInput['idType']) || 'national_id',
        idNumber: idNumber || '',
        idExpiry: idExpiry || '',
      })
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: IdDetailsInput) {
    setIsLoading(true)
    try {
      // Save to Zustand store
      setIdDetails({
        idType: data.idType,
        idNumber: data.idNumber,
        idExpiry: data.idExpiry,
      })

      // POST to API
      const res = await fetch('/api/auth/register/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 2, data }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('Step 2 save failed:', err)
        // On API error, still advance (data is in store)
      }

      setStep(3)
      router.push('/register/create-passcode')
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleBack() {
    router.push('/register/personal-info')
  }

  const errors = form.formState.errors

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <BackHeader title={t('register.step2Title')} onBack={handleBack} rightContent="Step 2/3" />

      <StepIndicator currentStep={2} />

      <div className="flex-1 flex flex-col px-4 pt-6 pb-8">
        <p className="text-base text-muted-foreground mb-6">{t('register.step2Subtitle')}</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1" noValidate>
          <div className="flex flex-col gap-6">
            {/* ID Type */}
            <div>
              <Label
                htmlFor="idType"
                className="text-base text-foreground font-normal mb-2 block"
              >
                {t('fields.idType')}
              </Label>
              <Select
                onValueChange={(value) => {
                  if (value)
                    form.setValue('idType', value as IdDetailsInput['idType'], {
                      shouldValidate: false,
                    })
                }}
                value={form.watch('idType')}
              >
                <SelectTrigger
                  id="idType"
                  className="h-12"
                  aria-required="true"
                  aria-invalid={!!errors.idType}
                  aria-describedby={errors.idType ? 'idType-error' : undefined}
                >
                  <SelectValue placeholder={t('fields.idType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">{t('fields.idTypeNationalId')}</SelectItem>
                  <SelectItem value="passport">{t('fields.idTypePassport')}</SelectItem>
                  <SelectItem value="work_permit">{t('fields.idTypeWorkPermit')}</SelectItem>
                  <SelectItem value="other">{t('fields.idTypeOther')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.idType && (
                <p
                  id="idType-error"
                  role="alert"
                  aria-live="polite"
                  className="text-xs text-destructive mt-1"
                >
                  {errors.idType.message}
                </p>
              )}
            </div>

            {/* ID Number */}
            <div>
              <Label
                htmlFor="idNumber"
                className="text-base text-foreground font-normal mb-2 block"
              >
                {t('fields.idNumber')}
              </Label>
              <Input
                id="idNumber"
                {...form.register('idNumber')}
                className="h-12"
                aria-required="true"
                aria-invalid={!!errors.idNumber}
                aria-describedby={errors.idNumber ? 'idNumber-error' : undefined}
                autoComplete="off"
              />
              {errors.idNumber && (
                <p
                  id="idNumber-error"
                  role="alert"
                  aria-live="polite"
                  className="text-xs text-destructive mt-1"
                >
                  {errors.idNumber.message}
                </p>
              )}
            </div>

            {/* ID Expiry Date */}
            <div>
              <Label
                htmlFor="idExpiry"
                className="text-base text-foreground font-normal mb-2 block"
              >
                {t('fields.idExpiry')}
              </Label>
              <Input
                id="idExpiry"
                {...form.register('idExpiry')}
                placeholder={t('fields.dobPlaceholder')}
                className="h-12"
                aria-required="true"
                aria-invalid={!!errors.idExpiry}
                aria-describedby={errors.idExpiry ? 'idExpiry-error' : undefined}
                autoComplete="off"
                inputMode="numeric"
              />
              {errors.idExpiry && (
                <p
                  id="idExpiry-error"
                  role="alert"
                  aria-live="polite"
                  className="text-xs text-destructive mt-1"
                >
                  {errors.idExpiry.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1" />

          <Button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-50"
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
    </div>
  )
}
