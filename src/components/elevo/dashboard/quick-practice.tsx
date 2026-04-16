/* ═══════════════════════════════════════
   QuickPractice — 2×2 practice shortcuts
   Solid card bg, never transparent on hover.
   ═══════════════════════════════════════ */

import Link from "next/link"
import { FileText, Languages, MessagesSquare, BookOpen, ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface PracticeItem {
  href: string
  icon: LucideIcon
  title: string
  subtitle: string
}

const PRACTICE_ITEMS: PracticeItem[] = [
  { href: "/grammar",    icon: FileText,       title: "Grammar",        subtitle: "15 curated tasks"    },
  { href: "/vocabulary", icon: Languages,      title: "Vocabulary",     subtitle: "32 new words"        },
  { href: "/dialogue",   icon: MessagesSquare, title: "Daily Dialogue", subtitle: "Interactive session" },
  { href: "/reading",    icon: BookOpen,       title: "Read Aloud",     subtitle: "AI Tutor"            },
]

function PracticeButton({ item }: { item: PracticeItem }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className="group elevo-card-hover flex flex-col items-start p-5"
    >
      {/* Icon */}
      <div className="w-11 h-11 bg-primary/10 border border-primary/15 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
        <Icon className="w-5 h-5 text-primary" aria-hidden />
      </div>

      {/* Text */}
      <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-none mb-1">
        {item.title}
      </span>
      <span className="text-[10px] font-medium text-on-surface-variant">
        {item.subtitle}
      </span>
    </Link>
  )
}

export function QuickPractice() {
  return (
    <section>
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Quick Practice
        </h2>
        <ChevronRight className="w-4 h-4 text-on-surface-variant/40" aria-hidden />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {PRACTICE_ITEMS.map((item) => (
          <PracticeButton key={item.href} item={item} />
        ))}
      </div>
    </section>
  )
}
