'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { ScannerFrame } from '@/components/features/scanner-frame'

type CameraState = 'requesting' | 'active' | 'denied' | 'unavailable'

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [cameraState, setCameraState] = useState<CameraState>('requesting')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    async function startCamera() {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraState('unavailable')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraState('active')
      } catch {
        setCameraState('denied')
      }
    }

    startCamera()

    return () => {
      stopCamera()
    }
  }, [stopCamera])

  function handleGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Mock behavior: no actual QR decoding in Phase 6
    toast.success('QR code scanned (mock)')
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function handleClose() {
    stopCamera()
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
      <div className="relative flex-1 overflow-hidden">
        {/* Video feed */}
        {cameraState === 'active' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark background when no camera */}
        {(cameraState === 'denied' || cameraState === 'unavailable' || cameraState === 'requesting') && (
          <div className="absolute inset-0 bg-black" />
        )}

        {/* Scanner frame overlay (only when camera active) */}
        {cameraState === 'active' && <ScannerFrame size={240} />}

        {/* Permission denied message */}
        {(cameraState === 'denied' || cameraState === 'unavailable') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <p className="text-sm text-[#595959] text-center">
              Camera access denied. Use gallery to scan.
            </p>
          </div>
        )}

        {/* Requesting state */}
        {cameraState === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}
      </div>

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
