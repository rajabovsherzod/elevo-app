"use client"

import { useRef, useEffect } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cx } from "@/utils/cx"
import type { ListeningPart1EvaluateResponse } from "@/lib/api/listening"

interface ListeningPart1ResultProps {
  result: ListeningPart1EvaluateResponse
}

function getCefrLevel(pct: number) {
  if (pct >= 65) return { label: "C1", color: "#8b5cf6" }
  if (pct >= 51) return { label: "B2", color: "#6366f1" }
  if (pct >= 38) return { label: "B1", color: "#10b981" }
  return { label: "B1-", color: "#f59e0b" }
}

export function ListeningPart1Result({ result }: ListeningPart1ResultProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent)
  const isGood = scorePercent >= 70
  const cefr = getCefrLevel(result.score_percent)

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
    <div className="flex flex-col gap-4">
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
          <div className="text-right">
            <span
              className="text-4xl font-black tabular-nums"
              style={{ color: cefr.color }}
            >
              {scorePercent}%
            </span>
            <p
              className="text-xs font-black uppercase tracking-widest mt-0.5"
              style={{ color: cefr.color }}
            >
              {cefr.label}
            </p>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={cx(
              "h-full rounded-full",
              isGood ? "bg-primary" : "bg-error"
            )}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Per-question grid */}
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface-container-lowest">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Question Results
          </p>
        </div>
        <div className="grid grid-cols-4 gap-px bg-border">
          {result.details.map((d, i) => (
            <div
              key={d.question_id}
              className={cx(
                "flex flex-col items-center gap-1.5 p-3",
                d.correct
                  ? "bg-success-primary/5"
                  : "bg-error-primary/5"
              )}
            >
              <span className="text-[10px] font-black text-on-surface-variant">
                Q{i + 1}
              </span>
              {d.correct ? (
                <CheckCircle2 className="w-5 h-5 text-success-primary" />
              ) : (
                <XCircle className="w-5 h-5 text-error-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
