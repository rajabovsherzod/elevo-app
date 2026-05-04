"use client"

import { CheckCircle2, XCircle } from "@/lib/icons"
import { useRef, useEffect } from "react"
import type { ReadingPart3EvaluateResponse } from "@/lib/api/reading"

interface Props {
  result: ReadingPart3EvaluateResponse
}

export function ReadingPart3Result({ result }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.summary.score_percent)
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
      <div className="elevo-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
              Your Score
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.summary.correct_count} / {result.summary.total} correct
            </p>
          </div>
          <span className={`text-4xl font-black tabular-nums ${isGood ? "text-primary" : "text-error"}`}>
            {scorePercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={`h-full rounded-full ${isGood ? "bg-primary" : "bg-error"}`}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Answer cards - horizontal layout like Part 1 & 2 */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
          {Object.entries(result.results).map(([position, detail]) => {
            const isCorrect = detail.is_correct

            return (
              <div
                key={position}
                className={`flex flex-col gap-2 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isCorrect ? "bg-green-500/10" : "bg-surface-container-lowest"
                }`}
              >
                {/* Position badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center ${
                      isCorrect
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {position}
                  </span>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error shrink-0" />
                  )}
                </div>

                {/* Answers - horizontal layout */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-on-surface-variant font-medium">YA:</span>
                  <span
                    className={`px-2 py-1 rounded-md font-bold ${
                      isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-error/10 text-error line-through"
                    }`}
                  >
                    {detail.user_answer || "—"}
                  </span>
                </div>

                {!isCorrect && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-on-surface-variant font-medium">CA:</span>
                    <span className="px-2 py-1 rounded-md font-bold bg-primary text-white">
                      {detail.correct_answer}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
