"use client"

import { useState, memo, useCallback } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart1QuestionResponse } from "@/lib/api/reading"

interface Props {
  questionData: ReadingPart1QuestionResponse
}

export const ReadingPart1ReviewAccordion = memo(function ReadingPart1ReviewAccordion({
  questionData,
}: Props) {
  const [textOpen, setTextOpen] = useState(true)

  const { question } = questionData

  // Stable function reference
  const toggleText = useCallback(() => setTextOpen((prev) => !prev), [])

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Reading Text
        </p>
      </div>

      <div className="flex flex-col">
        {/* Reading Text Section */}
        <div>
          <button
            type="button"
            onClick={toggleText}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">Reading Text</span>
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
                  {question.title && (
                    <h3 className="text-base font-bold text-on-surface mb-2">
                      {question.title}
                    </h3>
                  )}
                  {question.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3 italic">
                      {question.instruction}
                    </p>
                  )}
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {question.text}
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
