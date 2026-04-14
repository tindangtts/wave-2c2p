'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import { BackHeader } from '@/components/layout/back-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useWallet } from '@/hooks/use-wallet'

export default function ReceiveQRPage() {
  const { data, isLoading } = useWallet()
  const walletId = data?.profile?.wallet_id ?? ''

  const handleShare = useCallback(async () => {
    if (!walletId) return

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: walletId })
        return
      } catch {
        // User cancelled or share not available — fall through to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(walletId)
        toast.success('Wallet ID copied')
      } catch {
        toast.error('Unable to copy wallet ID')
      }
    }
  }, [walletId])

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Receive Money" />

      <div className="flex-1 px-4 py-6 flex flex-col items-center">
        {/* QR Card */}
        <div className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          {/* Logo placeholder */}
          <p className="text-sm font-bold text-[#0091EA] mb-1">2C2P WAVE</p>

          {/* Wallet ID label */}
          <p className="text-xs font-normal text-[#595959] mb-4">Your Wallet ID</p>

          {/* QR code */}
          {isLoading ? (
            <Skeleton className="w-[200px] h-[200px] rounded-xl" />
          ) : walletId ? (
            <QRCode value={walletId} size={200} />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-secondary rounded-xl">
              <p className="text-xs text-[#595959] text-center px-4">
                Wallet ID not available
              </p>
            </div>
          )}

          {/* Wallet ID text */}
          <div className="mt-3 text-center">
            {isLoading ? (
              <Skeleton className="h-5 w-40 rounded-lg mx-auto" />
            ) : (
              <p className="text-base font-bold text-foreground">
                {walletId || '—'}
              </p>
            )}
          </div>
        </div>

        {/* Share QR button */}
        <button
          type="button"
          onClick={handleShare}
          disabled={isLoading || !walletId}
          className="mt-6 w-full h-14 rounded-full bg-[#FFE600] text-foreground text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          Share QR
        </button>
      </div>
    </div>
  )
}
