'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BANK_OPTIONS = [
  'SCB',
  'KBank',
  'BBL',
  'KTB',
  'BAY',
  'GSB',
  'CIMB',
  'TMB',
  'UOB',
  'LH Bank',
]

const addBankSchema = z.object({
  bank_name: z.string().min(1, 'Select a bank'),
  account_number: z
    .string()
    .regex(/^\d{10,12}$/, 'Account number must be 10-12 digits'),
  account_name: z.string().min(1, 'Account name is required'),
})

type AddBankInput = z.infer<typeof addBankSchema>

export default function AddBankPage() {
  const router = useRouter()
  const t = useTranslations('wallet')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddBankInput>({
    resolver: zodResolver(addBankSchema),
    defaultValues: {
      bank_name: '',
      account_number: '',
      account_name: '',
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  async function onSubmit(data: AddBankInput) {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? t('addBank.saveFailed'))
        return
      }
      toast.success(t('addBank.saved'))
      router.push('/withdraw')
    } catch {
      toast.error(t('addBank.connectionError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title={t('addBank.title')} />
      <div className="flex-1 px-4 pt-6 pb-32 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          {/* Bank Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bank_name" className="text-sm font-medium text-foreground">
              {t('addBank.bankName')}
            </Label>
            <Controller
              name="bank_name"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (val) field.onChange(val)
                  }}
                >
                  <SelectTrigger
                    id="bank_name"
                    className="w-full h-12 bg-white rounded-xl border border-border"
                  >
                    <SelectValue placeholder={t('addBank.bankNamePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bank_name && (
              <p className="text-xs text-destructive">{errors.bank_name.message}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account_number" className="text-sm font-medium text-foreground">
              {t('addBank.accountNumber')}
            </Label>
            <Input
              id="account_number"
              type="tel"
              inputMode="numeric"
              maxLength={12}
              placeholder={t('addBank.accountNumberPlaceholder')}
              className="h-12 bg-white rounded-xl border border-border"
              {...register('account_number')}
            />
            {errors.account_number && (
              <p className="text-xs text-destructive">{errors.account_number.message}</p>
            )}
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account_name" className="text-sm font-medium text-foreground">
              {t('addBank.accountName')}
            </Label>
            <Input
              id="account_name"
              type="text"
              placeholder={t('addBank.accountNamePlaceholder')}
              className="h-12 bg-white rounded-xl border border-border"
              {...register('account_name')}
            />
            {errors.account_name && (
              <p className="text-xs text-destructive">{errors.account_name.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isSubmitting ? t('addBank.saving') : t('addBank.saveCta')}
        </button>
      </div>
    </div>
  )
}
