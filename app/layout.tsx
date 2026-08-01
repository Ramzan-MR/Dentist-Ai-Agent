import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dental Clinic AI Assistant',
  description: 'Book your dental appointment with our AI-powered assistant',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
