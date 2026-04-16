/* ═══════════════════════════════════════
   ProgressCard — overall CEFR progress
   Solid card + SVG ring + 3 stat chips.
   ═══════════════════════════════════════ */

interface StatChipProps {
  label: string
  value: string | number
  highlight?: boolean
}

interface ProgressCardProps {
  level: string
  progress: number
  questionsAnswered: number
  accuracy: number
  studyTime: string
}

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CircularRing({ progress, level }: { progress: number; level: string }) {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  return (
    <div className="relative shrink-0 w-24 h-24">
      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96" aria-label={`Progress: ${progress}%`}>
        <circle cx="48" cy="48" r={RADIUS} fill="transparent"
          stroke="currentColor" strokeWidth="6"
          className="text-surface-container-high" />
        <circle cx="48" cy="48" r={RADIUS} fill="transparent"
          stroke="currentColor" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tracking-tighter text-on-surface leading-none">{level}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">level</span>
      </div>
    </div>
  )
}

function StatChip({ label, value, highlight }: StatChipProps) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low rounded-xl">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <span className={`font-bold text-sm ${highlight ? "text-primary" : "text-on-surface"}`}>
        {value}
      </span>
    </div>
  )
}

export function ProgressCard({ level, progress, questionsAnswered, accuracy, studyTime }: ProgressCardProps) {
  return (
    <section className="elevo-card elevo-border-glow p-6">
      <div className="flex items-center gap-6">
        <CircularRing progress={progress} level={level} />
        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
          <StatChip label="Savol"    value={questionsAnswered.toLocaleString()} />
          <StatChip label="To'g'ri" value={`${accuracy}%`} highlight />
          <StatChip label="Vaqt"     value={studyTime} />
        </div>
      </div>
    </section>
  )
}
