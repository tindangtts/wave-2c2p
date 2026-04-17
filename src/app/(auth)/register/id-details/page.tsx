'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Loader2, CalendarIcon } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'

import { BackHeader } from '@/components/layout/back-header'
import { StepIndicator } from '@/components/features/step-indicator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

import { idDetailsSchema, type IdDetailsInput } from '@/lib/auth/schemas'
import { useRegistrationStore } from '@/stores/registration-store'

/** Auto-format date input as DD/MM/YYYY */
function formatDateInput(raw: string, prev: string): string {
  if (prev.length - raw.length === 1 && prev.endsWith('/') && !raw.endsWith('/')) {
    return raw.slice(0, -1)
  }
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

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

  const idTypeLabels: Record<string, string> = {
    national_id: t('fields.idTypeNationalId'),
    passport: t('fields.idTypePassport'),
    work_permit: t('fields.idTypeWorkPermit'),
    other: t('fields.idTypeOther'),
  }

  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleExpiryInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const prev = form.getValues('idExpiry') || ''
      const formatted = formatDateInput(e.target.value, prev)
      form.setValue('idExpiry', formatted, { shouldValidate: false })
    },
    [form]
  )

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        form.setValue('idExpiry', format(date, 'dd/MM/yyyy'), { shouldValidate: true })
        setCalendarOpen(false)
      }
    },
    [form]
  )

  const expiryValue = form.watch('idExpiry') || ''
  const parsedExpiry = expiryValue.length === 10 ? parse(expiryValue, 'dd/MM/yyyy', new Date()) : undefined
  const calendarDate = parsedExpiry && isValid(parsedExpiry) ? parsedExpiry : undefined

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
                  <span className="flex flex-1 text-left">{idTypeLabels[form.watch('idType')] ?? form.watch('idType')}</span>
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
              <div className="relative">
                <Input
                  id="idExpiry"
                  value={form.watch('idExpiry') || ''}
                  onChange={handleExpiryInput}
                  placeholder={t('fields.dobPlaceholder')}
                  className="h-12 pr-12"
                  aria-required="true"
                  aria-invalid={!!errors.idExpiry}
                  aria-describedby={errors.idExpiry ? 'idExpiry-error' : undefined}
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={10}
                />
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Open date picker"
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={calendarDate}
                      onSelect={handleCalendarSelect}
                      defaultMonth={calendarDate ?? new Date()}
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 20}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
