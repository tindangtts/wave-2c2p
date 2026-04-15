'use client'

import { useRef, useState, useCallback } from 'react'
import { ChevronLeft, ShieldCheck, Image as ImageIcon, Zap } from 'lucide-react'

interface CameraOverlayProps {
  variant: 'document' | 'selfie'
  instruction: string
  helper: string
  galleryLabel?: string
  headerTitle?: string
  onCapture: (imageData: string) => void
  onBack: () => void
}

export function CameraOverlay({
  variant,
  instruction,
  helper,
  galleryLabel = 'Choose from gallery',
  headerTitle,
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

      {/* Top header bar */}
      <div className="pt-12 px-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-[#0091EA]" />
        </button>
        {headerTitle && (
          <h1 className="text-base font-semibold text-white">{headerTitle}</h1>
        )}
        <div className="w-6" /> {/* spacer for centering */}
      </div>

      {variant === 'document' && (
        /* Yellow instruction banner — per Pencil design */
        <div className="mx-4 mt-3 bg-[#FFE600] rounded-lg py-2 px-4">
          <p className="text-sm text-foreground text-center font-medium">{instruction}</p>
        </div>
      )}

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {variant === 'document' ? (
          /* Document guide frame — 85.6:54 ratio — UNCHANGED */
          <div className="relative w-full max-w-[calc(100vw-64px)]" style={{ aspectRatio: '85.6 / 54' }}>
            <div className="absolute inset-0 border-2 border-white/30 rounded-lg" />
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-white rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-white rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-white rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-white rounded-br" />
          </div>
        ) : (
          /* Selfie face guide — circular cutout with dashed border */
          <div className="flex flex-col items-center">
            {/* Outer dimming overlay + circular cutout */}
            <div
              className="relative animate-fade-in"
              style={{ width: '240px', height: '240px' }}
              aria-hidden="true"
            >
              {/* Dark semi-transparent background around the circle */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}
              />
              {/* Dashed white circle border */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px dashed rgba(255,255,255,0.85)' }}
              />
            </div>

            {/* Instruction text — below circle, xl gap (32px) */}
            <p className="text-base text-white text-center mt-8 px-4">
              {instruction}
            </p>

            {/* Helper text */}
            <p
              className="text-[12px] text-center mt-2 px-4"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {helper}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
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

        {/* Privacy notice — per Pencil design (document mode) */}
        {variant === 'document' && (
          <div className="flex items-start gap-2 mb-2 max-w-[300px]">
            <ShieldCheck className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
            <p className="text-xs text-white/70">
              Your information will be kept confidential in accordance with the company&apos;s privacy policy.
            </p>
          </div>
        )}

        {/* Camera controls row */}
        <div className="flex items-center justify-center gap-10 w-full">
          {/* Gallery button */}
          <button
            onClick={() => galleryRef.current?.click()}
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10"
            aria-label="Choose photo from gallery"
          >
            <ImageIcon className="w-5 h-5 text-white/70" />
          </button>

          {/* Shutter button */}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-full bg-white ring-4 ring-white/30 hover:ring-white/50 transition-all active:scale-95"
            aria-label={variant === 'selfie' ? 'Take selfie' : 'Capture photo'}
          />

          {/* Flash toggle (visual only) */}
          <button
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10"
            aria-label="Toggle flash"
          >
            <Zap className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>
    </div>
  )
}
