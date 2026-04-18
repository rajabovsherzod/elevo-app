/* ═══════════════════════════════════════
   Speaking Page — IELTS Speaking practice
   Full Mock + 4 Parts (1.1, 1.2, 2, 3)
   ═══════════════════════════════════════ */

import Link from "next/link"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { Mic, Play, Clock, MessageSquare, Users, Lightbulb } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export default function SpeakingPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <PageHeader
        title="Speaking Practice"
        subtitle="Nutq ko'nikmalarini rivojlantiring"
        icon={Mic}
      />

      {/* Full Mock Test */}
      <FullMockCard />

      {/* Parts Grid */}
      <div className="grid grid-cols-2 gap-4">
        <PartCard
          part="Part 1.1"
          title="Introduction"
          duration="2 min"
          icon={MessageSquare}
          color="#6366f1"
          href="/speaking/part-1-1"
        />
        <PartCard
          part="Part 1.2"
          title="Familiar Topics"
          duration="2 min"
          icon={Users}
          color="#8b5cf6"
          href="/speaking/part-1-2"
        />
        <PartCard
          part="Part 2"
          title="Long Turn"
          duration="3 min"
          icon={Clock}
          color="#ec4899"
          href="/speaking/part-2"
        />
        <PartCard
          part="Part 3"
          title="Discussion"
          duration="3 min"
          icon={Lightbulb}
          color="#f59e0b"
          href="/speaking/part-3"
        />
      </div>
    </div>
  )
}

/* ── Full Mock Card ─────────────────────────────────────────── */

function FullMockCard() {
  return (
    <Link
      href="/speaking/full-mock"
      className="group relative elevo-card-hover p-6 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />

      {/* Decorative circle */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left: Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-primary fill-primary" aria-hidden />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
              Full Test
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors">
            Full Mock Test
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To'liq Speaking mashg'uloti (11 daqiqa)
          </p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-on-surface-variant" aria-hidden />
              <span className="text-xs font-medium text-on-surface-variant">11 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-on-surface-variant" aria-hidden />
              <span className="text-xs font-medium text-on-surface-variant">AI Tutor</span>
            </div>
          </div>
        </div>

        {/* Right: Large icon */}
        <div className="shrink-0 w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Mic className="w-10 h-10 text-primary" strokeWidth={2} aria-hidden />
        </div>
      </div>
    </Link>
  )
}

/* ── Part Card ──────────────────────────────────────────────── */

interface PartCardProps {
  part: string
  title: string
  duration: string
  icon: LucideIcon
  color: string
  href: string
}

function PartCard({ part, title, duration, icon: Icon, color, href }: PartCardProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="group elevo-card-hover p-5 flex flex-col"
      style={{ ['--part-color' as string]: color }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{
          backgroundColor: `color-mix(in srgb, var(--part-color) 8%, transparent)`,
          borderWidth: 1,
          borderColor: `color-mix(in srgb, var(--part-color) 15%, transparent)`,
        }}
      >
        <Icon
          className="w-6 h-6"
          style={{ color: 'var(--part-color)' }}
          strokeWidth={2}
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant mb-1 block">
          {part}
        </span>
        <h3 className="text-sm font-bold text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2">
          <Clock className="w-3.5 h-3.5 text-on-surface-variant" aria-hidden />
          <span className="text-xs text-on-surface-variant">{duration}</span>
        </div>
      </div>
    </Link>
  )
}
