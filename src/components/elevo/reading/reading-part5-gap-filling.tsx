import { cx } from "@/utils/cx"
import type { ReadingPart5EvaluateResponse } from "@/lib/api/reading-part5"

interface GapInputProps {
  position: number
  value: string
  onChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart5EvaluateResponse | null
}

function GapInput({ position, value, onChange, disabled, result }: GapInputProps) {
  const detail = result?.details.gap_filling.find((d) => d.position === position)
  const checked = !!result
  const correct = detail?.correct

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
        className="w-full bg-transparent text-on-surface ring-0 outline-none px-2 py-1 text-xs sm:text-sm text-center placeholder:text-on-surface-variant/40 disabled:cursor-not-allowed"
      />
    </span>
  )
}

interface ReadingPart5GapFillingProps {
  summaryText: string
  gapFillings: { position: number }[]
  answers: Record<number, string>
  onAnswerChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ReadingPart5EvaluateResponse | null
}

export function ReadingPart5GapFilling({
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

  const segments = processed.split(/(§§\d+§§)/)

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          For questions 1-{positions.length > 0 ? Math.max(...positions) : 0}, fill the missing information in the numbered spaces
        </p>
      </div>

      <div className="p-5">
        <p className="text-xs sm:text-sm md:text-base leading-[1.9] text-on-surface">
          {segments.map((seg, i) => {
            const match = seg.match(/§§(\d+)§§/)
            if (match) {
              const pos = parseInt(match[1])
              return (
                <GapInput
                  key={`gap-${pos}`}
                  position={pos}
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
}
