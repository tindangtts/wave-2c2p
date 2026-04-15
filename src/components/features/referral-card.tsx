'use client'

import QRCode from 'react-qr-code'
import { useTranslations } from 'next-intl'

interface ReferralCardProps {
  referralCode: string
  monthlyCount?: number
}

export function ReferralCard({ referralCode, monthlyCount = 0 }: ReferralCardProps) {
  const t = useTranslations('profile')

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4">
      {/* Code label */}
      <p className="text-xs text-muted-foreground text-center">
        {t('referFriends.codeLabel')}
      </p>

      {/* Referral code */}
      <p className="text-2xl font-bold text-foreground tracking-[0.12em] select-all">
        {referralCode}
      </p>

      {/* QR Code */}
      <div className="p-3 bg-white rounded-xl border border-[#F0F0F0]">
        <QRCode
          value={referralCode}
          size={160}
          fgColor="var(--color-foreground)"
          bgColor="#FFFFFF"
          level="M"
        />
      </div>

      {/* Monthly count */}
      <p className="text-xs text-muted-foreground text-center">
        {t('referFriends.monthlyCount', { n: monthlyCount })}
      </p>
    </div>
  )
}
