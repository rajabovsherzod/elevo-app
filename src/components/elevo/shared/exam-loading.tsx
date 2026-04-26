/* ═══════════════════════════════════════
   ExamLoading — Professional loading state
   High-quality Lottie animation
   ═══════════════════════════════════════ */

"use client"

import Lottie from "lottie-react"
import animationData from "../../../../public/loading/exam-loading.json"
import { getLoadingAriaLabel } from "@/lib/utils/a11y"

export function ExamLoading() {
  return (
    <div 
      className="elevo-card elevo-card-border w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8"
      role="status"
      aria-live="polite"
      aria-label={getLoadingAriaLabel("exam")}
    >
      {/* High-quality Lottie animation */}
      <div className="relative w-40 h-40" aria-hidden="true">
        <Lottie
          animationData={animationData}
          loop
          autoPlay
          className="w-full h-full"
        />
      </div>

      {/* Loading text - moved up with negative margin */}
      <p className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant -mt-2">
        EXAM LOADING
      </p>
    </div>
  )
}
