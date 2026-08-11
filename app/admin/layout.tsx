import type { Metadata } from 'next'
import Sidebar from '@/components/admin/Sidebar'

export const metadata: Metadata = {
  title: 'Admin Dashboard — Dental AI',
  description: 'Manage appointments, conversations, and AI channels',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
