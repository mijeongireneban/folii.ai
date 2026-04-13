'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body
        style={{
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          gap: 16,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 500 }}>Something went wrong</h2>
        <button
          onClick={reset}
          style={{
            background: '#0099ff',
            color: '#fff',
            border: 'none',
            borderRadius: 100,
            padding: '10px 20px',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
