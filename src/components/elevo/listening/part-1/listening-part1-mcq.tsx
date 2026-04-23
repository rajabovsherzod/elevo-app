import { cx } from "@/utils/cx"
import type { ListeningPart1Question } from "@/lib/api/listening"

const LABELS = ["A", "B", "C", "D", "E"]

interface ListeningPart1McqProps {
  question: ListeningPart1Question
  questionNumber: number
  selectedAnswerId: number | undefined
  onSelect?: (questionId: number, answerId: number) => void
}

export function ListeningPart1Mcq({
  question,
  questionNumber,
  selectedAnswerId,
  onSelect,
}: ListeningPart1McqProps) {
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
      <div className="flex flex-col gap-2 p-4">
        {question.answers.map((answer, i) => {
          const label = LABELS[i] ?? String(i + 1)
          const isSelected = selectedAnswerId === answer.id

          return (
            <button
              key={answer.id}
              type="button"
              onClick={() => onSelect?.(question.id, answer.id)}
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
                {label}
              </span>
              <span className="flex-1 font-medium">{answer.answer}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
