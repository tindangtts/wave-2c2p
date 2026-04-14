'use client'

import { AlertCircle } from 'lucide-react'

interface GlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body>
        <div className="bg-[#FAFAFA] flex flex-col items-center justify-center px-4 min-h-dvh">
          <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#F44336' }} />
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#212121',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 400,
              color: '#757575',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: '9999px',
              backgroundColor: '#FFE600',
              color: '#212121',
              height: '56px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
