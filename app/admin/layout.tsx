import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Dental Clinic',
  description: 'Manage dental appointments',
}

export default function AdminLayout({
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
