import { useState, useCallback, memo } from "react"
import { cx } from "@/utils/cx"
import type { ListeningPart1QuestionItem } from "@/lib/api/listening"

interface ListeningPart1McqProps {
  question: ListeningPart1QuestionItem
  questionNumber: number
  selectedLetter: string | undefined
  onSelect?: (position: number, letter: string) => void
  isLocked?: boolean
}

// ── Memoized MCQ Component ────────────────────────────────────────────────────
export const ListeningPart1Mcq = memo(function ListeningPart1Mcq({
  question,
  questionNumber,
  selectedLetter,
  onSelect,
  isLocked = false,
}: ListeningPart1McqProps) {
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null)

  const showTooltip = useCallback((letter: string) => {
    setTooltipVisible(letter)
    setTimeout(() => setTooltipVisible(null), 2000)
  }, [])

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      {/* Question header */}
      <div className="px-4 py-3 bg-primary/10 flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 bg-primary text-white shadow-sm">
          {questionNumber}
        </span>
        {question.question && (
          <p className="text-sm font-semibold text-on-surface leading-relaxed">
            {question.question}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 p-4" role="radiogroup" aria-label={`Question ${questionNumber} options`}>
        {question.answers.map((answer) => {
          const isSelected = selectedLetter === answer.letter
          const isTooltipShowing = tooltipVisible === answer.letter

          return (
            <div key={answer.letter} className="relative">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Question ${questionNumber}, Option ${answer.letter}: ${answer.text}`}
                aria-disabled={isLocked}
                onClick={() => {
                  if (isLocked) {
                    showTooltip(answer.letter)
                    return
                  }
                  onSelect?.(question.position, answer.letter)
                }}
                className={cx(
                  "w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-150",
                  "flex items-center gap-3 focus:outline-none",
                  "active:scale-[0.98]",
                  isSelected
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                )}
              >
                <span
                  className={cx(
                    "w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  {answer.letter}
                </span>
                <span className="flex-1 font-medium">{answer.text}</span>
              </button>

              {/* Tooltip for locked answers */}
              {isTooltipShowing && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none animate-fade-in">
                  <div className="px-3 py-2 rounded-lg bg-on-surface text-surface text-xs font-semibold shadow-lg whitespace-nowrap">
                    Please wait until the audio finishes
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-on-surface transform rotate-45" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
