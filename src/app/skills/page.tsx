/* ═══════════════════════════════════════
   Skills Page — IELTS skills practice
   ═══════════════════════════════════════ */

import Link from "next/link"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { BookOpen, Headphones, Mic, PenLine } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export default function SkillsPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page Header with icon */}
      <PageHeader
        title="Skills Practice"
        subtitle="Til ko'nikmalarini rivojlantiring"
        icon={BookOpen}
      />

      {/* Skill cards */}
      <div className="grid grid-cols-2 gap-4">
        <SkillCard icon={Headphones} title="Listening" count={24} href="/listening" />
        <SkillCard icon={BookOpen} title="Reading" count={32} href="/reading" />
        <SkillCard icon={Mic} title="Speaking" count={18} href="/speaking" />
        <SkillCard icon={PenLine} title="Writing" count={15} href="/writing" />
      </div>
    </div>
  )
}

interface SkillCardProps {
  icon: LucideIcon
  title: string
  count: number
  href: string
}

function SkillCard({ icon: Icon, title, count, href }: SkillCardProps) {
  return (
    <Link href={href} prefetch={true} className="elevo-card-hover elevo-card-border p-5 flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-primary/10 border border-primary/15 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-sm font-bold text-on-surface mb-1">{title}</span>
      <span className="text-xs text-on-surface-variant">{count} exercises</span>
    </Link>
  )
}
