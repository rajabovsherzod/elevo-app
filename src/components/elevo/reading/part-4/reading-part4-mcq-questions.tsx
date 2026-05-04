import { memo } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart4Question } from "@/lib/api/reading"
import { getAnswerAriaLabel } from "@/lib/utils/a11y"

interface ReadingPart4McqQuestionsProps {
  questions: ReadingPart4Question[]
  answers: Record<number, string>  // position -> letter
  onSelect: (position: number, letter: string) => void
  disabled: boolean
  startNumber?: number  // For full mock: start numbering from this number
}

export const ReadingPart4McqQuestions = memo(function ReadingPart4McqQuestions({
  questions,
  answers,
  onSelect,
  disabled,
  startNumber = 1,
}: ReadingPart4McqQuestionsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Multiple Choice (Questions {startNumber}-{startNumber + questions.length - 1})
        </p>
      </div>

      <div 
        className="flex flex-col gap-4 p-4"
        role="region"
        aria-label="Multiple choice questions"
      >
        {questions.map((q, index) => {
          const displayNumber = startNumber + index
          const selectedLetter = answers[q.position]

          return (
            <div 
              key={q.position} 
              className="flex flex-col gap-3"
              role="group"
              aria-labelledby={`question-${q.position}-text`}
            >
              {/* Question */}
              <div className="flex items-start gap-3">
                <span 
                  className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm"
                  aria-hidden="true"
                >
                  {displayNumber}
                </span>
                <p 
                  id={`question-${q.position}-text`}
                  className="text-sm font-semibold text-on-surface leading-relaxed flex-1"
                >
                  {q.question}
                </p>
              </div>

              {/* Answer Options (A, B, C, D) */}
              <div 
                className="grid grid-cols-1 gap-2 pl-10"
                role="radiogroup"
                aria-labelledby={`question-${q.position}-text`}
                aria-required="true"
              >
                {q.answers.map((answer) => {
                  const isSelected = selectedLetter === answer.letter
                  const ariaLabel = getAnswerAriaLabel(answer.letter, answer.text, isSelected)

                  return (
                    <button
                      key={answer.letter}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={ariaLabel}
                      disabled={disabled}
                      onClick={() => onSelect(q.position, answer.letter)}
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
                      )}
                      aria-hidden="true"
                      >
                        {answer.letter}
                      </span>
                      <span className="flex-1">{answer.text}</span>
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
