'use client'

import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { ScannerFrame } from '@/components/features/scanner-frame'

interface LiveScannerProps {
  onScan: (value: string) => void
  onError?: (error: unknown) => void
  paused?: boolean
}

/**
 * LiveScanner — wraps @yudiel/react-qr-scanner with ScannerFrame overlay.
 * Handles camera acquisition, frame capture, and barcode detection automatically.
 * Uses `finder: false` to disable the built-in overlay in favour of ScannerFrame.
 */
export function LiveScanner({ onScan, onError, paused = false }: LiveScannerProps) {
  function handleScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue
    if (value) {
      onScan(value)
    }
  }

  function handleError(err: unknown) {
    if (onError) {
      onError(err)
    } else {
      console.error('[LiveScanner]', err)
    }
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <Scanner
        constraints={{ facingMode: 'environment' }}
        formats={['qr_code']}
        scanDelay={300}
        components={{ finder: false }}
        paused={paused}
        styles={{
          container: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
          video: { width: '100%', height: '100%', objectFit: 'cover' },
        }}
        onScan={handleScan}
        onError={handleError}
      />
      <ScannerFrame size={240} />
    </div>
  )
}
