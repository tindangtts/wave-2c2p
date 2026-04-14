'use client'

import { useAppVisibility } from '@/hooks/use-app-visibility'
import { BottomNav } from '@/components/layout/bottom-nav'

function AppVisibilityGuard({ children }: { children: React.ReactNode }) {
  useAppVisibility()
  return <>{children}</>
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppVisibilityGuard>
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">{children}</main>
      <BottomNav />
    </AppVisibilityGuard>
  )
}
