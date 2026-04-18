/* ═══════════════════════════════════════
   ReadyScreen — "Are you ready?" screen
   ═══════════════════════════════════════ */

import { Play, ChevronLeft } from "lucide-react"

interface ReadyScreenProps {
  title: string
  subtitle: string
  duration: string
  onStart: () => void
  onBack?: () => void
}

export function ReadyScreen({ title, subtitle, duration, onStart, onBack }: ReadyScreenProps) {
  return (
    <section className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[60vh] px-4">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}

      <div className="elevo-card p-8 flex flex-col items-center text-center w-full max-w-[300px] mx-auto border border-outline-variant/50 shadow-sm mt-4">
        
        {/* Title */}
        <div className="mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary bg-primary/10 px-3 py-1 rounded-full">
            {title}
          </span>
        </div>
        
        <h1 className="text-2xl font-extrabold text-on-surface mb-6 tracking-tight">
          Are you ready?
        </h1>

        {/* Start button */}
        <button
          onClick={onStart}
          className="group relative w-full overflow-hidden rounded-xl bg-primary text-on-primary shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center justify-center gap-2 py-3">
            <Play className="w-[18px] h-[18px] fill-current" aria-hidden />
            <span className="text-base font-bold tracking-wide">Start Test</span>
          </div>
        </button>

      </div>
    </section>
  )
}
