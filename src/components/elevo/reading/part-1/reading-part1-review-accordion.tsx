"use client"

import { useState, memo, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart1QuestionResponse, ReadingPart1EvaluateResponse } from "@/lib/api/reading"
import { ReadingPart1Text } from "./reading-part1-text"

interface Props {
  questionData: ReadingPart1QuestionResponse
  result?: ReadingPart1EvaluateResponse | null
}

export const ReadingPart1ReviewAccordion = memo(function ReadingPart1ReviewAccordion({
  questionData,
  result,
}: Props) {
  const [textOpen, setTextOpen] = useState(true)

  // Stable function reference
  const toggleText = useCallback(() => setTextOpen((prev) => !prev), [])

  // Build correct answers map from result
  const correctAnswers = useMemo(() => {
    if (!result?.details) return {}
    const map: Record<number, string> = {}
    result.details.forEach((d) => {
      if (d.correct_answer) {
        map[d.position] = d.correct_answer
      }
    })
    return map
  }, [result])

  // Dummy onChange - inputs are disabled anyway
  const handleDummyChange = useCallback(() => {
    // No-op: inputs are disabled
  }, [])

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Text with Answers
        </p>
      </div>

      <div className="flex flex-col">
        {/* Reading Text with Gap Filling */}
        <div>
          <button
            type="button"
            onClick={toggleText}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Text with Correct Answers ({questionData.positions.length} gaps)
            </span>
            {textOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {textOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2">
                  <div
                    className="rounded-lg p-3 elevo-card-border"
                    style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
                  >
                    <ReadingPart1Text
                      text={questionData.text}
                      positions={questionData.positions}
                      answers={correctAnswers}
                      onAnswerChange={handleDummyChange}
                      result={result}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
})
