"use client"

/* ═══════════════════════════════════════
   BottomNav — full-width fixed bottom bar
   Glass effect, strong opacity.
   Nav items centered to max-w-[800px].
   ═══════════════════════════════════════ */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, TrendingUp, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",        label: "Home",    icon: Home },
  { href: "/skills",  label: "Skills",  icon: BookOpen },
  { href: "/stats",   label: "Stats",   icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
]

function NavTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon pill */}
      <div
        className={[
          "w-12 h-9 flex items-center justify-center rounded-2xl transition-all duration-200",
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

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 elevo-glass border-t border-outline-variant pb-[env(safe-area-inset-bottom)]"
      aria-label="Asosiy navigatsiya"
    >
      {/* Inner content centered to 800px */}
      <div className="mx-auto max-w-[800px] flex items-center px-4 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return <NavTab key={item.href} item={item} isActive={isActive} />
        })}
      </div>
    </nav>
  )
}
