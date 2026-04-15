'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BackHeader } from '@/components/layout/back-header'

export default function DailyLimitPage() {
  const router = useRouter()
  const t = useTranslations('auth')

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('compliance.dailyLimit.title')}
        onBack={() => router.back()}
      />

      <div className="flex-1 flex flex-col px-4 pt-8 pb-[64px]">
        {/* Limit info card */}
        <div
          className="border border-border rounded-xl p-4 bg-white shadow-sm animate-fade-up stagger-1"
          role="region"
          aria-label="Daily transfer limits"
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            {t('compliance.dailyLimit.cardHeading')}
          </h2>

          {/* KYC Pending tier */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] text-muted-foreground">
              {t('compliance.dailyLimit.tier1Label')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-bold text-foreground">
                {t('compliance.dailyLimit.tier1Amount')}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {t('compliance.dailyLimit.tier1Currency')}
              </span>
            </div>
          </div>

          <Separator className="my-2" />

          {/* KYC Approved tier */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] text-muted-foreground">
              {t('compliance.dailyLimit.tier2Label')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-bold text-foreground">
                {t('compliance.dailyLimit.tier2Amount')}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {t('compliance.dailyLimit.tier2Currency')}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[12px] text-muted-foreground text-center mt-4 px-2">
          {t('compliance.dailyLimit.disclaimer')}
        </p>

        <div className="flex-1" />
      </div>

      {/* Fixed bottom CTA */}
      <div className="px-4 pb-8">
        <Button
          onClick={() => router.push('/register/personal-info')}
          className="w-full h-12 rounded-full bg-primary text-foreground font-semibold text-base hover:bg-primary/90"
        >
          {t('compliance.dailyLimit.cta')}
        </Button>
      </div>
    </div>
  )
}
