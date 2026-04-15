'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { ReferralCard } from '@/components/features/referral-card'
import { Button } from '@/components/ui/button'

interface ReferralStats {
  referredCount: number
  totalBonusSatang: number
  referralCode: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ReferFriendsPage() {
  const router = useRouter()
  const t = useTranslations('profile')

  const { data: stats } = useSWR<ReferralStats>('/api/referral/stats', fetcher)

  const referralCode = stats?.referralCode ?? 'WAVE2C2P'
  const referredCount = stats?.referredCount ?? 0
  const totalBonusTHB = stats ? (stats.totalBonusSatang / 100).toFixed(0) : '0'

  const shareUrl = `https://wave.2c2p.com/register?ref=${referralCode}`
  const shareText = `Use my referral code ${referralCode} to join 2C2P Wave!\n${shareUrl}`

  async function handleShare() {
    const shareData = {
      title: 'Join me on 2C2P Wave',
      text: shareText,
      url: shareUrl,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleWhatsApp = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank')
  }

  const handleLine = () => {
    window.open('https://line.me/R/msg/text/' + encodeURIComponent(shareText), '_blank')
  }

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success(t('referFriends.linkCopied'))
      })
      .catch(() => {
        toast.error('Failed to copy. Please copy the link manually.')
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-foreground">{referredCount}</p>
            <p className="text-xs text-[#595959]">
              {t('referFriends.referredCount', { n: referredCount })}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#0091EA]">
              {t('referFriends.bonusValue', { amount: totalBonusTHB })}
            </p>
            <p className="text-xs text-[#595959]">{t('referFriends.totalBonus')}</p>
          </div>
        </div>

        <ReferralCard referralCode={referralCode} monthlyCount={referredCount} />

        <div className="flex-1" />

        {/* Primary share button (navigator.share on mobile) */}
        <Button
          onClick={handleShare}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground font-semibold text-base hover:bg-[#FFD600]"
        >
          {t('referFriends.shareCta')}
        </Button>

        {/* Social share row */}
        <div className="flex gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex-1 h-12 rounded-full bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center"
          >
            {t('referFriends.shareWhatsApp')}
          </button>
          <button
            onClick={handleLine}
            className="flex-1 h-12 rounded-full bg-[#06C755] text-white font-semibold text-sm flex items-center justify-center"
          >
            {t('referFriends.shareLine')}
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full h-12 rounded-full bg-[#FFE600] text-foreground font-semibold text-sm flex items-center justify-center"
        >
          {t('referFriends.copyLink')}
        </button>
      </div>
    </div>
  )
}
