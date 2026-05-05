"use client"

import { useRef, useEffect } from "react"
import { Headphones, RefreshCw } from "@/lib/icons"
import { AnswerCard } from "@/components/elevo/shared/answer-card"
import type { ListeningMockEvaluateResponse } from "@/lib/api/listening-mock"

interface Props {
  result: ListeningMockEvaluateResponse
  onRetry: () => void
}

const PART_NAMES: Record<string, { label: string; desc: string; range: string }> = {
  part1: { label: "Part 1", desc: "Short Conversations", range: "1-8" },
  part2: { label: "Part 2", desc: "Gap Filling", range: "9-13" },
  part3: { label: "Part 3", desc: "Speaker Matching", range: "14-18" },
  part4: { label: "Part 4", desc: "Map Task", range: "19-23" },
  part5: { label: "Part 5", desc: "Multiple Choice", range: "24-29" },
  part6: { label: "Part 6", desc: "Gap Filling", range: "30-35" },
}

const CEFR_COLORS: Record<string, string> = {
  C1: "text-indigo-500",
  B2: "text-indigo-500",
  B1: "text-indigo-500",
  "Below B1": "text-indigo-500",
}

const CEFR_BG: Record<string, string> = {
  C1: "bg-indigo-500/10 border-indigo-500/20",
  B2: "bg-indigo-500/10 border-indigo-500/20",
  B1: "bg-indigo-500/10 border-indigo-500/20",
  "Below B1": "bg-indigo-500/10 border-indigo-500/20",
}

export function ListeningMockResult({ result, onRetry }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const overallPercent = Math.round(result.overall_score_percent)
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

  // Build answer cards from global results (1-35)
  const answerCards = Object.entries(result.results)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([position, item]) => ({
      position: parseInt(position),
      isCorrect: item.is_correct,
      userAnswer: item.user_answer || "—",
      correctAnswer: item.correct_answer || "—",
    }))

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── Hero Score Card ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-indigo-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Listening Full Mock Result
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.total_correct} / {result.total_questions} correct
            </p>
          </div>
        </div>

        {/* Overall score */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black tabular-nums ${isGood ? "text-indigo-500" : "text-error"}`}>
              {overallPercent}
            </span>
            <span className="text-lg font-bold text-on-surface-variant">%</span>
          </div>
          {/* CEFR Badge */}
          <div className={`px-4 py-2 rounded-xl border ${cefrBg}`}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface mb-0.5">
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
            className={`h-full rounded-full ${isGood ? "bg-indigo-500" : "bg-error"}`}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* ── Part Breakdown ──────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-indigo-500/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
            Part-by-Part Breakdown
          </p>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {Object.entries(result.part_details).map(([key, partDetail]) => {
            if (!partDetail) return null
            const meta = PART_NAMES[key] || { label: key, desc: "", range: "" }
            const pct = Math.round(partDetail.summary.score_percent)
            const good = pct >= 65

            return (
              <div
                key={key}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                {/* Part info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface">
                    {meta.label} <span className="text-on-surface-variant">({meta.range})</span>
                  </p>
                  <p className="text-[10px] text-on-surface-variant">{meta.desc}</p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black tabular-nums ${good ? "text-indigo-500" : "text-error"}`}>
                    {pct}%
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    {partDetail.summary.correct_count}/{partDetail.summary.total}
                  </p>
                </div>

                {/* Mini bar */}
                <div className="w-16 h-1.5 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${good ? "bg-indigo-500" : "bg-error"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Answer Cards Grid (1-35) ────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-indigo-500/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
            Answer Review (1-35)
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {answerCards.map((card) => (
              <AnswerCard
                key={card.position}
                questionNumber={card.position}
                userAnswer={card.userAnswer}
                correctAnswer={card.correctAnswer}
                isCorrect={card.isCorrect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-semibold active:scale-[0.97] transition-transform"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
