"use client"

import { memo } from "react"
import { Check } from "@/lib/icons"
import type { MockPart } from "@/hooks/reading/mock/use-reading-mock"

const PART_LABELS: Record<MockPart, string> = {
  1: "Gap Fill",
  2: "Matching",
  3: "Headings",
  4: "MCQ",
  5: "Mixed",
}

interface Props {
  currentPart: MockPart
  completions: Record<number, boolean>
  onGoToPart: (part: MockPart) => void
}

export const ReadingMockStepper = memo(function ReadingMockStepper({
  currentPart,
  completions,
  onGoToPart,
}: Props) {
  const parts: MockPart[] = [1, 2, 3, 4, 5]
  const progressPercent = ((currentPart - 1) / (parts.length - 1)) * 100

  return (
    <div className="elevo-card elevo-card-border px-2 sm:px-6 py-5">
      <div className="relative w-full">
        {/* Progress Line */}
        <div className="absolute top-4 left-[5%] right-[5%] h-1 bg-surface-container-highest rounded-full" />
        <div 
          className="absolute top-4 left-[5%] h-1 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent * 0.9}%` }}
        />

        {/* Steps */}
        <div className="flex justify-between relative z-10 w-full">
          {parts.map((part) => {
            const isActive = part === currentPart
            const isCompleted = completions[part]
            const isPassed = part < currentPart

            let btnClass = "bg-surface-container text-on-surface-variant border-2 border-surface-container-highest"
            if (isActive) {
              btnClass = "bg-primary text-white border-2 border-primary ring-4 ring-primary/20 scale-110"
            } else if (isPassed || isCompleted) {
              btnClass = "bg-primary text-white border-2 border-primary"
            }

            return (
              <button
                key={part}
                onClick={() => onGoToPart(part)}
                className="flex flex-col items-center gap-2 group w-12 sm:w-16"
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${btnClass}`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                  ) : (
                    part
                  )}
                </div>
                <span
                  className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${
                    isActive || isCompleted || isPassed
                      ? "text-primary"
                      : "text-on-surface-variant/60"
                  }`}
                >
                  {PART_LABELS[part]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
