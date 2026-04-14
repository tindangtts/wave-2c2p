'use client'

interface ScannerFrameProps {
  /** Size of the transparent scan area in pixels. Defaults to 240. */
  size?: number
}

/**
 * ScannerFrame — dark overlay with a transparent 240x240 centered scan area.
 * Uses box-shadow hack for the dark mask: zero-offset shadow with a huge spread
 * creates a solid overlay outside the element without needing 4 separate divs.
 * White L-shaped corner markers (24px long, 3px wide) sit at each corner.
 */
export function ScannerFrame({ size = 240 }: ScannerFrameProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Scan area: transparent center with dark mask outside via box-shadow */}
      <div
        style={{
          width: size,
          height: size,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
      >
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: 24,
            height: 24,
            borderTop: '3px solid #FFFFFF',
            borderLeft: '3px solid #FFFFFF',
          }}
        />
        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: 24,
            height: 24,
            borderTop: '3px solid #FFFFFF',
            borderRight: '3px solid #FFFFFF',
          }}
        />
        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: 24,
            height: 24,
            borderBottom: '3px solid #FFFFFF',
            borderLeft: '3px solid #FFFFFF',
          }}
        />
        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0"
          style={{
            width: 24,
            height: 24,
            borderBottom: '3px solid #FFFFFF',
            borderRight: '3px solid #FFFFFF',
          }}
        />
      </div>

      {/* Instruction text below scan frame */}
      <p
        className="text-center mt-4"
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: '#FFFFFF',
        }}
      >
        Point your camera at a QR code
      </p>
    </div>
  )
}
