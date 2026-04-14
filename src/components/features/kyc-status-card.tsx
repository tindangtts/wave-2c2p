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

        {/* Rejection reasons */}
        {status === 'rejected' && rejectionReasons && rejectionReasons.length > 0 && (
          <>
            <Separator className="my-3" />
            <h3 className="text-xl font-bold text-[#212121] mb-2">
              {t('status.rejected.issuesTitle')}
            </h3>
            <ul role="list" className="space-y-2">
              {rejectionReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-[#F44336] mt-0.5 shrink-0" />
                  <span className="text-base text-[#212121]">{reason}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}
