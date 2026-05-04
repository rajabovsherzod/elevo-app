"use client"

import { CheckCircle2, XCircle, AlertCircle } from "@/lib/icons"
import { useRef, useEffect } from "react"
import type {
  ReadingPart4EvaluateResponse,
  ReadingPart4Question,
} from "@/lib/api/reading"

interface Props {
  result: ReadingPart4EvaluateResponse
  questions: ReadingPart4Question[]
}

export function ReadingPart4Result({ result, questions }: Props) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            {result.summary.total - result.summary.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-1">
                {result.summary.total - result.summary.correct_count} incorrect
              </p>
            )}
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

      {/* Answer review - Card style like Part 2/3 */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>

        {/* Desktop: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {Object.entries(result.results).map(([position, res]) => {
            const question = questions.find((q) => q.position === parseInt(position))
            const isCorrect = res.is_correct
            const pos = parseInt(position)
            
            // For questions 1-4 (MCQ): show only letter (A, B, C, D)
            // For questions 5-9 (T/F/NG): show full text (TRUE/FALSE/NOT GIVEN)
            const isTFNG = pos >= 5
            const userAnswerDisplay = isTFNG 
              ? (question?.answers.find(a => a.letter === res.user_answer)?.text || res.user_answer)
              : res.user_answer
            const correctAnswerDisplay = isTFNG
              ? (question?.answers.find(a => a.letter === res.correct_answer)?.text || res.correct_answer)
              : res.correct_answer

            return (
              <div
                key={position}
                className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                {/* Header: Number + Icon */}
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm">
                    {position}
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
                    {/* Desktop: "Your Answer:", Mobile: "YA:" */}
                    <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0 hidden md:inline">
                      Your Answer:
                    </p>
                    <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0 md:hidden">
                      YA:
                    </p>
                    <span className="text-[10px] font-bold text-green-600 truncate">
                      {userAnswerDisplay}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {/* User answer (wrong) */}
                    <div className="flex items-center gap-1.5">
                      {/* Desktop: "Your Answer:", Mobile: "YA:" */}
                      <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0 hidden md:inline">
                        Your Answer:
                      </p>
                      <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0 md:hidden">
                        YA:
                      </p>
                      <span className="text-[10px] font-bold text-error line-through opacity-70 truncate">
                        {userAnswerDisplay || "—"}
                      </span>
                    </div>
                    {/* Correct answer */}
                    <div className="flex items-center gap-1.5">
                      {/* Desktop: "Correct Answer:", Mobile: "CA:" */}
                      <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0 hidden md:inline">
                        Correct Answer:
                      </p>
                      <p className="text-[10px] font-semibold uppercase text-on-surface-variant flex-shrink-0 md:hidden">
                        CA:
                      </p>
                      <span className="text-[10px] font-bold text-green-600 truncate">
                        {correctAnswerDisplay}
                      </span>
                    </div>
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
