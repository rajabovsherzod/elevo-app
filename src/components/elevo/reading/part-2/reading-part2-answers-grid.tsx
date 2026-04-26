import { memo } from "react"
import { cx } from "@/utils/cx"
import { getMatchingAriaLabel } from "@/lib/utils/a11y"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ReadingPart2AnswersGridProps {
  answers: { id: number; text: string }[]  // 1-8 (passages)
  questions: { id: number; text: string }[]  // A-J (questions)
  matches: Record<number, number>  // passage_id -> question_id
  onSelect: (passageId: number, questionId: number) => void
  disabled: boolean
}

export const ReadingPart2AnswersGrid = memo(function ReadingPart2AnswersGrid({ 
  answers, 
  questions,
  matches,
  onSelect,
  disabled 
}: ReadingPart2AnswersGridProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Passages (1-{answers.length}) — Match to Questions
        </p>
      </div>

      <div 
        className="flex flex-col gap-3 p-3"
        role="region"
        aria-label="Match passages to questions"
      >
        {answers.map((passage, pi) => {
          const passageNumber = pi + 1  // 1, 2, 3... 8
          const selectedQuestionId = matches[passage.id]
          const selectedQuestion = questions.find(q => q.id === selectedQuestionId)
          const selectedLetter = selectedQuestion 
            ? LETTERS[questions.indexOf(selectedQuestion)] 
            : null

          // ARIA label for matching status
          const matchingAriaLabel = getMatchingAriaLabel(
            `Passage ${passageNumber}`,
            selectedLetter ? `Question ${selectedLetter}` : null,
            !!selectedQuestionId
          )

          return (
            <div
              key={passage.id}
              className="px-4 py-4 rounded-xl bg-surface-container-lowest flex flex-col gap-3"
              role="group"
              aria-label={matchingAriaLabel}
            >
              {/* Passage text with NUMBER (1-8) */}
              <div className="flex items-start gap-3">
                <span 
                  className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm"
                  aria-hidden="true"
                >
                  {passageNumber}
                </span>
                <p className="text-sm text-on-surface leading-relaxed flex-1">{passage.text}</p>
              </div>

              {/* Question letter buttons - THIS IS WHERE YOU MATCH! */}
              <div 
                className="flex flex-wrap gap-1.5 pl-10"
                role="radiogroup"
                aria-label={`Select question for passage ${passageNumber}`}
              >
                {questions.map((q, qi) => {
                  const letter = LETTERS[qi] ?? String(qi + 1)  // A, B, C... J
                  const isSelected = selectedQuestionId === q.id

                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Question ${letter}`}
                      disabled={disabled}
                      onClick={() => onSelect(passage.id, q.id)}
                      className={cx(
                        "w-9 h-9 rounded-lg text-[12px] font-black transition-all duration-200 shrink-0",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected
                          ? "bg-primary text-white shadow-md scale-105"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95",
                      )}
                    >
                      {letter}
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
