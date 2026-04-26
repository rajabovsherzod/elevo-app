import { memo, useMemo } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart1EvaluateResponse } from "@/lib/api/reading"
import { getGapFillingAriaLabel } from "@/lib/utils/a11y"

interface GapInputProps {
  position: number
  totalGaps: number
  value: string
  onChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart1EvaluateResponse | null
}

const GapInput = memo(function GapInput({ position, totalGaps, value, onChange, disabled, result }: GapInputProps) {
  const detail  = result?.details.find((d) => d.position === position)
  const checked = !!result
  const correct = detail?.correct

  // ARIA label for accessibility
  const ariaLabel = getGapFillingAriaLabel(position, totalGaps)
  const ariaDescribedBy = checked ? `gap-${position}-result` : undefined

  return (
    <span
      className={cx(
        "inline-flex align-middle mx-0.5 rounded-lg ring-1 ring-inset shadow-xs transition-all duration-100",
        checked && correct  && "ring-success-primary",
        checked && !correct && "ring-error_subtle",
        !checked && "ring-secondary focus-within:ring-2 focus-within:ring-brand",
        disabled && "opacity-60 cursor-not-allowed",
      )}
      style={{
        width: "clamp(72px, 18vw, 120px)",
        background: "var(--el-card-bg)",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(position, e.target.value)}
        disabled={disabled}
        placeholder={String(position)}
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-required="true"
        aria-invalid={checked && !correct ? "true" : "false"}
        className="w-full bg-transparent text-on-surface ring-0 outline-none px-2 py-1 text-xs sm:text-sm text-center placeholder:text-on-surface-variant/40 disabled:cursor-not-allowed"
      />
      {/* Hidden result announcement for screen readers */}
      {checked && (
        <span id={`gap-${position}-result`} className="sr-only">
          {correct ? "Correct answer" : `Incorrect. Correct answer is: ${detail?.correct_answer || "not available"}`}
        </span>
      )}
    </span>
  )
})

interface ReadingPart1TextProps {
  text: string
  positions: number[]
  answers: Record<number, string>
  onAnswerChange: (pos: number, val: string) => void
  result?: ReadingPart1EvaluateResponse | null
}

export const ReadingPart1Text = memo(function ReadingPart1Text({
  text,
  positions,
  answers,
  onAnswerChange,
  result,
}: ReadingPart1TextProps) {
  // Replace all _N_ / ___N___ patterns. If positions is provided and non-empty,
  // only replace those that are in the set; otherwise replace everything.
  const posSet = positions.length > 0 ? new Set(positions) : null
  const processed = text.replace(/_{1,}(\d+)_{1,}/g, (_, num) => {
    const pos = parseInt(num)
    return !posSet || posSet.has(pos) ? `§§${pos}§§` : `_${num}_`
  })

  const segments = useMemo(
    () => processed.split(/(§§\d+§§)/),
    [processed]
  )

  return (
    <p 
      className="text-xs sm:text-sm md:text-base leading-[1.9] text-on-surface"
      role="article"
      aria-label="Reading passage with fill-in-the-blank questions"
    >
      {segments.map((seg, i) => {
        const match = seg.match(/§§(\d+)§§/)
        if (match) {
          const pos = parseInt(match[1])
          return (
            <GapInput
              key={`gap-${pos}`}
              position={pos}
              totalGaps={positions.length}
              value={answers[pos] ?? ""}
              onChange={onAnswerChange}
              disabled={!!result}
              result={result}
            />
          )
        }
        return seg ? <span key={`txt-${i}`}>{seg}</span> : null
      })}
    </p>
  )
})
