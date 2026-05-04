"use client"

import { CheckCircle2, XCircle } from "@/lib/icons"
import { useRef, useEffect, memo } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart1EvaluateResponse } from "@/lib/api/reading"

// ── Answer Review Grid (like Listening Part 4/5/6) ───────────────────────────
const AnswerReview = memo(function AnswerReview({
  details,
}: {
  details: ReadingPart1EvaluateResponse["details"]
}) {
  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review
        </p>
      </div>
      <div className="p-4">
        {/* Desktop: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {details.map((d) => {
            const isCorrect = d.correct

            return (
              <div
                key={d.position}
                className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                {/* Header: Number + Icon */}
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm">
                    {d.position}
                  </span>
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-error" />
                  }
                </div>

                {/* Answer */}
                {isCorrect ? (
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
                      YA:
                    </p>
                    <span className="text-[13px] font-bold text-green-600 truncate">
                      {d.user_answer}
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
                        {d.user_answer || "—"}
                      </span>
                    </div>
                    {/* Correct answer */}
                    {d.correct_answer && (
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
                          CA:
                        </p>
                        <span className="text-[13px] font-bold text-green-600 truncate">
                          {d.correct_answer}
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

// ── Props / Main ──────────────────────────────────────────────────────────────
interface Props {
  result: ReadingPart1EvaluateResponse
}

export function ReadingPart1Result({ result }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent)
  const isGood = scorePercent >= 70

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${scorePercent}%`
  }, [scorePercent])

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Score card */}
      <div className="elevo-card elevo-card-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
              Your Score
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.correct_count} / {result.total_questions} correct
            </p>
            {result.total_questions - result.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {result.total_questions - result.correct_count} incorrect
              </p>
            )}
          </div>
          <span className={cx("text-4xl font-black tabular-nums", isGood ? "text-primary" : "text-error")}>
            {scorePercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={cx("h-full rounded-full", isGood ? "bg-primary" : "bg-error")}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Answer review grid */}
      <AnswerReview details={result.details} />
    </div>
  )
}
