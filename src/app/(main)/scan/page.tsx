'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { LiveScanner } from '@/components/features/live-scanner'
import { useP2PStore } from '@/stores/p2p-store'

const P2P_WALLET_REGEX = /^W-\d{6,}$/

export default function ScanPage() {
  const router = useRouter()
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const handledRef = useRef(false)
  const [scanPaused, setScanPaused] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const { setReceiverWalletId } = useP2PStore()

  function handleQRResult(value: string) {
    if (P2P_WALLET_REGEX.test(value.trim())) {
      // P2P wallet QR detected
      setReceiverWalletId(value.trim())
      router.push('/transfer/p2p/amount')
    } else {
      // Non-P2P QR — existing behavior preserved
      toast.success('QR code scanned (mock)')
    }
  }

  function handleScanResult(value: string) {
    if (handledRef.current) return
    handledRef.current = true
    setScanPaused(true)
    handleQRResult(value)
  }

  function handleCameraError(err: unknown) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      setCameraError(true)
    } else {
      console.error('[Scan] Camera error:', err)
    }
  }

  function handleGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Mock behavior: no actual QR decoding in Phase 6 — P2P routing available for future real detection
    handleQRResult('mock-gallery-scan')
    // Reset input so same file can be re-selected
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
