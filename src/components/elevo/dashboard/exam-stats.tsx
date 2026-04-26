/* ═══════════════════════════════════════
   ExamStats — 2×2 bento grid
   Solid cards with shadow, no glass.
   ═══════════════════════════════════════ */

import { Headphones, BookOpen, Mic, PenLine, type LucideIcon } from "@/lib/icons"

interface SkillStatProps {
  icon: LucideIcon
  label: string
  score: number | string
}

interface ExamStatsProps {
  listening: number | string
  reading:   number | string
  speaking:  number | string
  writing:   number | string
}

function SkillStat({ icon: Icon, label, score }: SkillStatProps) {
  return (
    <div className="elevo-card elevo-card-border p-5 flex flex-col items-center justify-center text-center select-none">
      <div className="w-10 h-10 bg-primary/10 border border-primary/15 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" aria-hidden />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-1.5">
        {label}
      </span>
      <span className="text-2xl font-black text-on-surface leading-none">
        {score}
      </span>
    </div>
  )
}

export function ExamStats({ listening, reading, speaking, writing }: ExamStatsProps) {
  const skills: SkillStatProps[] = [
    { icon: Headphones, label: "Listening", score: listening },
    { icon: BookOpen,   label: "Reading",   score: reading   },
    { icon: Mic,        label: "Speaking",  score: speaking  },
    { icon: PenLine,    label: "Writing",   score: writing   },
  ]

  return (
    <section>
      <div className="flex items-center px-1 mb-3">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Ko'nikmalar darajasi
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill) => (
          <SkillStat key={skill.label} {...skill} />
        ))}
      </div>
    </section>
  )
}
