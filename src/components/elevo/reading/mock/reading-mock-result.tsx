"use client"

import { useRef, useEffect, memo } from "react"
import { Crown, RefreshCw, CheckCircle2, XCircle } from "@/lib/icons"
import type { ReadingMockEvaluateResponse } from "@/lib/api/reading"

// ── Answer Review Grid Component ─────────────────────────────────────────────
const AnswerReviewGrid = memo(function AnswerReviewGrid({
  result,
}: {
  result: ReadingMockEvaluateResponse
}) {
  // Backend returns global results (1-35) directly
  const allAnswers = Object.entries(result.results || {})
    .map(([position, item]) => ({
      position: parseInt(position),
      userAnswer: item.user_answer,
      correctAnswer: item.correct_answer,
      isCorrect: item.is_correct,
    }))
    .sort((a, b) => a.position - b.position)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review (1-35)
        </p>
      </div>
      <div className="p-4">
        {/* Desktop: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allAnswers.map((answer) => {
            const isCorrect = answer.isCorrect

            return (
              <div
                key={answer.position}
                className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                {/* Header: Number + Icon */}
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-primary text-white shadow-sm">
                    {answer.position}
                  </span>
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </div>

                {/* Answer */}
                {isCorrect ? (
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
                      YA:
                    </p>
                    <span className="text-[13px] font-bold text-green-600 truncate">
                      {answer.userAnswer}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {/* User answer (wrong) */}
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
                        YA:
                      </p>
                      <span className="text-[13px] font-bold text-error line-through opacity-70 truncate">
                        {answer.userAnswer || "—"}
                      </span>
                    </div>
                    {/* Correct answer */}
                    {answer.correctAnswer && (
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
                          CA:
                        </p>
                        <span className="text-[13px] font-bold text-green-600 truncate">
                          {answer.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

interface Props {
  result: ReadingMockEvaluateResponse
  onRetry: () => void
}

const PART_NAMES: Record<string, { label: string; desc: string }> = {
  part1: { label: "Part 1", desc: "Gap Filling" },
  part2: { label: "Part 2", desc: "Matching" },
  part3: { label: "Part 3", desc: "Headings" },
  part4: { label: "Part 4", desc: "MCQ + T/F/NG" },
  part5: { label: "Part 5", desc: "Mixed" },
}

const CEFR_COLORS: Record<string, string> = {
  C1: "text-emerald-500",
  B2: "text-blue-500",
  B1: "text-amber-500",
  "Below B1": "text-red-400",
}

const CEFR_BG: Record<string, string> = {
  C1: "bg-emerald-500/10 border-emerald-500/20",
  B2: "bg-blue-500/10 border-blue-500/20",
  B1: "bg-amber-500/10 border-amber-500/20",
  "Below B1": "bg-red-400/10 border-red-400/20",
}

export function ReadingMockResult({ result, onRetry }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const overallPercent = Math.round(result.overall_score_percent || 0)
  const isGood = overallPercent >= 65

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1.2s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${overallPercent}%`
  }, [overallPercent])

  const cefrColor = CEFR_COLORS[result.cefr_level] || "text-on-surface"
  const cefrBg = CEFR_BG[result.cefr_level] || "bg-surface-container border-outline-variant"

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── Hero Score Card ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Full Mock Result
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.total_correct} / {result.total_questions} correct
            </p>
          </div>
        </div>

        {/* Overall score */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black tabular-nums ${isGood ? "text-primary" : "text-error"}`}>
              {overallPercent}
            </span>
            <span className="text-lg font-bold text-on-surface-variant">%</span>
          </div>
          {/* CEFR Badge */}
          <div className={`px-4 py-2 rounded-xl border ${cefrBg}`}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-0.5">
              CEFR Level
            </p>
            <p className={`text-xl font-black ${cefrColor}`}>
              {result.cefr_level}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={`h-full rounded-full ${isGood ? "bg-primary" : "bg-error"}`}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* ── Part Breakdown ──────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Part-by-Part Breakdown
          </p>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {Object.entries(result.part_details || {}).map(([key, partResult]) => {
            if (!partResult) return null
            const meta = PART_NAMES[key] || { label: key, desc: "" }
            const pct = Math.round(partResult.summary?.score_percent || 0)
            const good = pct >= 65

            return (
              <div
                key={key}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                {/* Part info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface">{meta.label}</p>
                  <p className="text-[10px] text-on-surface-variant">{meta.desc}</p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black tabular-nums ${good ? "text-primary" : "text-error"}`}>
                    {pct}%
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    {partResult.summary?.correct_count || 0}/{partResult.summary?.total || 0}
                  </p>
                </div>

                {/* Mini bar */}
                <div className="w-16 h-1.5 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${good ? "bg-primary" : "bg-error"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Answer Review (1-35) ────────────────────────────────────────────── */}
      <AnswerReviewGrid result={result} />

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-white text-sm font-semibold active:scale-[0.97] transition-transform"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
