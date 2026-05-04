import { memo, useMemo } from "react"
import { cx } from "@/utils/cx"
import type { ReadingPart5EvaluateResponse } from "@/lib/api/reading"
import { getGapFillingAriaLabel } from "@/lib/utils/a11y"

interface GapInputProps {
  position: number
  totalGaps: number
  value: string
  onChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart5EvaluateResponse | null
  globalNumber?: number  // For displaying in placeholder
}

const GapInput = memo(function GapInput({ position, totalGaps, value, onChange, disabled, result, globalNumber }: GapInputProps) {
  // New API format: result.results is Record<string, ResultDetail>
  const detail = result?.results?.[position.toString()]
  const checked = !!result
  const correct = detail?.is_correct

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
        placeholder={String(globalNumber ?? position)}
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
  text: string  // Text with __1__, __2__, _3_, _4_ patterns
  gapPositions: number[]  // [1, 2, 3, 4]
  answers: Record<string, string>  // {"1": "text", "2": "text"}
  onAnswerChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart5EvaluateResponse | null
  startNumber?: number  // For full mock: start numbering from this number
}

export const ReadingPart5GapFilling = memo(function ReadingPart5GapFilling({
  text,
  gapPositions,
  answers,
  onAnswerChange,
  disabled,
  result,
  startNumber = 1,
}: ReadingPart5GapFillingProps) {
  const posSet = new Set(gapPositions)
  
  // Replace both __N__ and _N_ patterns with input placeholders
  // Supports: __1__, _1_, __10__, _10_, etc.
  const processed = text.replace(/_{1,}(\d+)_{1,}/g, (_, num) => {
    const pos = parseInt(num)
    return posSet.has(pos) ? `§§${pos}§§` : `__${num}__`  // Keep original if not a gap
  })

  const segments = useMemo(
    () => processed.split(/(§§\d+§§)/),
    [processed]
  )

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          For questions {startNumber}-{startNumber + gapPositions.length - 1}, fill the missing information in the numbered spaces
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
              const globalNumber = startNumber + gapPositions.indexOf(pos)
              
              return (
                <GapInput
                  key={`gap-${pos}`}
                  position={pos}
                  totalGaps={gapPositions.length}
                  value={answers[pos.toString()] ?? ""}
                  onChange={onAnswerChange}
                  disabled={disabled}
                  result={result}
                  globalNumber={globalNumber}
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
