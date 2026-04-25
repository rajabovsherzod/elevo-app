import { cx } from "@/utils/cx"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

interface ReadingPart3ParagraphsProps {
  paragraphs: { id: number; text: string }[]  // 1-6 (paragraphs)
  headings: { id: number; text: string }[]    // A-H (8 ta headings)
  matches: Record<number, number>  // paragraph_id -> heading_id
  onSelect: (paragraphId: number, headingId: number) => void
  disabled: boolean
}

export function ReadingPart3Paragraphs({
  paragraphs,
  headings,
  matches,
  onSelect,
  disabled,
}: ReadingPart3ParagraphsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Paragraphs — Choose the Correct Heading
        </p>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {paragraphs.map((paragraph, pi) => {
          const paragraphNumber = ROMAN_NUMERALS[pi] ?? String(pi + 1)  // I, II, III... VI
          const selectedHeadingId = matches[paragraph.id]

          return (
            <div
              key={paragraph.id}
              className="px-4 py-4 rounded-xl bg-surface-container-lowest flex flex-col gap-3"
            >
              {/* Paragraph text with ROMAN NUMERAL (I-VI) */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm">
                  {paragraphNumber}
                </span>
                <p className="text-sm text-on-surface leading-relaxed flex-1">{paragraph.text}</p>
              </div>

              {/* Heading letter buttons (A-H) - 4 per row, 2 rows */}
              <div className="grid grid-cols-4 gap-1.5 pl-10">
                {headings.map((heading, hi) => {
                  const headingLetter = LETTERS[hi] ?? String(hi + 1)  // A, B, C... H
                  const isSelected = selectedHeadingId === heading.id

                  return (
                    <button
                      key={heading.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(paragraph.id, heading.id)}
                      className={cx(
                        "w-full h-10 rounded-lg text-[13px] font-black transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected
                          ? "bg-primary text-white shadow-md scale-105"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95",
                      )}
                    >
                      {headingLetter}
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
