'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { ReferralCard } from '@/components/features/referral-card'
import { Button } from '@/components/ui/button'

// Mock referral code — in production this would come from the user's profile
const REFERRAL_CODE = 'WAVE2C2P'

export default function ReferFriendsPage() {
  const router = useRouter()
  const t = useTranslations('profile')

  async function handleShare() {
    const shareData = {
      title: 'Join me on 2C2P Wave',
      text: `Use my referral code ${REFERRAL_CODE} to sign up for 2C2P Wave and get started with easy cross-border transfers!`,
      url: `https://wave.2c2p.com/register?ref=${REFERRAL_CODE}`,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User dismissed — not an error
        if (err instanceof Error && err.name !== 'AbortError') {
          fallbackCopy()
        }
      }
    } else {
      fallbackCopy()
    }
  }

  function fallbackCopy() {
    navigator.clipboard.writeText(REFERRAL_CODE).then(() => {
      toast.success('Referral code copied!')
    }).catch(() => {
      toast.error('Failed to copy. Please copy the code manually.')
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('referFriends.title')}
        onBack={() => router.push('/profile')}
      />
      <div className="flex-1 flex flex-col px-4 pt-6 pb-8 gap-4">
        <p className="text-sm text-[#595959]">
          {t('referFriends.instruction')}
        </p>

        <ReferralCard referralCode={REFERRAL_CODE} monthlyCount={0} />

        <div className="flex-1" />

        <Button
          onClick={handleShare}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground font-semibold text-base hover:bg-[#FFD600]"
        >
          {t('referFriends.shareCta')}
        </Button>
      </div>
    </div>
  )
}
