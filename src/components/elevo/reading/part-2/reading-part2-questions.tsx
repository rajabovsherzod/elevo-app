import { memo } from "react"
import { cx } from "@/utils/cx"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ReadingPart2QuestionsProps {
  questions: { id: number; text: string }[]  // A-J (10 ta)
  answers:   { id: number; text: string }[]  // 1-8 (8 ta passages)
  matches:   Record<number, number>  // passage_id -> question_id
  onSelect:  (passageId: number, questionId: number) => void
  disabled:  boolean
}

export const ReadingPart2Questions = memo(function ReadingPart2Questions({
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
          Questions (A-{LETTERS[questions.length - 1] || 'J'})
        </p>
      </div>

      <div 
        className="flex flex-col gap-2 p-3"
        role="list"
        aria-label="Available questions for matching"
      >
        {questions.map((q, qi) => {
          const questionLetter = LETTERS[qi] ?? String(qi + 1)  // A, B, C... J

          return (
            <div 
              key={q.id} 
              className="px-4 py-4 rounded-xl bg-surface-container-lowest"
              role="listitem"
            >
              {/* Question text with LETTER (A-J) - NO BUTTONS HERE */}
              <div className="flex items-start gap-3">
                <span 
                  className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm"
                  aria-hidden="true"
                >
                  {questionLetter}
                </span>
                <p 
                  className="text-sm text-on-surface leading-relaxed flex-1"
                  id={`question-${q.id}`}
                >
                  {q.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
