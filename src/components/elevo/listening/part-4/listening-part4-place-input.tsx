"use client"

import { useRef } from "react"
import { cx } from "@/utils/cx"
import type { ListeningPart4PlaceOption, ListeningPart4FieldItem } from "@/lib/api/listening"

interface Props {
  place: ListeningPart4PlaceOption
  placeIndex: number
  fields: ListeningPart4FieldItem[]
  letter: string
  onChange: (placeId: number, letter: string) => void
  isLocked: boolean
}

export function ListeningPart4PlaceInput({ place, placeIndex, fields, letter, onChange, isLocked }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const isValid = !!letter && fields.some(f => f.text.toUpperCase() === letter.toUpperCase())
  const isEmpty = !letter

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(-1).toUpperCase()
    onChange(place.id, val)
  }

  return (
    <div
      className={cx(
        "elevo-card elevo-card-border flex items-center gap-4 px-4 py-3.5 transition-all duration-200",
        !isEmpty && isValid && "border-green-500/60 bg-green-500/5",
        !isEmpty && !isValid && "border-error/60 bg-error/5",
      )}
    >
      {/* Number badge */}
      <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-xs font-black text-white">{placeIndex + 1}</span>
      </div>

      {/* Place name */}
      <p className="flex-1 text-sm font-semibold text-on-surface truncate">{place.text}</p>

      {/* Letter input */}
      <div
        className={cx(
          "relative w-10 h-10 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-text transition-all duration-200",
          isLocked
            ? "bg-surface-container border-outline-variant cursor-not-allowed"
            : isEmpty
            ? "border-outline-variant bg-surface hover:border-primary/60"
            : isValid
            ? "border-green-500 bg-green-500/10"
            : "border-error bg-error/10",
        )}
        onClick={() => !isLocked && inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          maxLength={2}
          value={letter}
          onChange={handleChange}
          disabled={isLocked}
          className="absolute inset-0 w-full h-full text-center text-lg font-black text-on-surface bg-transparent border-none outline-none uppercase caret-transparent"
          style={{ letterSpacing: 0 }}
        />
        {!letter && !isLocked && (
          <span className="text-lg font-black text-on-surface-variant/40 pointer-events-none select-none">?</span>
        )}
      </div>
    </div>
  )
}
