"use client"

/* ═══════════════════════════════════════
   BottomNav — 5 items, Upgrade o'rtada
   ═══════════════════════════════════════ */

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Sparkles, TrendingUp, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  isUpgrade?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",        label: "Home",    icon: Home },
  { href: "/skills",  label: "Skills",  icon: BookOpen },
  { href: "/upgrade", label: "Upgrade", icon: Sparkles, isUpgrade: true },
  { href: "/stats",   label: "Stats",   icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
]

function NavTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  // Upgrade button - kichikroq, gradient
  if (item.isUpgrade) {
    return (
      <Link
        href={item.href}
        prefetch={true}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
        aria-current={isActive ? "page" : undefined}
      >
        {/* Gradient circle */}
        <div className={`
          w-11 h-11 rounded-full flex items-center justify-center
          bg-gradient-to-br from-primary to-indigo-600
          shadow-md shadow-primary/30
          transition-all duration-200
          ${isActive ? "scale-110 shadow-lg shadow-primary/40" : "hover:scale-105 active:scale-95"}
        `}>
          <Icon
            className="w-5 h-5 text-white"
            strokeWidth={2.5}
            fill="white"
            aria-hidden
          />
        </div>

        {/* Label */}
        <span className="text-[9px] uppercase tracking-widest font-bold text-primary">
          {item.label}
        </span>
      </Link>
    )
  }

  // Regular nav items
  return (
    <Link
      href={item.href}
      prefetch={true}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon pill */}
      <div
        className={[
          "w-11 h-9 flex items-center justify-center rounded-2xl transition-all duration-200",
          isActive
            ? "bg-primary/15 border border-primary/25"
            : "bg-transparent",
        ].join(" ")}
      >
        <Icon
          className={[
            "w-5 h-5 transition-colors",
            isActive ? "text-primary" : "text-on-surface-variant",
          ].join(" ")}
          strokeWidth={isActive ? 2.5 : 2}
          aria-hidden
        />
      </div>

      {/* Label */}
      <span
        className={[
          "text-[9px] uppercase tracking-widest font-bold transition-colors",
          isActive ? "text-primary" : "text-on-surface-variant",
        ].join(" ")}
      >
        {item.label}
      </span>
    </Link>
  )
}

// Exam page'larida BottomNav ko'rinmaydi (native app uslubida)
const EXAM_ROUTES = ["/reading/part-", "/speaking/part-", "/listening/part-"]

export function BottomNav() {
  const pathname = usePathname()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Exam sahifalarida umuman render qilmaymiz
  const isExamPage = EXAM_ROUTES.some(r => pathname.startsWith(r))

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight - 100)
      }
    }
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setIsKeyboardOpen(true)
      }
    }
    const handleFocusOut = () => {
      if (!window.visualViewport || window.visualViewport.height >= window.innerHeight - 100) {
        setIsKeyboardOpen(false)
      }
    }

    window.visualViewport?.addEventListener("resize", handleResize)
    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)
    
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize)
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, [])

  if (isExamPage || isKeyboardOpen) return null

  return (
    <nav
      data-bottom-nav
      className="fixed bottom-0 left-0 right-0 z-50 elevo-glass elevo-nav-sep-top pb-[env(safe-area-inset-bottom)]"
      style={{ borderTop: "1px solid var(--el-nav-sep)" }}
      aria-label="Asosiy navigatsiya"
    >
      {/* Inner content centered to 800px */}
      <div className="mx-auto max-w-[800px] flex items-center px-3 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return <NavTab key={item.href} item={item} isActive={isActive} />
        })}
      </div>
    </nav>
  )
}
