import { memo, useMemo } from "react"
import { cx } from "@/utils/cx"

interface GapInputProps {
  position: number
  correctAnswer: string
}

const GapInput = memo(function GapInput({ position, correctAnswer }: GapInputProps) {
  // Part 1 accordion dek aynan bir xil style
  // disabled=true, checked=true, correct=true holatdagi style
  return (
    <span
      className={cx(
        "inline-flex align-middle mx-0.5 rounded-lg ring-1 ring-inset shadow-xs transition-all duration-100",
        "ring-success-primary",  // Yashil border (to'g'ri javob)
        "opacity-60 cursor-not-allowed",  // Part 1 dek disabled style
      )}
      style={{
        width: "clamp(72px, 18vw, 120px)",
        background: "var(--el-card-bg)",
      }}
    >
      <input
        type="text"
        value={correctAnswer}
        disabled
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-transparent text-on-surface ring-0 outline-none px-2 py-1 text-xs sm:text-sm text-center disabled:cursor-not-allowed"
      />
    </span>
  )
})

interface ReadingPart5TextOnlyProps {
  text: string  // Text with __1__, __2__, _3_, _4_ patterns
  gapPositions: number[]  // [1, 2, 3, 4]
  results: Record<string, { correct_answer: string }>  // {"1": {correct_answer: "..."}}
}

export const ReadingPart5TextOnly = memo(function ReadingPart5TextOnly({
  text,
  gapPositions,
  results,
}: ReadingPart5TextOnlyProps) {
  const posSet = new Set(gapPositions)
  
  // Replace both __N__ and _N_ patterns with input placeholders
  const processed = text.replace(/_{1,}(\d+)_{1,}/g, (_, num) => {
    const pos = parseInt(num)
    return posSet.has(pos) ? `§§${pos}§§` : `__${num}__`
  })

  const segments = useMemo(
    () => processed.split(/(§§\d+§§)/),
    [processed]
  )

  return (
    <p 
      className="text-xs sm:text-sm md:text-base leading-[1.9] text-on-surface"
      role="article"
      aria-label="Reading passage with correct answers"
    >
      {segments.map((seg, i) => {
        const match = seg.match(/§§(\d+)§§/)
        if (match) {
          const pos = parseInt(match[1])
          const correctAnswer = results[pos.toString()]?.correct_answer || ""
          
          return (
            <GapInput
              key={`gap-${pos}`}
              position={pos}
              correctAnswer={correctAnswer}
            />
          )
        }
        return seg ? <span key={`txt-${i}`}>{seg}</span> : null
      })}
    </p>
  )
})
