/* ═══════════════════════════════════════
   ReadyScreen — "Are you ready?" screen
   ═══════════════════════════════════════ */

import { Play, Clock, MessageSquare } from "lucide-react"

interface ReadyScreenProps {
  title: string
  subtitle: string
  duration: string
  onStart: () => void
}

export function ReadyScreen({ title, subtitle, duration, onStart }: ReadyScreenProps) {
  return (
    <section className="elevo-card p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center">
          <MessageSquare className="w-12 h-12 text-primary" strokeWidth={2} aria-hidden />
        </div>
      </div>

      {/* Title */}
      <div className="mb-2">
        <span className="text-xs font-black uppercase tracking-[0.15em] text-on-surface-variant">
          {title}
        </span>
      </div>
      <h1 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">
        {subtitle}
      </h1>

      {/* Duration */}
      <div className="flex items-center gap-2 mb-8">
        <Clock className="w-4 h-4 text-on-surface-variant" aria-hidden />
        <span className="text-sm text-on-surface-variant font-medium">
          {duration}
        </span>
      </div>

      {/* Ready text */}
      <p className="text-xl font-bold text-on-surface mb-8">
        Are you ready?
      </p>

      {/* Start button */}
      <button
        onClick={onStart}
        className="group elevo-btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        <Play className="w-5 h-5 fill-current" aria-hidden />
        <span className="text-lg font-bold">Start</span>
      </button>

      {/* Instructions */}
      <div className="mt-12 max-w-md">
        <div className="elevo-card p-5 text-left">
          <h3 className="text-sm font-bold text-on-surface mb-3">
            Ko'rsatmalar:
          </h3>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Har bir savol uchun 30 sekund vaqt beriladi</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Mikrofonga ruxsat bering</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Tinch muhitda mashq qiling</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
