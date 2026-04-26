"use client"

import { useState, memo, useCallback } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart3QuestionResponse, ReadingPart3AnswerOption } from "@/lib/api/reading"

interface Props {
  questionData: ReadingPart3QuestionResponse
  questions: ReadingPart3AnswerOption[] // paragraphs
  answers: ReadingPart3AnswerOption[] // headings
}

export const ReadingPart3ReviewAccordion = memo(function ReadingPart3ReviewAccordion({
  questionData,
  questions,
  answers,
}: Props) {
  const [headingsOpen, setHeadingsOpen] = useState(true)
  const [paragraphsOpen, setParagraphsOpen] = useState(false)

  const { set } = questionData

  // Stable function references
  const toggleHeadings = useCallback(() => setHeadingsOpen((prev) => !prev), [])
  const toggleParagraphs = useCallback(() => setParagraphsOpen((prev) => !prev), [])

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Headings & Paragraphs
        </p>
      </div>

      <div className="flex flex-col">
        {/* Headings Section (A-H) */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleHeadings}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Headings ({answers.length})
            </span>
            {headingsOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {headingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {answers.map((a, i) => {
                    const letter = String.fromCharCode(65 + i) // A, B, C...
                    return (
                      <div key={a.id} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                          {letter}
                        </span>
                        <p className="text-sm text-on-surface leading-relaxed flex-1">
                          {a.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paragraphs Section (I-VI) */}
        <div>
          <button
            type="button"
            onClick={toggleParagraphs}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Paragraphs ({questions.length})
            </span>
            {paragraphsOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {paragraphsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-4">
                  {set.title && (
                    <div className="px-3 py-2 rounded-lg bg-primary/5">
                      <p className="text-xs font-bold text-on-surface">{set.title}</p>
                    </div>
                  )}
                  {questions.map((q, i) => {
                    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
                    return (
                      <div key={q.id} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-secondary/10 text-on-surface">
                            {romanNumerals[i]}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                          {q.text}
                        </p>
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
