import { memo } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart5MCQQuestion } from "@/lib/api/reading-part5"

interface ReadingPart5MCQQuestionsProps {
  questions: ReadingPart5MCQQuestion[]
  answers: Record<number, number>  // question_id -> answer_id
  onSelect: (questionId: number, answerId: number) => void
  disabled: boolean
  startNumber: number  // MCQ starts from 5
}

export const ReadingPart5MCQQuestions = memo(function ReadingPart5MCQQuestions({
  questions,
  answers,
  onSelect,
  disabled,
  startNumber,
}: ReadingPart5MCQQuestionsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          For questions {startNumber}-{startNumber + questions.length - 1}, choose the correct answer A, B, C, D.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {questions.map((q, qi) => {
          const questionNumber = startNumber + qi
          const selectedAnswerId = answers[q.id]

          return (
            <div key={q.id} className="flex flex-col gap-3">
              {/* Question */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm">
                  {questionNumber}
                </span>
                <p className="text-sm font-semibold text-on-surface leading-relaxed flex-1">
                  {q.question}
                </p>
              </div>

              {/* Answer Options (A, B, C, D) */}
              <div className="grid grid-cols-1 gap-2 pl-10">
                {q.answers.map((answer, ai) => {
                  const letter = String.fromCharCode(65 + ai)  // A, B, C, D
                  const isSelected = selectedAnswerId === answer.id

                  return (
                    <button
                      key={answer.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(q.id, answer.id)}
                      className={cx(
                        "w-full px-4 py-3 rounded-lg text-sm text-left transition-all duration-200",
                        "flex items-center gap-3",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected
                          ? "bg-primary text-white shadow-md"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.98]",
                      )}
                    >
                      <span className={cx(
                        "w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-surface-container-high text-on-surface-variant",
                      )}>
                        {letter}
                      </span>
                      <span className="flex-1">{answer.answer}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
