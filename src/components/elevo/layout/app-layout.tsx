/* ═══════════════════════════════════════
   AppLayout — persistent shell
   Header and BottomNav are always mounted.
   They auto-hide on exam routes.
   Children swap instantly — no animation on shell.
   ═══════════════════════════════════════ */

"use client"

import { memo, useEffect } from "react"
import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"
import { DevConsole } from "@/components/dev/dev-console"

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayoutComponent = ({ children }: AppLayoutProps) => {
  // Mark body as hydrated to prevent FOUC
  useEffect(() => {
    document.body.classList.add('hydrated')
  }, [])

  return (
    <>
      <AppHeader />
      
      {/* Main content area — always same padding, instant child swap */}
      <main className="flex-1 flex flex-col mx-auto max-w-[800px] w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+112px)] pb-[100px]">
        {children}
      </main>

      <BottomNav />
      
      {/* Dev Console - faqat development'da */}
      <DevConsole />
    </>
  )
}

// Memo to prevent re-render when parent re-renders
export const AppLayout = memo(AppLayoutComponent)

