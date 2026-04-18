import { cx } from "@/utils/cx"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ReadingPart2QuestionsProps {
  questions: { id: number; text: string }[]
  answers:   { id: number; text: string }[]
  matches:   Record<number, number>
  onSelect:  (questionId: number, answerId: number) => void
  disabled:  boolean
}

export function ReadingPart2Questions({
  questions,
  answers,
  matches,
  onSelect,
  disabled,
}: ReadingPart2QuestionsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Questions
        </p>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {questions.map((q, qi) => {
          const selectedId = matches[q.id]

          return (
            <div key={q.id} className="px-4 py-4 rounded-xl bg-surface-container-lowest flex flex-col gap-3">
              {/* Question text */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm">
                  {qi + 1}
                </span>
                <p className="text-sm text-on-surface leading-relaxed flex-1">{q.text}</p>
              </div>

              {/* Letter buttons */}
              <div className="flex flex-wrap gap-1.5 pl-10">
                {answers.map((ans, ai) => {
                  const letter    = LETTERS[ai] ?? String(ai + 1)
                  const isSelected = selectedId === ans.id

                  return (
                    <button
                      key={ans.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(q.id, ans.id)}
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
}
