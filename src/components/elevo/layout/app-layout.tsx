/* ═══════════════════════════════════════
   AppLayout — centered content container
   max-w-[800px], dot grid is on body (globals.css)
   Header and BottomNav are full-width independently.
   ═══════════════════════════════════════ */

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="mx-auto max-w-[800px] min-h-screen">
      {children}
    </div>
  )
}
