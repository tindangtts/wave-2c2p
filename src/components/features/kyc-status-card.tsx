'use client'

import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'

interface KYCStatusCardProps {
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  submittedAt?: string
  documentType?: string
  verificationId?: string
  rejectionReasons?: string[]
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    bgColor: 'bg-[#FF9800]',
  },
  approved: {
    icon: CheckCircle,
    bgColor: 'bg-[#00C853]',
  },
  rejected: {
    icon: XCircle,
    bgColor: 'bg-[#F44336]',
  },
  expired: {
    icon: Clock,
    bgColor: 'bg-[#9E9E9E]',
  },
} as const

export function KYCStatusCard({
  status,
  submittedAt,
  documentType,
  verificationId,
  rejectionReasons,
}: KYCStatusCardProps) {
  const t = useTranslations('kyc')
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  // Failed/rejected/expired states render as floating modal card per Pencil design
  const isModalStyle = status === 'rejected' || status === 'expired'

  if (isModalStyle) {
    return (
      <div className="flex flex-col items-center w-full">
        {/* Modal-style card — per Pencil design (floating card with shadow) */}
        <Card className="w-full max-w-[320px] p-6 rounded-2xl shadow-lg flex flex-col items-center">
          {/* Status icon */}
          <div
            className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}
            aria-label={`Status: ${status}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Status title */}
          <h2 className="text-lg font-bold text-[#212121] text-center mb-2">
            {t(`status.${status}.title`)}
          </h2>

          {/* Status description */}
          <p className="text-sm text-[#757575] text-center mb-4">
            {t(`status.${status}.description`)}
          </p>

          {/* Rejection reasons */}
          {status === 'rejected' && rejectionReasons && rejectionReasons.length > 0 && (
            <>
              <Separator className="my-3 w-full" />
              <ul role="list" className="space-y-2 w-full">
                {rejectionReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-[#F44336] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#212121]">{reason}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    )
  }

  // Normal card layout for pending/approved
  return (
    <div className="flex flex-col items-center w-full">
      {/* Status icon */}
      <div
        className={`w-14 h-14 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}
        aria-label={`Status: ${status}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Status title */}
      <h2 className="text-xl font-bold text-[#212121] text-center mb-2">
        {t(`status.${status}.title`)}
      </h2>

      {/* Status description */}
      <p className="text-base text-[#757575] text-center mb-6 max-w-[300px]">
        {t(`status.${status}.description`)}
      </p>

      {/* Detail card */}
      <Card className="w-full p-4 rounded-xl">
        {submittedAt && (
          <p className="text-xs text-[#757575]">Submitted {submittedAt}</p>
        )}
        {documentType && (
          <p className="text-base text-[#212121] mt-2">
            Document: {documentType}
          </p>
        )}
        {verificationId && (
          <p className="text-xs text-[#757575] mt-1">Ref: {verificationId}</p>
        )}
      </Card>
    </div>
  )
}
