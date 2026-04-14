'use client'

import { Download } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface UpdateRequiredModalProps {
  open: boolean
}

export function UpdateRequiredModal({ open }: UpdateRequiredModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="bg-white rounded-2xl max-w-sm mx-4 p-6 text-center"
        initialFocus={false}
      >
        <div className="flex flex-col items-center">
          <Download className="w-12 h-12 mb-4 mx-auto" style={{ color: '#0091EA' }} />
          <AlertDialogTitle className="text-[20px] font-bold text-[#212121] mb-2">
            Software Update
          </AlertDialogTitle>
          <p className="text-[12px] font-normal text-[#757575] mb-6">
            A software update is required to continue using the app.
          </p>
          <div className="flex gap-3 w-full">
            <AlertDialogCancel className="flex-1 h-12 rounded-full border-[#E0E0E0] text-[#212121]">
              Quit
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1 h-12 rounded-full bg-[#FFE600] text-[#212121] hover:bg-[#FFE600]/90">
              Now
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
