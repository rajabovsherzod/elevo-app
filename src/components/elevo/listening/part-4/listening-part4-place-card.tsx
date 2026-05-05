"use client"

import { memo } from "react"
import { cx } from "@/utils/cx"

interface Props {
  position:         number
  text:             string
  selectedLetter:   string | undefined
  availableLetters: string[]
  onSelect:         (position: number, letter: string) => void
}

export const ListeningPart4PlaceCard = memo(function ListeningPart4PlaceCard({
  position,
  text,
  selectedLetter,
  availableLetters,
  onSelect,
}: Props) {
  return (
    <div className="elevo-card elevo-card-border p-4 flex flex-col gap-3 transition-all">
      {/* Place label */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm flex-shrink-0">
          {position}
        </span>
        <span className="text-sm font-bold text-on-surface">{text}</span>
      </div>

      {/* Letter option chips — full width grid */}
      <div
        className={cx(
          "grid gap-1.5",
          availableLetters.length === 6 && "grid-cols-3 sm:grid-cols-6",
          availableLetters.length === 7 && "grid-cols-4 sm:grid-cols-7",
          availableLetters.length === 8 && "grid-cols-4 sm:grid-cols-8",
        )}
        role="radiogroup"
        aria-label={`Place ${position} options`}
      >
        {availableLetters.map((letter) => {
          const selected = selectedLetter === letter

          return (
            <button
              key={letter}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Place ${position}, Option ${letter}`}
              onClick={() => onSelect(position, letter)}
              className={cx(
                "h-10 rounded-lg text-xs font-black flex items-center justify-center transition-all duration-200 w-full",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                selected  && "bg-primary text-white shadow-md scale-105",
                !selected && "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95",
              )}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </div>
  )
})
