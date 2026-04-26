import { memo, useMemo } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart5EvaluateResponse } from "@/lib/api/reading-part5"
import { getGapFillingAriaLabel } from "@/lib/utils/a11y"

interface GapInputProps {
  position: number
  totalGaps: number
  value: string
  onChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart5EvaluateResponse | null
}

const GapInput = memo(function GapInput({ position, totalGaps, value, onChange, disabled, result }: GapInputProps) {
  const detail = result?.details.gap_filling.find((d) => d.position === position)
  const checked = !!result
  const correct = detail?.correct

  // ARIA label for accessibility
  const ariaLabel = getGapFillingAriaLabel(position, totalGaps)
  const ariaDescribedBy = checked ? `gap-${position}-result` : undefined

  return (
    <span
      className={cx(
        "inline-flex align-middle mx-0.5 rounded-lg ring-1 ring-inset shadow-xs transition-all duration-100",
        checked && correct && "ring-success-primary",
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

interface ReadingPart5GapFillingProps {
  summaryText: string
  gapFillings: { position: number }[]
  answers: Record<number, string>
  onAnswerChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart5EvaluateResponse | null
}

export const ReadingPart5GapFilling = memo(function ReadingPart5GapFilling({
  summaryText,
  gapFillings,
  answers,
  onAnswerChange,
  disabled,
  result,
}: ReadingPart5GapFillingProps) {
  // Hook returns flattened format: [{position: 1}, {position: 2}, ...]
  const positions = gapFillings.map((g: any) => g.position)
  const posSet = new Set(positions)
  
  // Replace _N_ patterns with input placeholders
  const processed = summaryText.replace(/_{1,}(\d+)_{1,}/g, (_, num) => {
    const pos = parseInt(num)
    return posSet.has(pos) ? `§§${pos}§§` : `_${num}_`
  })

  const segments = useMemo(
    () => processed.split(/(§§\d+§§)/),
    [processed]
  )

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          For questions 1-{positions.length > 0 ? Math.max(...positions) : 0}, fill the missing information in the numbered spaces
        </p>
      </div>

      <div className="p-5">
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
                  disabled={disabled}
                  result={result}
                />
              )
            }
            return seg ? <span key={`txt-${i}`}>{seg}</span> : null
          })}
        </p>
      </div>
    </div>
  )
})
