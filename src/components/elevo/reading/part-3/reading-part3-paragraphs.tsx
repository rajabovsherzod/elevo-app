import { memo } from "react"
import { cx } from "@/utils/cx"

interface ReadingPart3ParagraphsProps {
  paragraphs: { position: number; text: string }[]  // 1-6 (paragraphs)
  headings: { letter: string; text: string }[]    // A-H (8 ta headings)
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
  onSelect: (position: number, letter: string) => void
  disabled: boolean
  startNumber?: number  // For full mock: start numbering from this number
}

export const ReadingPart3Paragraphs = memo(function ReadingPart3Paragraphs({
  paragraphs,
  headings,
  answers,
  onSelect,
  disabled,
  startNumber = 1,
}: ReadingPart3ParagraphsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Paragraphs ({startNumber}-{startNumber + paragraphs.length - 1}) — Choose the Correct Heading
        </p>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {paragraphs.map((paragraph) => {
          const paragraphNumber = startNumber + paragraph.position - 1  // Adjust for display
          const selectedLetter = answers[paragraph.position.toString()]

          return (
            <div
              key={paragraph.position}
              className="px-4 py-4 rounded-xl bg-surface-container-lowest flex flex-col gap-3"
            >
              {/* Paragraph text with NUMBER (1-6) */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm">
                  {paragraphNumber}
                </span>
                <p className="text-sm text-on-surface leading-relaxed flex-1">{paragraph.text}</p>
              </div>

              {/* Heading letter buttons (A-H) - 4 per row, 2 rows */}
              <div className="grid grid-cols-4 gap-1.5 pl-10">
                {headings.map((heading) => {
                  const isSelected = selectedLetter === heading.letter

                  return (
                    <button
                      key={heading.letter}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(paragraph.position, heading.letter)}
                      className={cx(
                        "w-full h-10 rounded-lg text-[13px] font-black transition-all duration-200",
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
