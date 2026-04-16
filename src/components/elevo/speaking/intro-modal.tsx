"use client"

/* ═══════════════════════════════════════
   IntroModal — 5 second part introduction
   ═══════════════════════════════════════ */

import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"

interface IntroModalProps {
  part: string
  title: string
  description: string
  totalQuestions: number
}

export function IntroModal({ part, title, description, totalQuestions }: IntroModalProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="elevo-card max-w-md mx-5 p-8 text-center animate-slide-up">
        {/* Icon */}
        <div className="relative mb-6 inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-primary" strokeWidth={2} aria-hidden />
          </div>
        </div>

        {/* Part label */}
        <div className="mb-2">
          <span className="text-xs font-black uppercase tracking-[0.15em] text-primary">
            {part}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-on-surface mb-3 tracking-tight">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
          {description}
        </p>

        {/* Questions count */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full mb-6">
          <span className="text-xs font-bold text-on-surface-variant">
            {totalQuestions} ta savol
          </span>
        </div>

        {/* Countdown */}
        <div className="relative w-16 h-16 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              className="text-surface-container-high"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - countdown / 5)}
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-primary">
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
