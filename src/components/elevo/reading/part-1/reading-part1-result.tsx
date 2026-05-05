"use client"

import { useRef, useEffect, memo, useState } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart1EvaluateResponse } from "@/lib/api/reading"
import { AnswerCard } from "@/components/elevo/shared/answer-card"
import { ExplanationModal } from "@/components/elevo/shared/explanation-modal"

// ── Answer Review Grid ────────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  details,
}: {
  details: ReadingPart1EvaluateResponse["details"]
}) {
  const [modalData, setModalData] = useState<{
    position: number
    correctAnswer: string
    explanation_uz?: string | null
    explanation_en?: string | null
  } | null>(null)

  if (!details) return null

  return (
    <>
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>
        <div className="p-4">
          {/* Desktop: 3 columns, Mobile: 2 columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {details.map((d) => (
              <AnswerCard
                key={d.position}
                questionNumber={d.position}
                userAnswer={d.user_answer}
                correctAnswer={d.correct_answer || ''}
                isCorrect={d.correct}
                explanation_uz={d.explanation_uz}
                explanation_en={d.explanation_en}
                onExplanationClick={() => setModalData({
                  position: d.position,
                  correctAnswer: d.correct_answer || '',
                  explanation_uz: d.explanation_uz,
                  explanation_en: d.explanation_en,
                })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Explanation Modal - Shared Component */}
      {modalData && (
        <ExplanationModal
          isOpen={!!modalData}
          onClose={() => setModalData(null)}
          position={modalData.position}
          correctAnswer={modalData.correctAnswer}
          explanation_uz={modalData.explanation_uz}
          explanation_en={modalData.explanation_en}
        />
      )}
    </>
  )
})

// ── Props / Main ──────────────────────────────────────────────────────────────
interface Props {
  result: ReadingPart1EvaluateResponse
}

export function ReadingPart1Result({ result }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent ?? 0)
  const correctCount = result.correct_count ?? 0
  const totalQuestions = result.total_questions ?? 0
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
              {correctCount} / {totalQuestions} correct
            </p>
            {totalQuestions - correctCount > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {totalQuestions - correctCount} incorrect
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
