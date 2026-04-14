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
          <AlertDialogTitle className="text-xl font-bold text-foreground mb-2">
            Software Update
          </AlertDialogTitle>
          <p className="text-xs font-normal text-[#595959] mb-6">
            A software update is required to continue using the app.
          </p>
          <div className="flex gap-3 w-full">
            <AlertDialogCancel className="flex-1 h-12 rounded-full border-border text-foreground">
              Quit
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1 h-12 rounded-full bg-[#FFE600] text-foreground hover:bg-[#FFE600]/90">
              Now
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
