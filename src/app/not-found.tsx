"use client"

/* ═══════════════════════════════════════
   404 Not Found — Professional Elevo design
   Full width centered layout
   ═══════════════════════════════════════ */

import { useRouter } from "next/navigation"
import { ArrowLeft, Home, SearchX } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
      {/* Card */}
      <div className="elevo-card elevo-card-border w-full max-w-md p-8 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <SearchX className="w-8 h-8 text-primary" strokeWidth={2} aria-hidden />
        </div>

        {/* Error code */}
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
          404 Xato
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-on-surface mb-3 leading-tight">
          Sahifa topilmadi
        </h1>

        {/* Description */}
        <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
          Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            <span>Bosh sahifa</span>
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-surface-container-high text-on-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>Orqaga</span>
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-xs text-on-surface-variant/60 text-center">
        Elevo — IELTS Practice Platform
      </p>
    </div>
  )
}
