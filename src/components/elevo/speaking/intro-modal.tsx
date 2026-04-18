"use client"

/* ═══════════════════════════════════════
   IntroModal — 5 second part introduction
   ═══════════════════════════════════════ */

import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"

interface IntroModalProps {
  part: string
  title: string
  description: string
  totalQuestions: number
  onBack?: () => void
}

export function IntroScreen({ part, title, totalQuestions, onBack }: IntroModalProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[60vh] px-4 animate-fade-in">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}

      <div className="elevo-card p-8 flex flex-col items-center w-full max-w-[320px] mx-auto border border-outline-variant/50 shadow-sm mt-4">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            {part}
          </span>
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
            {title}
          </h2>
        </div>

        {/* Clean Instructions Section */}
        <div className="flex flex-col gap-4 text-left w-full mb-8">
          
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary shrink-0" />
            <p className="text-[14px] text-on-surface-variant leading-snug">
              You will be asked <strong className="text-on-surface">{totalQuestions} questions</strong>
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary shrink-0" />
            <p className="text-[14px] text-on-surface-variant leading-snug">
              <strong className="text-on-surface">30 seconds</strong> to answer each question
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary shrink-0" />
            <p className="text-[14px] text-on-surface-variant leading-snug">
              <strong className="text-on-surface">5 seconds</strong> to review your answer
            </p>
          </div>
          
          <div className="mt-2 pt-4 border-t border-outline-variant/50">
            <p className="text-[13px] font-medium text-on-surface text-center opacity-80">
              Please start speaking after the beep
            </p>
          </div>
        </div>

        {/* Minimal Countdown */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant shadow-inner">
            <span className="text-2xl font-black text-primary">
              {countdown}
            </span>
          </div>
          <span className="mt-2 text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">
            Starting soon
          </span>
        </div>

      </div>
    </section>
  )
}
