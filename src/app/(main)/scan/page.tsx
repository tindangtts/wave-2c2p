'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { LiveScanner } from '@/components/features/live-scanner'
import { useP2PStore } from '@/stores/p2p-store'
import { detectQRType, decodeQRFromFile } from '@/lib/qr-detection'

export default function ScanPage() {
  const router = useRouter()
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const handledRef = useRef(false)
  const [scanPaused, setScanPaused] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const { setReceiverWalletId } = useP2PStore()

  function handleScanResult(value: string) {
    if (handledRef.current) return
    handledRef.current = true
    setScanPaused(true)

    const result = detectQRType(value)
    if (result.type === 'p2p_wallet') {
      setReceiverWalletId(result.walletId)
      router.push('/transfer/p2p/amount')
    } else {
      toast.info(`QR: ${result.rawValue}`)
      // Reset scan state so user can scan again
      handledRef.current = false
      setScanPaused(false)
    }
  }

  function handleCameraError(err: unknown) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      setCameraError(true)
    } else {
      console.error('[Scan] Camera error:', err)
    }
  }

  async function handleGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const decoded = await decodeQRFromFile(file)
    if (decoded) {
      handleScanResult(decoded)
    } else {
      toast.error('No QR code found in image')
    }
    e.target.value = ''
  }

  function handleClose() {
    router.push('/home')
  }

  function handleReceiveMoney() {
    router.push('/scan/receive-qr')
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Header */}
      <div className="relative z-10 pt-11 px-4 h-14 flex items-center justify-between bg-[#FFE600]">
        <div className="w-6" />
        <h1 className="text-xl font-bold text-[#0091EA]">Scan QR Code</h1>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close scanner"
          className="p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Camera area */}
      {!cameraError ? (
        <LiveScanner
          onScan={handleScanResult}
          onError={handleCameraError}
          paused={scanPaused}
        />
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <p className="text-sm text-[#595959] text-center">
              Camera access denied. Use gallery to scan.
            </p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="relative z-10 px-4 pb-8 pt-4 flex flex-col items-center gap-3 safe-bottom">
        {/* Hidden file input for gallery (no capture — gallery only) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleGallerySelect}
          aria-label="Upload QR from gallery"
        />

        {/* Upload from Gallery */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="w-full h-12 rounded-full border border-white text-white text-base font-medium hover:bg-white/10 transition-colors"
        >
          Upload from Gallery
        </button>

        {/* Receive Money with QR */}
        <button
          type="button"
          onClick={handleReceiveMoney}
          className="w-full h-12 rounded-full bg-[#FFE600] text-foreground text-base font-bold active:scale-[0.98] transition-transform"
        >
          Receive Money with QR
        </button>
      </div>
    </div>
  )
}
