'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'

interface NotificationItem {
  key: 'push' | 'email' | 'sms'
  labelKey: string
  descKey: string
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  { key: 'push', labelKey: 'notifications.push', descKey: 'notifications.pushDesc' },
  { key: 'email', labelKey: 'notifications.email', descKey: 'notifications.emailDesc' },
  { key: 'sms', labelKey: 'notifications.sms', descKey: 'notifications.smsDesc' },
]

interface NotificationToggleListProps {
  onChange?: (key: string, value: boolean) => void
}

export function NotificationToggleList({ onChange }: NotificationToggleListProps) {
  const t = useTranslations('profile')

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: false,
    sms: true,
  })

  function handleToggle(key: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }))
    onChange?.(key, value)
  }

  return (
    <div className="flex flex-col">
      {NOTIFICATION_ITEMS.map((item, index) => (
        <div
          key={item.key}
          className={[
            'h-14 flex items-center justify-between px-4',
            index < NOTIFICATION_ITEMS.length - 1 ? 'border-b border-[#F0F0F0]' : '',
          ].join(' ')}
        >
          <div className="flex flex-col justify-center">
            <p className="text-base font-normal text-[#212121] leading-tight">
              {t(item.labelKey as Parameters<typeof t>[0])}
            </p>
            <p className="text-xs text-[#757575] leading-tight mt-0.5">
              {t(item.descKey as Parameters<typeof t>[0])}
            </p>
          </div>
          <Switch
            checked={toggles[item.key]}
            onCheckedChange={(value) => handleToggle(item.key, value)}
            aria-label={t(item.labelKey as Parameters<typeof t>[0])}
            className="data-[state=checked]:bg-[#0091EA]"
          />
        </div>
      ))}
    </div>
  )
}
