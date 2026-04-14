'use client'

import { useRef, useState, useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'

interface CameraOverlayProps {
  variant: 'document' | 'selfie'
  instruction: string
  helper: string
  galleryLabel?: string
  onCapture: (imageData: string) => void
  onBack: () => void
}

export function CameraOverlay({
  variant,
  instruction,
  helper,
  galleryLabel = 'Choose from gallery',
  onCapture,
  onBack,
}: CameraOverlayProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [showFlash, setShowFlash] = useState(false)

  const handleCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Show capture flash
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 100)

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        onCapture(result)
      }
      reader.readAsDataURL(file)
    },
    [onCapture]
  )

  return (
    <div className="fixed inset-0 bg-[#1A1A2E]/90 z-50 flex flex-col">
      {/* Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-60 transition-opacity duration-100" />
      )}

      {/* Top safe zone */}
      <div className="pt-12 px-4 flex items-center">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-base text-white text-center mb-6">{instruction}</p>

        {variant === 'document' ? (
          /* Document guide frame — 85.6:54 ratio */
          <div className="relative w-full max-w-[calc(100vw-64px)]" style={{ aspectRatio: '85.6 / 54' }}>
            <div className="absolute inset-0 border-2 border-white/80 rounded-lg" />
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#FFE600] rounded-tl" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#FFE600] rounded-tr" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#FFE600] rounded-bl" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#FFE600] rounded-br" />
          </div>
        ) : (
          /* Selfie circle guide — 240px diameter */
          <div className="relative w-60 h-60">
            {/* Pulse ring */}
            <div className="absolute -inset-1 w-[248px] h-[248px] rounded-full border-2 border-[#FFE600]/40 animate-pulse" />
            {/* Circle border */}
            <div className="absolute inset-0 rounded-full border-2 border-white/80" />
            {/* Face silhouette hint */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-24 rounded-full border border-white/20" />
            </div>
          </div>
        )}

        <p className="text-xs text-white/70 text-center mt-4">{helper}</p>
      </div>

      {/* Bottom safe zone */}
      <div className="pb-12 px-4 flex flex-col items-center gap-4">
        {/* Hidden file input with camera capture */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture={variant === 'selfie' ? 'user' : 'environment'}
          className="hidden"
          onChange={handleCapture}
        />
        {/* Hidden gallery-only input (no capture attribute) */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCapture}
        />

        {/* Shutter button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-full bg-white ring-4 ring-[#FFE600] hover:ring-[#FFE600]/80 transition-all active:scale-95"
          aria-label={variant === 'selfie' ? 'Take selfie' : 'Capture photo'}
        />

        {/* Gallery fallback */}
        <button
          onClick={() => galleryRef.current?.click()}
          className="text-xs text-white/70 underline"
          aria-label="Choose photo from gallery"
        >
          {galleryLabel}
        </button>
      </div>
    </div>
  )
}
