import { cx } from "@/utils/cx"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ReadingPart2AnswersGridProps {
  answers: { id: number; text: string }[]
  selectedIds: number[]
}

export function ReadingPart2AnswersGrid({ answers, selectedIds }: ReadingPart2AnswersGridProps) {
  const selectedSet = new Set(selectedIds)

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Options
        </p>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {answers.map((ans, i) => {
          const letter = LETTERS[i] ?? String(i + 1)
          const isUsed = selectedSet.has(ans.id)

          return (
            <div
              key={ans.id}
              className={cx(
                "flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isUsed
                  ? "bg-primary/10 shadow-sm"
                  : "bg-surface-container-lowest",
              )}
            >
              <span
                className={cx(
                  "w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200",
                  isUsed
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                {letter}
              </span>
              <p className="text-sm text-on-surface leading-relaxed flex-1">{ans.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
