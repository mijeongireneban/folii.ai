import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'folii.ai',
  description:
    'Upload a resume, refine via chat, publish a portfolio in five minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
