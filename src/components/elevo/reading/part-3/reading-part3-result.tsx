"use client"

import { CheckCircle2, XCircle } from "@/lib/icons"
import { useRef, useEffect } from "react"
import type {
  ReadingPart3EvaluateResponse,
  ReadingPart3AnswerOption,
} from "@/lib/api/reading"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

function headingLetter(headingId: number | null | undefined, headings: ReadingPart3AnswerOption[]): string {
  if (headingId == null) return "?"
  const idx = headings.findIndex((h) => h.id === headingId)
  return idx >= 0 ? (LETTERS[idx] ?? "?") : "?"
}

function paragraphRoman(questionId: number | null | undefined, paragraphs: ReadingPart3AnswerOption[]): string {
  if (questionId == null) return "?"
  const idx = paragraphs.findIndex((p) => p.id === questionId)
  return idx >= 0 ? (ROMAN_NUMERALS[idx] ?? "?") : "?"
}

interface Props {
  result:    ReadingPart3EvaluateResponse
  questions: ReadingPart3AnswerOption[]  // paragraphs
  answers:   ReadingPart3AnswerOption[]  // headings
}

export function ReadingPart3Result({ result, questions, answers }: Props) {
  const barRef       = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent)
  const isGood       = scorePercent >= 70

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

      {/* Answer review */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {result.details.map((d, i) => {
            const paragraph        = questions.find((q) => q.id === d.question_id)
            const paragraphRomanNum = paragraphRoman(d.question_id, questions)
            const correctHeadingLetter = headingLetter(d.answer_question_id, answers)
            
            // Find what user selected (answer_question_id is the heading they chose)
            const userSelectedHeadingLetter = headingLetter(d.answer_question_id, answers)

            return (
              <div
                key={d.question_id}
                className={`flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  d.correct 
                    ? "bg-green-500/10" 
                    : "bg-surface-container-lowest"
                }`}
              >
                {/* Paragraph Roman Numeral */}
                <span className={`w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                  d.correct
                    ? "bg-green-500 text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant"
                }`}>
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {paragraph && (
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{paragraph.text}</p>
                  )}
                  {d.correct ? (
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {correctHeadingLetter}
                      </span>
                      <span className="text-sm font-bold text-green-600">Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-8 h-8 rounded-lg bg-error/10 text-error text-[13px] font-black flex items-center justify-center line-through opacity-70">
                        {userSelectedHeadingLetter}
                      </span>
                      <span className="text-on-surface-variant text-xs">→</span>
                      <span className="w-8 h-8 rounded-lg bg-primary text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {correctHeadingLetter}
                      </span>
                    </div>
                  )}
                </div>

                {d.correct
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                  : <XCircle      className="w-5 h-5 text-error shrink-0 mt-1" />
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
