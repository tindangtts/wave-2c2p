'use client'

import { AlertCircle } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="bg-[#FAFAFA] flex flex-col items-center justify-center px-4 min-h-dvh">
      <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#F44336' }} />
      <h1 className="text-[20px] font-bold text-[#212121] text-center mb-2">
        Something went wrong
      </h1>
      <p className="text-[16px] font-normal text-[#757575] text-center mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[#FFE600] text-[#212121] h-14 px-8 text-base font-medium"
      >
        Try Again
      </button>
    </div>
  )
}
