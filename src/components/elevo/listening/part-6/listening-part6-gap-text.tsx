import { memo } from "react"
import { cx } from "@/utils/cx"
import type { ListeningPart6EvaluateResponse } from "@/lib/api/listening"

interface GapInputProps {
  position: number
  value: string
  onChange: (pos: number, val: string) => void
  disabled: boolean
  result?: ListeningPart6EvaluateResponse | null
}

const GapInput = memo(function GapInput({ position, value, onChange, disabled, result }: GapInputProps) {
  const detail  = result?.details.find(d => d.position === position)
  const checked = !!result && !!detail
  const correct = detail?.correct

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
        width: "clamp(96px, 20vw, 160px)",
        background: "var(--el-card-bg)",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={e => onChange(position, e.target.value)}
        disabled={disabled}
        placeholder={String(position)}
        autoComplete="off"
        spellCheck={false}
        aria-label={`Gap ${position}`}
        aria-required="true"
        aria-disabled={disabled}
        className="w-full bg-transparent text-on-surface ring-0 outline-none px-2 py-1 text-xs sm:text-sm text-center placeholder:text-on-surface-variant/40 disabled:cursor-not-allowed"
      />
    </span>
  )
})

// Parse a single line (no newlines) into text + gap segments
function parseLineSegments(
  line: string,
  posSet: Set<number> | null,
  lineKey: string,
  answers: Record<number, string>,
  onAnswerChange: (pos: number, val: string) => void,
  disabled: boolean,
  result?: ListeningPart6EvaluateResponse | null,
) {
  const processed = line.replace(/_{1,}(\d+)_{1,}/g, (_, num) => {
    const pos = parseInt(num)
    return !posSet || posSet.has(pos) ? `§§${pos}§§` : `_${num}_`
  })

  return processed.split(/(§§\d+§§)/).map((seg, i) => {
    const match = seg.match(/§§(\d+)§§/)
    if (match) {
      const pos = parseInt(match[1])
      return (
        <GapInput
          key={`${lineKey}-gap-${pos}`}
          position={pos}
          value={answers[pos] ?? ""}
          onChange={onAnswerChange}
          disabled={disabled ?? !!result}
          result={result}
        />
      )
    }
    return seg ? <span key={`${lineKey}-txt-${i}`}>{seg}</span> : null
  })
}

interface Props {
  text: string
  positions: number[]
  answers: Record<number, string>
  onAnswerChange: (pos: number, val: string) => void
  disabled?: boolean
  result?: ListeningPart6EvaluateResponse | null
}

export const ListeningPart6GapText = memo(function ListeningPart6GapText({ text, positions, answers, onAnswerChange, disabled, result }: Props) {
  const safeText = text ?? ""
  if (!safeText) return null

  const safePos = positions ?? []
  const posSet  = safePos.length > 0 ? new Set(safePos) : null

  // Normalise newline markers: // → \n, \r\n → \n
  const normalised = safeText
    .replace(/\/\//g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")

  const lines = normalised.split("\n")

  return (
    <div className="text-xs sm:text-sm md:text-base leading-[2.2] text-on-surface">
      {lines.map((line, li) => (
        <div key={`line-${li}`} className="flex flex-wrap items-center gap-y-1">
          {parseLineSegments(line, posSet, `l${li}`, answers, onAnswerChange, disabled ?? !!result, result)}
        </div>
      ))}
    </div>
  )
})
