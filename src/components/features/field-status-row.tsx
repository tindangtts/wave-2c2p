'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FieldStatusRowProps {
  label: string
  status: 'accepted' | 'rejected'
  onRetake?: () => void
}

export function FieldStatusRow({ label, status, onRetake }: FieldStatusRowProps) {
  const isAccepted = status === 'accepted'

  return (
    <div
      className={`flex items-center gap-3 h-14 px-4 rounded-lg ${
        isAccepted
          ? 'bg-[#FAFAFA]'
          : 'bg-white border border-[#F44336]'
      }`}
      aria-label={`${label}: ${status}`}
    >
      {/* Status icon */}
      {isAccepted ? (
        <CheckCircle className="w-5 h-5 text-[#00C853] shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-[#F44336] shrink-0" />
      )}

      {/* Label */}
      <span
        className={`text-base flex-1 ${
          isAccepted ? 'text-[#757575]' : 'text-[#212121]'
        }`}
      >
        {label}
      </span>

      {/* Action */}
      {isAccepted ? (
        <Badge className="bg-[#00C853]/10 text-[#00C853] border-0 hover:bg-[#00C853]/10">
          Accepted
        </Badge>
      ) : (
        <Button variant="outline" size="sm" onClick={onRetake}>
          Retake
        </Button>
      )}
    </div>
  )
}
