"use client"

import { memo } from "react"
import { CheckCircle2, XCircle } from "@/lib/icons"
import { cx } from "@/utils/cx"
import type {
  ListeningPart3EvaluateResponse,
} from "@/lib/api/listening"

interface Speaker {
  position: number
  text: string
}

interface Option {
  letter: string
  text: string
}

interface Props {
  speaker:        Speaker
  speakerIndex:   number   // 0-based → used for display number
  options:        Option[]
  selectedLetter: string   // "A", "B", "C", etc.
  onSelect:       (position: number, letter: string) => void
  isLocked:       boolean
  result?:        ListeningPart3EvaluateResponse | null
}

export const ListeningPart3SpeakerCard = memo(function ListeningPart3SpeakerCard({
  speaker,
  speakerIndex,
  options,
  selectedLetter,
  onSelect,
  isLocked,
  result,
}: Props) {
  const positionKey = String(speaker.position)
  const resultItem = result?.results?.[positionKey]
  const isCorrect = resultItem?.is_correct ?? false
  const correctLetter = resultItem?.correct_answer ?? ""

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
      <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label={`Speaker ${speakerIndex + 1} options`}>
        {options.map((opt) => {
          const letter = opt.letter
          const selected = selectedLetter === letter
          const isUserAns = result && selectedLetter === letter
          const isCorrectAns = result && correctLetter === letter

          return (
            <button
              key={letter}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Speaker ${speakerIndex + 1}, Option ${letter}`}
              aria-disabled={isLocked || !!result}
              disabled={isLocked || !!result}
              onClick={() => onSelect(speaker.position, letter)}
              className={cx(
                "h-10 rounded-lg text-xs font-black flex items-center justify-center transition-all duration-200 w-full",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                // no result yet
                !result && selected  && "bg-primary text-white shadow-md scale-105",
                !result && !selected && "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95",
                // result state
                result && isCorrectAns && "bg-green-500 text-white",
                result && isUserAns && !isCorrectAns && "bg-error text-white",
                result && !isCorrectAns && !isUserAns && "bg-surface-container/40 text-on-surface-variant/40",
                (isLocked || !!result) && "cursor-not-allowed",
              )}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* Wrong: show what was correct */}
      {result && !isCorrect && correctLetter && (
        <p className="text-[11px] text-green-600 font-semibold">
          Correct: {correctLetter}
        </p>
      )}
    </div>
  )
})
