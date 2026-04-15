'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { NotificationToggleList } from '@/components/features/notification-toggle-list'
import { Button } from '@/components/ui/button'

export default function NotificationsPage() {
  const router = useRouter()
  const t = useTranslations('profile')

  function handleSave() {
    // Mock save — no persistence
    toast.success('Settings saved')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BackHeader
        title={t('notifications.title')}
        onBack={() => router.push('/profile')}
      />
      <div className="flex-1 flex flex-col pb-8">
        <div className="mt-4 bg-white rounded-2xl mx-4 overflow-hidden shadow-sm">
          <NotificationToggleList />
        </div>

        <div className="flex-1" />

        <div className="px-4 mt-6">
          <Button
            onClick={handleSave}
            className="w-full h-14 rounded-full bg-primary text-foreground font-semibold text-base hover:bg-primary/90"
          >
            {t('notifications.saveCta')}
          </Button>
        </div>
      </div>
    </div>
  )
}
