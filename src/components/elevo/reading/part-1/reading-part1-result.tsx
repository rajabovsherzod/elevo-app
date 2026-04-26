"use client"

import { CheckCircle2, XCircle } from "@/lib/icons"
import { useRef, useEffect } from "react"
import type { ReadingPart1EvaluateResponse } from "@/lib/api/reading"

interface Props {
  result: ReadingPart1EvaluateResponse
}

export function ReadingPart1Result({ result }: Props) {
  const barRef      = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent)
  const isGood      = scorePercent >= 70

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${scorePercent}%`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* Score card */}
      <div className="elevo-card elevo-card-border shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
              Your Score
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.correct_count} / {result.total_questions} correct
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

      {/* Answer breakdown */}
      <div className="elevo-card elevo-card-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-surface-container-lowest" style={{ borderColor: "var(--el-nav-sep)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Detailed Analysis
          </p>
        </div>

        <div className="flex flex-col">
          {result.details.map((d, i) => (
            <div
              key={d.position}
              className="flex flex-col gap-1 px-5 py-4"
              style={i < result.details.length - 1 ? { borderBottom: "1px solid var(--el-nav-sep)" } : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Number & User Answer */}
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded flex items-center justify-center bg-surface-container text-xs font-bold text-on-surface-variant shrink-0">
                    {d.position}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-on-surface-variant mb-0.5">Your Answer</p>
                    <p className={`text-sm font-medium ${d.correct ? "text-emerald-600 dark:text-emerald-400" : "text-error line-through opacity-80"}`}>
                      {d.user_answer || "—"}
                    </p>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="shrink-0 mt-2">
                  {d.correct
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    : <XCircle className="w-5 h-5 text-error" />
                  }
                </div>
              </div>

              {/* Correct Answer */}
              {(!d.correct || d.correct_answer !== d.user_answer) && d.correct_answer && (
                <div className="pl-9 mt-1">
                  <p className="text-[10px] font-semibold uppercase text-on-surface-variant mb-0.5">Correct Answer</p>
                  <p className="text-sm font-semibold text-on-surface">{d.correct_answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
