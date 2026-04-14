'use client'

import { useEffect, useState } from 'react'
import { MaintenanceModal } from '@/components/features/maintenance-modal'
import { UpdateRequiredModal } from '@/components/features/update-required-modal'

interface SystemStatus {
  maintenance: boolean
  updateRequired: boolean
}

export function SystemStateChecker() {
  const [status, setStatus] = useState<SystemStatus>({
    maintenance: false,
    updateRequired: false,
  })
  const [maintenanceDismissed, setMaintenanceDismissed] = useState(false)

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
      <MaintenanceModal
        open={status.maintenance && !maintenanceDismissed}
        onClose={() => setMaintenanceDismissed(true)}
      />
      <UpdateRequiredModal open={status.updateRequired} />
    </>
  )
}
