import { cx } from "@/utils/cx"
import type { ReadingPart4QuestionItem } from "@/lib/api/reading"

interface ReadingPart4TfngQuestionsProps {
  questions: ReadingPart4QuestionItem[]
  answers: Record<number, number>  // question_id -> answer_id
  onSelect: (questionId: number, answerId: number) => void
  disabled: boolean
  startNumber: number  // MCQ tugagan raqamdan boshlanadi (5)
}

export function ReadingPart4TfngQuestions({
  questions,
  answers,
  onSelect,
  disabled,
  startNumber,
}: ReadingPart4TfngQuestionsProps) {
  const tfngConfig = {
    "True": { short: "T", color: "bg-green-500", hoverColor: "hover:bg-green-500/20" },
    "False": { short: "F", color: "bg-red-500", hoverColor: "hover:bg-red-500/20" },
    "Not Given": { short: "NG", color: "bg-orange-500", hoverColor: "hover:bg-orange-500/20" },
  }

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          True / False / Not Given (Questions {startNumber}-{startNumber + questions.length - 1})
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {questions.map((q, qi) => {
          const selectedAnswerId = answers[q.id]

          return (
            <div key={q.id} className="flex flex-col gap-3">
              {/* Statement */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm">
                  {startNumber + qi}
                </span>
                <p className="text-sm font-semibold text-on-surface leading-relaxed flex-1">
                  {q.question}
                </p>
              </div>

              {/* T/F/NG Buttons - 3 tasi bir qatorda, to'liq kenglik */}
              <div className="grid grid-cols-3 gap-2 pl-10">
                {q.answers.map((answer) => {
                  const isSelected = selectedAnswerId === answer.id

                  return (
                    <button
                      key={answer.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(q.id, answer.id)}
                      className={cx(
                        "w-full h-9 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected
                          ? "bg-primary text-white shadow-md"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                      )}
                    >
                      {answer.answer}
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
