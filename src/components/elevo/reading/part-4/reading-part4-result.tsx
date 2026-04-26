"use client"

import { CheckCircle2, XCircle, AlertCircle } from "@/lib/icons"
import { useRef, useEffect } from "react"
import type {
  ReadingPart4EvaluateResponse,
  ReadingPart4QuestionItem,
} from "@/lib/api/reading"

function answerLetter(answerId: number | null | undefined, question: ReadingPart4QuestionItem): string {
  if (answerId == null) return "—"
  const idx = question.answers.findIndex((a) => a.id === answerId)
  if (question.answers.length === 4) {
    // MCQ: A, B, C, D
    return idx >= 0 ? String.fromCharCode(65 + idx) : "—"
  } else {
    // T/F/NG: True, False, Not Given
    return idx >= 0 ? question.answers[idx].answer : "—"
  }
}

interface Props {
  result:    ReadingPart4EvaluateResponse
  questions: ReadingPart4QuestionItem[]
}

export function ReadingPart4Result({ result, questions }: Props) {
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
            {result.total_questions - result.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-1">
                {result.total_questions - result.correct_count} unanswered or incorrect
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

      {/* Answer review */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {result.details.map((d, i) => {
            const question = questions.find((q) => q.id === d.question_id)
            const hasUserAnswer = d.answer_id != null && d.answer_id !== undefined
            const userAnswer = hasUserAnswer && question ? answerLetter(d.answer_id, question) : "Missed"
            
            // Correct answer ni ham harf/text ga aylantiramiz
            let correctAnswerDisplay = "—"
            if (question && d.correct_answer) {
              const correctAnswerObj = question.answers.find(a => a.answer === d.correct_answer)
              if (correctAnswerObj) {
                correctAnswerDisplay = answerLetter(correctAnswerObj.id, question)
              } else {
                correctAnswerDisplay = d.correct_answer
              }
            }

            const isMissed = !hasUserAnswer
            const isCorrect = d.correct && !isMissed
            const isWrong = !d.correct && !isMissed

            return (
              <div
                key={d.question_id}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
              >
                {/* Question number */}
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500 text-white shadow-sm">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {question && (
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{question.question}</p>
                  )}
                  {isCorrect ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {userAnswer}
                      </span>
                      <span className="text-sm font-bold text-green-600">Correct</span>
                    </div>
                  ) : isMissed ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 h-8 rounded-lg bg-amber-500/20 text-amber-600 text-[13px] font-black flex items-center justify-center border border-amber-500/30">
                        Missed
                      </span>
                      <span className="text-on-surface-variant text-lg font-bold">→</span>
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {correctAnswerDisplay}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* User's wrong answer */}
                      <span className="px-3 h-8 rounded-lg bg-red-500/10 text-error text-[13px] font-black flex items-center justify-center line-through opacity-70 border border-red-500/20">
                        {userAnswer}
                      </span>
                      {/* Arrow */}
                      <span className="text-on-surface-variant text-lg font-bold">→</span>
                      {/* Correct answer */}
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {correctAnswerDisplay}
                      </span>
                    </div>
                  )}
                </div>

                {isCorrect
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                  : isMissed
                  ? <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                  : <XCircle className="w-5 h-5 text-error shrink-0 mt-1" />
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
