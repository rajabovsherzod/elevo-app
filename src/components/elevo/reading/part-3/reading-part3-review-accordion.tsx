"use client"

import { useState, memo, useCallback } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart3EvaluateResponse } from "@/lib/api/reading"

interface Props {
  result: ReadingPart3EvaluateResponse
}

export const ReadingPart3ReviewAccordion = memo(function ReadingPart3ReviewAccordion({
  result,
}: Props) {
  const [headingsOpen, setHeadingsOpen] = useState(true)
  const [paragraphsOpen, setParagraphsOpen] = useState(false)

  const { set } = result

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
              Headings ({set.headings.length})
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
                  {set.headings.map((heading) => {
                    return (
                      <div key={heading.letter} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500 text-white">
                          {heading.letter}
                        </span>
                        <p className="text-sm text-on-surface leading-relaxed flex-1">
                          {heading.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paragraphs Section (1-6) with correct answers */}
        <div>
          <button
            type="button"
            onClick={toggleParagraphs}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Paragraphs with Correct Answers ({set.paragraphs.length})
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
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {set.paragraphs.map((paragraph) => {
                    const result_item = result.results[paragraph.position.toString()]
                    const correctAnswer = result_item?.correct_answer || "?"
                    
                    return (
                      <div key={paragraph.position} className="flex flex-col gap-2">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500 text-white">
                            {paragraph.position}
                          </span>
                          <p className="text-sm text-on-surface leading-relaxed flex-1">
                            {paragraph.text}
                          </p>
                        </div>
                        <div className="ml-9 flex items-center gap-2">
                          <span className="text-xs font-medium text-on-surface-variant">
                            Correct answer:
                          </span>
                          <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-xs font-bold">
                            {correctAnswer}
                          </span>
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
