"use client"

/* ═══════════════════════════════════════
   AppHeader — full-width sticky top bar
   Logo + theme switcher + action icons.
   Wrapper: full screen width (no max-w).
   Inner content: max-w-[800px] centered.
   ═══════════════════════════════════════ */

import { GraduationCap } from "@/lib/icons"

/* ── Logo ─────────────────────────────────────────── */

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
        <GraduationCap className="w-[18px] h-[18px] text-primary" aria-hidden />
      </div>
      <span className="text-xl font-extrabold tracking-tight text-on-surface">
        Elevo
      </span>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────── */

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 elevo-glass elevo-nav-sep-bottom" style={{ borderBottom: "1px solid var(--el-nav-sep)" }}>
      {/* pt-12 (yoki safe-area) status bar (soat, batareya) ustiga chiqib ketmasligi uchun */}
      <div className="mx-auto max-w-[800px] flex items-center justify-center px-6 pt-[calc(env(safe-area-inset-top,0px)+44px)] pb-4">
        <Logo />
      </div>
    </header>
  )
}
