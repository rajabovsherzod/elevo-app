"use client"

import { memo } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cx } from "@/utils/cx"
import type {
  ListeningPart3QuestionItem,
  ListeningPart3AnswerOption,
  ListeningPart3EvaluateResponse,
} from "@/lib/api/listening"

interface Props {
  speaker:          ListeningPart3QuestionItem
  speakerIndex:     number   // 0-based → used for display number
  options:          ListeningPart3AnswerOption[]
  selectedAnswerId: number | undefined
  onSelect:         (speakerId: number, answerId: number) => void
  isLocked:         boolean
  result?:          ListeningPart3EvaluateResponse | null
}

export const ListeningPart3SpeakerCard = memo(function ListeningPart3SpeakerCard({
  speaker,
  speakerIndex,
  options,
  selectedAnswerId,
  onSelect,
  isLocked,
  result,
}: Props) {
  const detail         = result?.details.find(d => d.question_id === speaker.id)
  const isCorrect      = detail?.correct
  const correctAnswerId = detail?.correct_answer_id

  return (
    <div className={cx(
      "elevo-card elevo-card-border p-4 flex flex-col gap-3 transition-all",
      result && isCorrect  && "border-green-500/40",
      result && !isCorrect && "border-error/30",
    )}>
      {/* Speaker label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm flex-shrink-0">
            {speakerIndex + 1}
          </span>
          <span className="text-sm font-bold text-on-surface">{speaker.text}</span>
        </div>
        {result && (
          isCorrect
            ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <XCircle      className="w-4 h-4 text-error flex-shrink-0" />
        )}
      </div>

      {/* A-F option chips — full width grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {options.map((opt, i) => {
          const letter    = String.fromCharCode(65 + i)
          const selected  = selectedAnswerId === opt.id
          const isUserAns = result && selectedAnswerId === opt.id
          const isCorrectAns = result && correctAnswerId === opt.id

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isLocked || !!result}
              onClick={() => onSelect(speaker.id, opt.id)}
              className={cx(
                "h-10 rounded-lg text-xs font-black flex items-center justify-center transition-all border w-full",
                // no result yet
                !result && selected  && "bg-primary text-white border-primary shadow-sm",
                !result && !selected && "bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50",
                // result state
                result && isCorrectAns && "bg-green-500 text-white border-green-500",
                result && isUserAns && !isCorrectAns && "bg-error text-white border-error",
                result && !isCorrectAns && !isUserAns && "bg-surface-container/40 text-on-surface-variant/40 border-outline-variant/40",
                (isLocked || !!result) && "cursor-not-allowed",
              )}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* Wrong: show what was correct */}
      {result && !isCorrect && correctAnswerId && (
        <p className="text-[11px] text-green-600 font-semibold">
          Correct: {String.fromCharCode(65 + options.findIndex(o => o.id === correctAnswerId))}
        </p>
      )}
    </div>
  )
})
