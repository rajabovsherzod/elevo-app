import { memo } from "react"
import { cx } from "@/utils/cx"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ReadingPart3HeadingsProps {
  headings: { id: number; text: string }[]  // A-H (8 ta headings)
  disabled: boolean
}

export const ReadingPart3Headings = memo(function ReadingPart3Headings({
  headings,
  disabled,
}: ReadingPart3HeadingsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Headings (A-{LETTERS[headings.length - 1] || 'H'})
        </p>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {headings.map((heading, hi) => {
          const headingLetter = LETTERS[hi] ?? String(hi + 1)  // A, B, C... H

          return (
            <div key={heading.id} className="px-4 py-4 rounded-xl bg-surface-container-lowest">
              {/* Heading text with LETTER (A-H) */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm">
                  {headingLetter}
                </span>
                <p className="text-sm text-on-surface leading-relaxed flex-1">{heading.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
