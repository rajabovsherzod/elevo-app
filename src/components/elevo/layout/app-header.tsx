"use client"

/* ═══════════════════════════════════════
   AppHeader — full-width sticky top bar
   Logo + theme switcher + action icons.
   Wrapper: full screen width (no max-w).
   Inner content: max-w-[800px] centered.
   ═══════════════════════════════════════ */

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { GraduationCap, Bell, Sun, Moon } from "lucide-react"

/* ── Theme Switcher ───────────────────────────────── */

function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — render only after mount
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-surface-container"
      aria-label="Temani o'zgartirish"
      suppressHydrationWarning
    >
      {/* Placeholder before mount to avoid layout shift */}
      {!mounted ? (
        <span className="w-5 h-5 block" />
      ) : isDark ? (
        <Sun
          className="w-5 h-5 text-on-surface-variant transition-all duration-300"
          strokeWidth={2}
        />
      ) : (
        <Moon
          className="w-5 h-5 text-on-surface-variant transition-all duration-300"
          strokeWidth={2}
        />
      )}
    </button>
  )
}

/* ── Logo ─────────────────────────────────────────── */

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
        <GraduationCap className="w-[18px] h-[18px] text-primary" aria-hidden />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-on-surface">
        Elevo
      </span>
    </div>
  )
}

/* ── Actions ──────────────────────────────────────── */

function HeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <ThemeSwitcher />
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-surface-container"
        aria-label="Bildirishnomalar"
      >
        <Bell className="w-5 h-5 text-on-surface-variant" />
      </button>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────── */

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 elevo-glass border-b border-outline-variant">
      <div className="mx-auto max-w-[800px] flex items-center justify-between px-6 py-4">
        <Logo />
        <HeaderActions />
      </div>
    </header>
  )
}
