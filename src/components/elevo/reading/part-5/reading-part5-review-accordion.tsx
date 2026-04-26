"use client"

import { useState, memo, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart5QuestionResponse } from "@/lib/api/reading-part5"

interface Props {
  questionData: ReadingPart5QuestionResponse
}

export const ReadingPart5ReviewAccordion = memo(function ReadingPart5ReviewAccordion({ 
  questionData 
}: Props) {
  const [textOpen, setTextOpen] = useState(true)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [mcqOpen, setMcqOpen] = useState(false)

  const { text } = questionData

  // Memoized text processing - only recalculate when summary_text changes
  const processedSummaryText = useMemo(
    () => text?.summary_text?.replace(/_{1,}(\d+)_{1,}/g, "__________") || "",
    [text?.summary_text]
  )

  // Memoized gap filling positions - only recalculate when gap_fillings change
  const gapFillingPositions = useMemo(
    () => text?.gap_fillings?.flatMap((gf: any) => 
      gf.positions.map((pos: number) => ({
        position: pos,
        answer: gf.answers?.find((a: any) => a.position === pos)?.answer || ""
      }))
    ) || [],
    [text?.gap_fillings]
  )

  // Stable function references - prevent unnecessary re-renders
  const toggleText = useCallback(() => setTextOpen((prev) => !prev), [])
  const toggleSummary = useCallback(() => setSummaryOpen((prev) => !prev), [])
  const toggleMcq = useCallback(() => setMcqOpen((prev) => !prev), [])

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Text & Questions
        </p>
      </div>

      <div className="flex flex-col">
        {/* Main Text Section */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleText}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">Main Text</span>
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
                <div className="px-4 pb-4">
                  {text.title && (
                    <h3 className="text-base font-bold text-on-surface mb-2">{text.title}</h3>
                  )}
                  {text.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3 italic">{text.instruction}</p>
                  )}
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {text.text}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Text Section */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleSummary}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Summary Text (Gap Filling)
            </span>
            {summaryOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {summaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {processedSummaryText}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {gapFillingPositions.map(({ position, answer }) => (
                      <div key={position} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                        <span className="text-xs font-bold text-primary">{position}.</span>
                        <span className="text-xs font-semibold text-on-surface">{answer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MCQ Questions Section */}
        <div>
          <button
            type="button"
            onClick={toggleMcq}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Multiple Choice Questions ({text?.mcq_questions?.length || 0})
            </span>
            {mcqOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {mcqOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-4">
                  {text?.mcq_questions?.map((q, qi) => (
                    <div key={q.id} className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-on-surface">
                        <span className="text-primary font-black">{qi + 5}.</span> {q.question}
                      </p>
                      <div className="pl-6 flex flex-col gap-1.5">
                        {q.answers.map((answer, ai) => {
                          const letter = String.fromCharCode(65 + ai)
                          return (
                            <p key={answer.id} className="text-xs text-on-surface-variant">
                              <span className="font-bold text-on-surface">{letter}.</span> {answer.answer}
                              {answer.is_correct && (
                                <span className="ml-2 text-green-600 font-bold">✓</span>
                              )}
                            </p>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
})
