"use client"

import { CheckCircle2, XCircle, AlertCircle } from "@/lib/icons"
import { useRef, useEffect } from "react"
import type {
  ReadingPart5EvaluateResponse,
  ReadingPart5QuestionResponse,
} from "@/lib/api/reading-part5"

interface Props {
  result: ReadingPart5EvaluateResponse
  questionData: ReadingPart5QuestionResponse
}

export function ReadingPart5Result({ result, questionData }: Props) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalGap = questionData.text.gap_fillings?.length ?? 0
  const totalMcq = questionData.text.mcq_questions?.length ?? 0
  const correctGap = result.details.gap_filling.filter(d => d.correct).length
  const correctMcq = result.details.questions.filter(d => d.correct).length

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
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-on-surface-variant">
                Gap Filling: <span className="font-bold text-on-surface">{correctGap}/{totalGap}</span>
              </span>
              <span className="text-on-surface-variant">
                MCQ: <span className="font-bold text-on-surface">{correctMcq}/{totalMcq}</span>
              </span>
            </div>
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

      {/* Gap Filling Review */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Gap Filling Review (1-{totalGap})
          </p>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {result.details.gap_filling.map((d, i) => {
            const isMissed = !d.user_answer || d.user_answer.trim() === ""
            const isCorrect = d.correct && !isMissed
            const isWrong = !d.correct && !isMissed

            return (
              <div
                key={d.position}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
              >
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500 text-white shadow-sm">
                  {d.position}
                </span>

                <div className="flex-1 min-w-0">
                  {isCorrect ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {d.user_answer}
                      </span>
                      <span className="text-sm font-bold text-green-600">Correct</span>
                    </div>
                  ) : isMissed ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-amber-600">
                        Missed
                      </span>
                      <span className="text-on-surface-variant text-lg font-bold">→</span>
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {d.correct_answer}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 h-8 rounded-lg bg-red-500/10 text-error text-[13px] font-black flex items-center justify-center line-through opacity-70 border border-red-500/20">
                        {d.user_answer}
                      </span>
                      <span className="text-on-surface-variant text-lg font-bold">→</span>
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {d.correct_answer}
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

      {/* MCQ Review */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            MCQ Review ({totalGap + 1}-{totalGap + totalMcq})
          </p>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {result.details.questions.map((d) => {
            const question = questionData.text.mcq_questions?.find(q => q.id === d.question_id)
            const userAnswerObj = question?.answers.find(a => a.id === d.answer_id)
            const correctAnswerObj = question?.answers.find(a => a.answer === d.correct_answer)
            
            const isCorrect = d.correct
            const userAnswerDisplay = userAnswerObj ? userAnswerObj.answer : "Missed"
            const correctAnswerDisplay = correctAnswerObj ? correctAnswerObj.answer : d.correct_answer

            return (
              <div
                key={d.question_id}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
              >
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500 text-white shadow-sm">
                  {question ? (questionData.text.gap_fillings?.length ?? 0) + (questionData.text.mcq_questions?.indexOf(question) ?? 0) + 1 : "?"}
                </span>

                <div className="flex-1 min-w-0">
                  {question && (
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{question.question}</p>
                  )}
                  {isCorrect ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {userAnswerDisplay}
                      </span>
                      <span className="text-sm font-bold text-green-600">Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 h-8 rounded-lg bg-red-500/10 text-error text-[13px] font-black flex items-center justify-center line-through opacity-70 border border-red-500/20">
                        {userAnswerDisplay}
                      </span>
                      <span className="text-on-surface-variant text-lg font-bold">→</span>
                      <span className="px-3 h-8 rounded-lg bg-green-500 text-white text-[13px] font-black flex items-center justify-center shadow-sm">
                        {correctAnswerDisplay}
                      </span>
                    </div>
                  )}
                </div>

                {isCorrect
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
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
