'use client'

import { Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface KYCExpiredModalProps {
  open: boolean
  onUpdateNow: () => void
  onUpdateLater: () => void
}

export function KYCExpiredModal({
  open,
  onUpdateNow,
  onUpdateLater,
}: KYCExpiredModalProps) {
  const t = useTranslations('kyc')

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-[340px] p-6">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="mb-4">
            <Clock className="w-10 h-10 text-[#9E9E9E]" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-[#212121] text-center">
            {t('expiredModal.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-[#757575] text-center">
            {t('expiredModal.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 mb-6">
          <p className="text-xs text-[#757575] mb-2">
            {t('expiredModal.consequences')}
          </p>
          <ul className="text-xs text-[#757575] list-disc pl-5 space-y-1">
            <li>{t('expiredModal.transfers')}</li>
            <li>{t('expiredModal.deposits')}</li>
            <li>{t('expiredModal.withdrawals')}</li>
          </ul>
        </div>

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onUpdateNow}
            className="w-full h-12 rounded-full bg-[#FFE600] text-[#212121] hover:bg-[#FFE600]/90"
          >
            {t('expiredModal.updateNow')}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onUpdateLater}
            className="w-full h-12 rounded-full"
          >
            {t('expiredModal.updateLater')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
