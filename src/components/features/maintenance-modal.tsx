'use client'

import { Wrench } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface MaintenanceModalProps {
  open: boolean
  onClose: () => void
}

export function MaintenanceModal({ open, onClose }: MaintenanceModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="bg-white rounded-2xl max-w-sm mx-4 p-6 text-center"
        initialFocus={false}
      >
        <div className="flex flex-col items-center">
          <Wrench className="w-12 h-12 mb-4 mx-auto" style={{ color: '#FF9800' }} />
          <AlertDialogTitle className="text-xl font-bold text-foreground mb-2">
            System Under Maintenance
          </AlertDialogTitle>
          <p className="text-xs font-normal text-[#595959] mb-6">
            Currently system is under maintenance. We will be back soon.
          </p>
          <AlertDialogAction
            onClick={onClose}
            className="w-full h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90"
          >
            Ok
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
