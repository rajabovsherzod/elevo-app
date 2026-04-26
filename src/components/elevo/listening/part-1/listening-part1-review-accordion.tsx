"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { ListeningPart1AudioPlayer } from "./listening-part1-audio-player"
import type { ListeningPart1EvaluateResponse, ListeningPart1Question } from "@/lib/api/listening"

interface Props {
  audioUrl: string
  questions: ListeningPart1Question[]
  result: ListeningPart1EvaluateResponse
}

export function ListeningPart1ReviewAccordion({ audioUrl, questions, result }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(prev => !prev)

  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Review: Audio & Questions
        </p>
      </div>

      <div className="border-b border-surface-container-high">
        <button
          type="button"
          onClick={toggle}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/50 transition-colors"
        >
          <span className="text-sm font-bold text-on-surface">Audio & Questions</span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-on-surface-variant" />
          ) : (
            <ChevronDown className="w-5 h-5 text-on-surface-variant" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-4">
                {/* Audio Player */}
                <ListeningPart1AudioPlayer src={audioUrl} />

                {/* Questions Review */}
                <div className="flex flex-col gap-3">
                  {questions.map((q, i) => {
                    const detail = result.details.find(d => d.question_id === q.id)
                    return (
                      <div key={q.id} className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-on-surface">
                          <span className="text-primary font-black">{i + 1}.</span> {q.question}
                        </p>
                        <div className="pl-6 flex flex-col gap-1.5">
                          {q.answers.map((a) => {
                            const isUserPick = detail?.answer_id === a.id
                            const isCorrectAns = (detail as any)?.correct_answer_id === a.id
                            const letter = a.answer.charAt(0)
                            const text = a.answer.slice(3)

                            let textColorClass = "text-on-surface-variant"
                            if (isCorrectAns) {
                              textColorClass = "text-green-600 font-bold"
                            } else if (isUserPick) {
                              textColorClass = "text-error font-bold"
                            }

                            return (
                              <p
                                key={a.id}
                                className={`text-xs ${textColorClass}`}
                              >
                                <span className="font-bold text-on-surface">{letter}.</span> {text}
                                {isCorrectAns && " ✓"}
                                {isUserPick && !isCorrectAns && " ✗"}
                              </p>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
