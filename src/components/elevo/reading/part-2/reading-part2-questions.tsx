import { memo } from "react"
import { cx } from "@/utils/cx"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ReadingPart2QuestionsProps {
  headings: { letter: string; text: string }[]  // A-J (10 headings)
  passages: { position: number; text: string }[]  // 1-8 (8 passages)
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
  onSelect: (position: number, letter: string) => void
  disabled: boolean
}

export const ReadingPart2Questions = memo(function ReadingPart2Questions({
  headings,
  passages,
  answers,
  onSelect,
  disabled,
}: ReadingPart2QuestionsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Headings (A-{headings[headings.length - 1]?.letter || 'J'})
        </p>
      </div>

      <div 
        className="flex flex-col gap-2 p-3"
        role="list"
        aria-label="Available headings for matching"
      >
        {headings.map((heading) => {
          return (
            <div 
              key={heading.letter} 
              className="px-4 py-4 rounded-xl bg-surface-container-lowest"
              role="listitem"
            >
              {/* Heading text with LETTER (A-J) - NO BUTTONS HERE */}
              <div className="flex items-start gap-3">
                <span 
                  className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm"
                  aria-hidden="true"
                >
                  {heading.letter}
                </span>
                <p 
                  className="text-sm text-on-surface leading-relaxed flex-1"
                  id={`heading-${heading.letter}`}
                >
                  {heading.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
