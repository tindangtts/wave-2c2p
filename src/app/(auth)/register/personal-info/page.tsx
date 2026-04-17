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

/** Auto-format date input as DD/MM/YYYY */
function formatDateInput(raw: string, prev: string): string {
  // If user is deleting a slash, remove it and the digit before it
  if (prev.length - raw.length === 1 && prev.endsWith('/') && !raw.endsWith('/')) {
    return raw.slice(0, -1)
  }
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export default function PersonalInfoPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const { firstName, lastName, dateOfBirth, nationality, phone, countryCode, setPersonalInfo, setStep } =
    useRegistrationStore()

  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: 'ms',
      firstName: '',
      lastName: '',
      gender: 'male',
      dateOfBirth: '',
      email: '',
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
        title: 'ms',
        firstName: firstName || '',
        lastName: lastName || '',
        gender: 'male',
        dateOfBirth: dateOfBirth || '',
        email: '',
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

  const titleLabels: Record<string, string> = {
    ms: t('fields.titleMs'),
    mr: t('fields.titleMr'),
    mrs: t('fields.titleMrs'),
  }
  const genderLabels: Record<string, string> = {
    male: t('fields.genderMale'),
    female: t('fields.genderFemale'),
  }

  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleDateInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const prev = form.getValues('dateOfBirth') || ''
      const formatted = formatDateInput(e.target.value, prev)
      form.setValue('dateOfBirth', formatted, { shouldValidate: false })
    },
    [form]
  )

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        form.setValue('dateOfBirth', format(date, 'dd/MM/yyyy'), { shouldValidate: true })
        setCalendarOpen(false)
      }
    },
    [form]
  )

  // Parse current DOB string to Date for calendar default month
  const dobValue = form.watch('dateOfBirth') || ''
  const parsedDob = dobValue.length === 10 ? parse(dobValue, 'dd/MM/yyyy', new Date()) : undefined
  const calendarDate = parsedDob && isValid(parsedDob) ? parsedDob : undefined

  const errors = form.formState.errors

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <BackHeader title={t('register.step1Title')} onBack={handleBack} rightContent="Step 1/3" />

      <StepIndicator currentStep={1} />

      <div className="flex-1 flex flex-col px-4 pt-6 pb-8">
        <p className="text-base text-muted-foreground mb-6">{t('register.step1Subtitle')}</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1" noValidate>
          <div className="flex flex-col gap-5">
            {/* Title (Salutation) */}
            <div>
              <Label htmlFor="title" className="text-xs text-muted-foreground mb-1 block">
                {t('fields.title')} <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => {
                  if (value)
                    form.setValue('title', value as PersonalInfoInput['title'], { shouldValidate: false })
                }}
                value={form.watch('title')}
              >
                <SelectTrigger id="title" className="h-12" aria-required="true">
                  <span className="flex flex-1 text-left">{titleLabels[form.watch('title')] ?? form.watch('title')}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ms">{t('fields.titleMs')}</SelectItem>
                  <SelectItem value="mr">{t('fields.titleMr')}</SelectItem>
                  <SelectItem value="mrs">{t('fields.titleMrs')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* First Name */}
            <div>
              <Label htmlFor="firstName" className="text-xs text-muted-foreground mb-1 block">
                {t('fields.firstName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                className="h-12"
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p id="firstName-error" role="alert" aria-live="polite" className="text-xs text-destructive mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName" className="text-xs text-muted-foreground mb-1 block">
                {t('fields.lastName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                className="h-12"
                aria-required="true"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p id="lastName-error" role="alert" aria-live="polite" className="text-xs text-destructive mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-xs text-muted-foreground mb-1 block">
                {t('fields.gender')} <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => {
                  if (value)
                    form.setValue('gender', value as PersonalInfoInput['gender'], { shouldValidate: false })
                }}
                value={form.watch('gender')}
              >
                <SelectTrigger id="gender" className="h-12" aria-required="true">
                  <span className="flex flex-1 text-left">{genderLabels[form.watch('gender')] ?? form.watch('gender')}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('fields.genderMale')}</SelectItem>
                  <SelectItem value="female">{t('fields.genderFemale')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dateOfBirth" className="text-xs text-muted-foreground mb-1 block">
                {t('fields.dateOfBirth')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="dateOfBirth"
                  value={form.watch('dateOfBirth') || ''}
                  onChange={handleDateInput}
                  placeholder={t('fields.dobPlaceholder')}
                  className="h-12 pr-12"
                  aria-required="true"
                  aria-invalid={!!errors.dateOfBirth}
                  aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                  autoComplete="bday"
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
                      defaultMonth={calendarDate ?? new Date(2000, 0)}
                      captionLayout="dropdown"
                      fromYear={1940}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.dateOfBirth && (
                <p id="dateOfBirth-error" role="alert" aria-live="polite" className="text-xs text-destructive mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Mobile No. (read-only, from registration store) */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                {t('fields.mobileNo')}
              </Label>
              <div className="h-12 border rounded-md px-3 flex items-center bg-secondary text-foreground">
                <span className="text-base">
                  {countryCode ? <><span aria-hidden="true">{countryCode === '+66' ? '🇹🇭' : '🇲🇲'}</span>{` ${countryCode === '+66' ? 'TH(+66)' : 'MM(+95)'} ▼ ${phone || ''}`}</> : ''}
                </span>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground mb-1 block">
                {t('fields.email')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder={t('fields.emailPlaceholder')}
                className="h-12"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {errors.email && (
                <p id="email-error" role="alert" aria-live="polite" className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Disclaimer text — per Pencil design */}
          <p className="text-xs text-muted-foreground text-center mt-6 mb-4">
            {t('fields.checkInfoDisclaimer')}
          </p>

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
              className="border-foreground text-foreground"
            >
              {t('register.saveDialogCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveAndExit}
              className="bg-primary text-foreground hover:bg-primary/90"
            >
              {t('register.saveDialogConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
