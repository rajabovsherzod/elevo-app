"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingPart4QuestionResponse, ReadingPart4QuestionItem } from "@/lib/api/reading"

interface Props {
  questionData: ReadingPart4QuestionResponse
  questions: ReadingPart4QuestionItem[]
}

export function ReadingPart4ReviewAccordion({ questionData, questions }: Props) {
  const [textOpen, setTextOpen] = useState(true)
  const [mcqOpen, setMcqOpen] = useState(false)
  const [tfngOpen, setTfngOpen] = useState(false)

  const { text } = questionData
  const mcqQuestions = questions.filter((q) => q.answers.length === 4)
  const tfngQuestions = questions.filter((q) => q.answers.length === 3)

  const toggleText = () => setTextOpen((prev) => !prev)
  const toggleMcq = () => setMcqOpen((prev) => !prev)
  const toggleTfng = () => setTfngOpen((prev) => !prev)

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
                  {mcqQuestions.map((q, qi) => (
                    <div key={q.id} className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-on-surface">
                        <span className="text-primary font-black">{qi + 1}.</span> {q.question}
                      </p>
                      <div className="pl-6 flex flex-col gap-1.5">
                        {q.answers.map((answer, ai) => {
                          const letter = String.fromCharCode(65 + ai)
                          return (
                            <p key={answer.id} className="text-xs text-on-surface-variant">
                              <span className="font-bold text-on-surface">{letter}.</span> {answer.answer}
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

        {/* T/F/NG Questions Section */}
        <div>
          <button
            type="button"
            onClick={toggleTfng}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
          >
            <span className="text-sm font-bold text-on-surface">
              True / False / Not Given (Questions {mcqQuestions.length + 1}-{mcqQuestions.length + tfngQuestions.length})
            </span>
            {tfngOpen ? (
              <ChevronUp className="w-5 h-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="w-5 h-5 text-on-surface-variant" />
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
                  {tfngQuestions.map((q, qi) => (
                    <div key={q.id} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                        {mcqQuestions.length + 1 + qi}
                      </span>
                      <p className="text-sm text-on-surface leading-relaxed flex-1">{q.question}</p>
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
}
