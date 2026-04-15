'use client'

import { useEffect, useState } from 'react'
import { MaintenanceModal } from '@/components/features/maintenance-modal'
import { UpdateRequiredModal } from '@/components/features/update-required-modal'

interface SystemStatus {
  maintenance: boolean
  hardUpdate: boolean
  softUpdate: boolean
}

export function SystemStateChecker() {
  const [status, setStatus] = useState<SystemStatus>({
    maintenance: false,
    hardUpdate: false,
    softUpdate: false,
  })
  const [softUpdateDismissed, setSoftUpdateDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/system-status')
      .then((res) => res.json())
      .then((data: SystemStatus) => setStatus(data))
      .catch(() => {
        // Silently fail — don't block the app if status check fails
      })
  }, [])

  return (
    <>
      {/* Maintenance modal: non-dismissible per AUTH-02 spec — onClose is a no-op */}
      <MaintenanceModal open={status.maintenance} onClose={() => {}} />
      {/* Hard update: blocking, no dismiss */}
      <UpdateRequiredModal open={status.hardUpdate} />
      {/* Soft update: dismissible once per session */}
      <UpdateRequiredModal
        open={status.softUpdate && !softUpdateDismissed}
        soft
        onDismiss={() => setSoftUpdateDismissed(true)}
      />
    </>
  )
}
