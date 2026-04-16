"use client"

/* ═══════════════════════════════════════
   404 Not Found — Elevo design system
   Centered layout, dot-grid background,
   indigo accent, solid card.
   ═══════════════════════════════════════ */

import { useRouter } from "next/navigation"
import { ArrowLeft, Home, GraduationCap } from "lucide-react"
import { Button } from "@/components/base/buttons/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">

      {/* Card */}
      <div className="elevo-card elevo-border-glow w-full max-w-md p-10 flex flex-col items-center text-center">

        {/* Logo mark */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
          <GraduationCap className="w-7 h-7 text-primary" aria-hidden />
        </div>

        {/* Error code */}
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-3">
          404 xato
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3 leading-tight">
          Sahifa topilmadi
        </h1>

        {/* Description */}
        <p className="text-sm font-medium text-on-surface-variant leading-relaxed mb-8">
          Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            color="secondary"
            size="lg"
            iconLeading={ArrowLeft}
            onClick={() => router.back()}
            className="flex-1"
          >
            Orqaga
          </Button>

          <Button
            color="primary"
            size="lg"
            iconLeading={Home}
            onClick={() => router.push("/")}
            className="flex-1"
          >
            Bosh sahifa
          </Button>
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-6 text-[11px] font-medium text-on-surface-variant/50 tracking-wide">
        Elevo — IELTS Practice Platform
      </p>
    </div>
  )
}
