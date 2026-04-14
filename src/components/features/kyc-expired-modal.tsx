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
            <Clock className="w-10 h-10 text-[#767676]" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-foreground text-center">
            {t('expiredModal.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-[#595959] text-center">
            {t('expiredModal.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 mb-6">
          <p className="text-xs text-[#595959] mb-2">
            {t('expiredModal.consequences')}
          </p>
          <ul className="text-xs text-[#595959] list-disc pl-5 space-y-1">
            <li>{t('expiredModal.transfers')}</li>
            <li>{t('expiredModal.deposits')}</li>
            <li>{t('expiredModal.withdrawals')}</li>
          </ul>
        </div>

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onUpdateNow}
            className="w-full h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
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
