import { memo } from "react"
import { cx } from "@/utils/cx"
import { getMatchingAriaLabel } from "@/lib/utils/a11y"

interface ReadingPart2AnswersGridProps {
  passages: { position: number; text: string }[]  // 1-8 (passages)
  headings: { letter: string; text: string }[]  // A-J (headings)
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
  onSelect: (position: number, letter: string) => void
  disabled: boolean
  startNumber?: number  // For full mock: start numbering from this number
}

export const ReadingPart2AnswersGrid = memo(function ReadingPart2AnswersGrid({ 
  passages, 
  headings,
  answers,
  onSelect,
  disabled,
  startNumber = 1
}: ReadingPart2AnswersGridProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">
          Match Passages to Headings
        </p>
      </div>

      <div 
        className="flex flex-col gap-3 p-3"
        role="region"
        aria-label="Match passages to headings"
      >
        {passages.map((passage) => {
          const passageNumber = startNumber + passage.position - 1  // Global numbering
          const selectedLetter = answers[passage.position.toString()]

          // ARIA label for matching status
          const matchingAriaLabel = getMatchingAriaLabel(
            `Passage ${passageNumber}`,
            selectedLetter ? `Heading ${selectedLetter}` : null,
            !!selectedLetter
          )

          return (
            <div
              key={passage.position}
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

              {/* Heading letter buttons - 2x5 grid (mobile & desktop) */}
              <div 
                className="grid grid-cols-5 gap-1.5 pl-10"
                role="radiogroup"
                aria-label={`Select heading for passage ${passageNumber}`}
              >
                {headings.map((heading) => {
                  const isSelected = selectedLetter === heading.letter

                  return (
                    <button
                      key={heading.letter}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Heading ${heading.letter}`}
                      disabled={disabled}
                      onClick={() => onSelect(passage.position, heading.letter)}
                      className={cx(
                        "h-9 rounded-lg text-[12px] font-black transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected
                          ? "bg-primary text-white shadow-md scale-105"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95",
                      )}
                    >
                      {heading.letter}
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
