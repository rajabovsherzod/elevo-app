"use client"

import { useState, memo, useCallback } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart2QuestionResponse, ReadingPart2AnswerOption } from "@/lib/api/reading"

interface Props {
  questionData: ReadingPart2QuestionResponse
  questions: ReadingPart2AnswerOption[]
  answers: ReadingPart2AnswerOption[]
}

export const ReadingPart2ReviewAccordion = memo(function ReadingPart2ReviewAccordion({
  questionData,
  questions,
  answers,
}: Props) {
  const [questionsOpen, setQuestionsOpen] = useState(true)
  const [answersOpen, setAnswersOpen] = useState(false)

  const { set } = questionData

  // Stable function references
  const toggleQuestions = useCallback(() => setQuestionsOpen((prev) => !prev), [])
  const toggleAnswers = useCallback(() => setAnswersOpen((prev) => !prev), [])

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Questions & Passages
        </p>
      </div>

      <div className="flex flex-col">
        {/* Questions Section (A-J) */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleQuestions}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Questions ({questions.length})
            </span>
            {questionsOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {questionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {questions.map((q, i) => {
                    const letter = String.fromCharCode(65 + i) // A, B, C...
                    return (
                      <div key={q.id} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                          {letter}
                        </span>
                        <p className="text-sm text-on-surface leading-relaxed flex-1">
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

        {/* Passages Section (1-8) */}
        <div>
          <button
            type="button"
            onClick={toggleAnswers}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Passages ({answers.length})
            </span>
            {answersOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          <AnimatePresence>
            {answersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {answers.map((a, i) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-secondary/10 text-on-surface">
                        {i + 1}
                      </span>
                      <p className="text-sm text-on-surface leading-relaxed flex-1">
                        {a.text}
                      </p>
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
