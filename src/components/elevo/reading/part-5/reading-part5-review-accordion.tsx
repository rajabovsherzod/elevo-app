"use client"

import { useState, memo, useCallback } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart5QuestionResponse, ReadingPart5EvaluateResponse } from "@/lib/api/reading"
import { ReadingPart5TextOnly } from "./reading-part5-text-only"

interface Props {
  questionData: ReadingPart5QuestionResponse
  result?: ReadingPart5EvaluateResponse | null
}

export const ReadingPart5ReviewAccordion = memo(function ReadingPart5ReviewAccordion({ 
  questionData,
  result,
}: Props) {
  const [mainTextOpen, setMainTextOpen] = useState(true)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [mcqOpen, setMcqOpen] = useState(false)

  const toggleMainText = useCallback(() => setMainTextOpen((prev) => !prev), [])
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
        {/* Main Text (Asosiy katta text) */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleMainText}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Reading Text
            </span>
            {mainTextOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {mainTextOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2">
                  <div className="rounded-lg p-3 elevo-card-border" style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}>
                    <div className="prose prose-sm max-w-none text-on-surface">
                      {questionData.main_text.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-xs sm:text-sm md:text-base leading-relaxed mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary with Gap Filling (Questions 1-4) */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleSummary}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Summary with Correct Answers ({questionData.gap_positions.length} gaps)
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
                <div className="px-3 py-2">
                  <div className="rounded-lg p-3 elevo-card-border" style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}>
                    <ReadingPart5TextOnly
                      text={questionData.summary_text}
                      gapPositions={questionData.gap_positions}
                      results={result?.results || {}}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MCQ Questions (Questions 5-6) */}
        <div>
          <button
            type="button"
            onClick={toggleMcq}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Multiple Choice Questions ({questionData.questions.length})
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
                  {questionData.questions.map((q) => {
                    // Find correct answer from result
                    const correctLetter = result?.results[q.position.toString()]?.correct_answer || ""
                    
                    return (
                      <div key={q.position} className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 bg-indigo-500 text-white">
                            {q.position}
                          </span>
                          <p className="text-sm font-semibold text-on-surface flex-1">
                            {q.question}
                          </p>
                        </div>
                        <div className="pl-9 flex flex-col gap-1.5">
                          {q.answers.map((answer) => {
                            const isCorrect = answer.letter === correctLetter
                            return (
                              <p key={answer.letter} className="text-xs text-on-surface-variant">
                                <span className="font-bold text-on-surface">{answer.letter}.</span> {answer.text}
                                {isCorrect && (
                                  <span className="ml-2 px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[10px] font-bold">
                                    Correct
                                  </span>
                                )}
                              </p>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
})
