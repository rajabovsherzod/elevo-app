"use client"

import { useState, memo, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart4QuestionResponse, ReadingPart4Question } from "@/lib/api/reading"

interface Props {
  questionData: ReadingPart4QuestionResponse
  questions: ReadingPart4Question[]
  results?: Record<string, { is_correct: boolean; user_answer: string; correct_answer: string }>
}

export const ReadingPart4ReviewAccordion = memo(function ReadingPart4ReviewAccordion({ 
  questionData, 
  questions,
  results = {}
}: Props) {
  const [textOpen, setTextOpen] = useState(true)
  const [mcqOpen, setMcqOpen] = useState(false)
  const [tfngOpen, setTfngOpen] = useState(false)

  const { text, title, instruction } = questionData
  
  // Memoized calculations - only recalculate when questions change
  const mcqQuestions = useMemo(
    () => questions.filter((q) => q.answers.length === 4),
    [questions]
  )
  const tfngQuestions = useMemo(
    () => questions.filter((q) => q.answers.length === 3),
    [questions]
  )

  // Stable function references - prevent unnecessary re-renders
  const toggleText = useCallback(() => setTextOpen((prev) => !prev), [])
  const toggleMcq = useCallback(() => setMcqOpen((prev) => !prev), [])
  const toggleTfng = useCallback(() => setTfngOpen((prev) => !prev), [])

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Text & Questions
        </p>
      </div>

      <div className="flex flex-col">
        {/* Reading Text Section */}
        <div className="border-b border-surface-container-high">
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
                  {title && (
                    <h3 className="text-base font-bold text-on-surface mb-2">{title}</h3>
                  )}
                  {instruction && (
                    <p className="text-xs text-on-surface-variant mb-3 italic">{instruction}</p>
                  )}
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {text}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MCQ Questions Section */}
        <div className="border-b border-surface-container-high">
          <button
            type="button"
            onClick={toggleMcq}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              Multiple Choice Questions ({mcqQuestions.length})
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
                  {mcqQuestions.map((q) => {
                    // Get correct answer from results
                    const correctLetter = results[q.position.toString()]?.correct_answer || ""
                    
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

        {/* T/F/NG Questions Section */}
        <div>
          <button
            type="button"
            onClick={toggleTfng}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface text-left">
              True / False / Not Given ({tfngQuestions.length})
            </span>
            {tfngOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
            )}
          </button>

          <AnimatePresence>
            {tfngOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {tfngQuestions.map((q) => {
                    // Get correct answer from results
                    const correctLetter = results[q.position.toString()]?.correct_answer || ""
                    
                    return (
                      <div key={q.position} className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 bg-indigo-500 text-white">
                            {q.position}
                          </span>
                          <p className="text-sm text-on-surface leading-relaxed flex-1">{q.question}</p>
                        </div>
                        <div className="pl-9 flex flex-col gap-1">
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
