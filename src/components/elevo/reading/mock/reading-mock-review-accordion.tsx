"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type { ReadingFullMockQuestionsResponse, ReadingFullMockEvaluateResponse } from "@/lib/api/reading-mock"
import { ReadingPart1Text } from "@/components/elevo/reading/part-1/reading-part1-text"

interface Props {
  examData: ReadingFullMockQuestionsResponse
  result: ReadingFullMockEvaluateResponse
  userAnswers: {
    part1Answers: Record<number, string>
    part2Matches: Record<number, number>
    part3Matches: Record<number, number>
    part4Answers: Record<number, number>
    part5GapAnswers: Record<string, string>
    part5McqAnswers: Record<number, number>
  }
}

// Professional Answer Card Component (exactly like Listening Part 5)
function AnswerCard({ 
  questionNumber, 
  userAnswer, 
  correctAnswer, 
  isCorrect,
  partInfo
}: { 
  questionNumber: number
  userAnswer: string | number
  correctAnswer: string | number
  isCorrect: boolean
  partInfo?: string
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant">
      <div className="flex items-center justify-between">
        <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm">
          {questionNumber}
        </span>
        {isCorrect
          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-error" />
        }
      </div>

      {partInfo && (
        <p className="text-[11px] text-on-surface-variant font-medium truncate">
          {partInfo}
        </p>
      )}

      {isCorrect ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-black text-green-600">{userAnswer}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-black text-error line-through opacity-70">{userAnswer || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-black text-green-600">{correctAnswer}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Answer Review Grid Component (like Listening Part 5)
function AnswerReview({ result, examData, userAnswers }: { 
  result: ReadingFullMockEvaluateResponse
  examData: ReadingFullMockQuestionsResponse
  userAnswers: Props['userAnswers']
}) {
  const { reading } = examData
  const allCards: React.JSX.Element[] = []

  // Part 1: Gap filling (Questions 1-6)
  if (result.parts.part1?.details) {
    const details = result.parts.part1.details as any[]
    details.forEach((detail: any) => {
      allCards.push(
        <AnswerCard
          key={`part1-${detail.question_id}-${detail.position}`}
          questionNumber={detail.global_number || detail.position}
          userAnswer={detail.user_answer}
          correctAnswer={detail.correct_answer}
          isCorrect={detail.correct}
          partInfo="Part 1 Gap"
        />
      )
    })
  }

  // Part 2: Matching (Questions 7-14)
  if (result.parts.part2?.details) {
    const details = result.parts.part2.details as any[]
    details.forEach((detail: any, index: number) => {
      const userAnswerText = reading.part2.answers?.find(a => a.id === detail.answer_question_id)?.text || "—"
      const correctAnswerText = reading.part2.answers?.find(a => a.id === detail.correct_answer_id)?.text || "—"
      
      allCards.push(
        <AnswerCard
          key={`part2-${detail.answer_question_id}-${index}`}  // Unique key: passage ID + index
          questionNumber={detail.global_number || (7 + index)}
          userAnswer={userAnswerText.substring(0, 20) + (userAnswerText.length > 20 ? "..." : "")}
          correctAnswer={correctAnswerText.substring(0, 20) + (correctAnswerText.length > 20 ? "..." : "")}
          isCorrect={detail.correct}
          partInfo="Part 2 Match"
        />
      )
    })
  }

  // Part 3: Headings (Questions 15-20)
  if (result.parts.part3?.details) {
    const details = result.parts.part3.details as any[]
    details.forEach((detail: any, index: number) => {
      const userAnswerText = reading.part3.answers?.find(a => a.id === detail.answer_question_id)?.text || "—"
      const correctAnswerText = reading.part3.answers?.find(a => a.id === detail.correct_answer_id)?.text || "—"
      
      allCards.push(
        <AnswerCard
          key={`part3-${detail.question_id}`}
          questionNumber={detail.global_number || (15 + index)}
          userAnswer={userAnswerText.substring(0, 20) + (userAnswerText.length > 20 ? "..." : "")}
          correctAnswer={correctAnswerText.substring(0, 20) + (correctAnswerText.length > 20 ? "..." : "")}
          isCorrect={detail.correct}
          partInfo="Part 3 Head"
        />
      )
    })
  }

  // Part 4: MCQ + T/F/NG (Questions 21-29)
  if (result.parts.part4?.details) {
    const details = result.parts.part4.details as any[]
    details.forEach((detail: any, index: number) => {
      const question = reading.part4.questions?.find(q => q.id === detail.question_id)
      const userAnswerObj = question?.answers?.find(a => a.id === detail.answer_id)
      const userAnswerText = userAnswerObj?.answer || "—"
      
      allCards.push(
        <AnswerCard
          key={`part4-${detail.question_id}`}
          questionNumber={detail.global_number || (21 + index)}
          userAnswer={userAnswerText}
          correctAnswer={detail.correct_answer}
          isCorrect={detail.correct}
          partInfo="Part 4 MCQ"
        />
      )
    })
  }

  // Part 5: Mixed (Questions 30-35)
  if (result.parts.part5?.details) {
    const details = result.parts.part5.details as any
    const gapDetails = details.gap_filling || []
    const mcqDetails = details.questions || []
    
    // Gap filling cards
    gapDetails.forEach((detail: any) => {
      allCards.push(
        <AnswerCard
          key={`part5-gap-${detail.gap_filling_id}-${detail.position}`}
          questionNumber={detail.global_number || (30 + gapDetails.indexOf(detail))}
          userAnswer={detail.answer}
          correctAnswer={detail.correct_answer || "—"}
          isCorrect={detail.correct}
          partInfo="Part 5 Gap"
        />
      )
    })
    
    // MCQ cards
    mcqDetails.forEach((detail: any) => {
      const question = reading.part5.mcq_questions?.find(q => q.id === detail.question_id)
      const userAnswerObj = question?.answers?.find(a => a.id === detail.answer_id)
      const userAnswerText = userAnswerObj?.answer || "—"
      
      allCards.push(
        <AnswerCard
          key={`part5-mcq-${detail.question_id}`}
          questionNumber={detail.global_number || (30 + gapDetails.length + mcqDetails.indexOf(detail))}
          userAnswer={userAnswerText}
          correctAnswer={detail.correct_answer || "—"}
          isCorrect={detail.correct}
          partInfo="Part 5 MCQ"
        />
      )
    })
  }

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allCards}
        </div>
      </div>
    </div>
  )
}

// All Texts & Questions Accordion (like Listening Part 5 Extracts)
function AllTextsAccordion({ examData, userAnswers }: { 
  examData: ReadingFullMockQuestionsResponse
  userAnswers: Props['userAnswers']
}) {
  const [open, setOpen] = useState(false)
  const { reading } = examData

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          All Texts & Questions
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">
          View all 5 parts with texts and questions
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-on-surface-variant" />
          : <ChevronDown className="w-4 h-4 text-on-surface-variant" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-6">
              
              {/* Part 1 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-primary text-white flex-shrink-0">
                    1
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 1 — Gap Filling (Questions 1-6)
                  </p>
                </div>
                <div className="ml-8 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {reading.part1.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{reading.part1.title}</h4>
                  )}
                  {reading.part1.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{reading.part1.instruction}</p>
                  )}
                  <ReadingPart1Text
                    text={reading.part1.text || ""}
                    positions={reading.part1.questions?.map(q => q.position) || []}
                    answers={userAnswers.part1Answers}
                    onAnswerChange={() => {}} // Read-only
                    result={null} // No highlighting
                  />
                </div>
              </div>

              {/* Part 2 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-primary text-white flex-shrink-0">
                    2
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 2 — Matching (Questions 7-14)
                  </p>
                </div>
                <div className="ml-8 flex flex-col gap-4">
                  {reading.part2.instruction && (
                    <p className="text-xs text-on-surface-variant">{reading.part2.instruction}</p>
                  )}
                  
                  {/* Questions */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    <h4 className="text-sm font-bold text-on-surface mb-3">Questions</h4>
                    <div className="flex flex-col gap-2">
                      {reading.part2.questions?.map((q, i) => {
                        const letter = String.fromCharCode(65 + i)
                        return (
                          <div key={q.id} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                              {letter}
                            </span>
                            <p className="text-sm text-on-surface leading-relaxed flex-1">{q.text}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Passages */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    <h4 className="text-sm font-bold text-on-surface mb-3">Passages</h4>
                    <div className="flex flex-col gap-2">
                      {reading.part2.answers?.map((a, i) => (
                        <div key={a.id} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-secondary/10 text-on-surface">
                            {i + 1}
                          </span>
                          <p className="text-sm text-on-surface leading-relaxed flex-1">{a.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 3 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-primary text-white flex-shrink-0">
                    3
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 3 — Headings (Questions 15-20)
                  </p>
                </div>
                <div className="ml-8 flex flex-col gap-4">
                  {reading.part3.instruction && (
                    <p className="text-xs text-on-surface-variant">{reading.part3.instruction}</p>
                  )}
                  
                  {/* Headings */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    <h4 className="text-sm font-bold text-on-surface mb-3">Headings</h4>
                    <div className="flex flex-col gap-2">
                      {reading.part3.answers?.map((h, i) => (
                        <div key={h.id} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <p className="text-sm text-on-surface leading-relaxed flex-1">{h.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Paragraphs */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    <h4 className="text-sm font-bold text-on-surface mb-3">Paragraphs</h4>
                    <div className="flex flex-col gap-2">
                      {reading.part3.questions?.map((p, i) => (
                        <div key={p.id} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-secondary/10 text-on-surface">
                            {i + 1}
                          </span>
                          <p className="text-sm text-on-surface leading-relaxed flex-1">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 4 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-primary text-white flex-shrink-0">
                    4
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 4 — Multiple Choice (Questions 21-29)
                  </p>
                </div>
                <div className="ml-8 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {reading.part4.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{reading.part4.title}</h4>
                  )}
                  {reading.part4.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{reading.part4.instruction}</p>
                  )}
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {reading.part4.text}
                  </div>
                  
                  {/* Questions */}
                  <div className="mt-4 flex flex-col gap-3">
                    {reading.part4.questions?.map((q, i) => (
                      <div key={q.id} className="p-3 rounded-lg border border-outline-variant">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                            {21 + i}
                          </span>
                          <p className="text-xs font-semibold text-on-surface leading-snug">
                            {q.question}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 pl-7">
                          {q.answers.map((opt, oi) => {
                            const letter = String.fromCharCode(65 + oi)
                            return (
                              <div key={opt.id} className="flex items-center gap-2 text-xs text-on-surface">
                                <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center flex-shrink-0 bg-surface-container text-on-surface-variant">
                                  {letter}
                                </span>
                                <span className="leading-snug flex-1">{opt.answer}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Part 5 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-primary text-white flex-shrink-0">
                    5
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 5 — Mixed (Questions 30-35)
                  </p>
                </div>
                <div className="ml-8 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {reading.part5.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{reading.part5.title}</h4>
                  )}
                  {reading.part5.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{reading.part5.instruction}</p>
                  )}
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap mb-4">
                    {reading.part5.text}
                  </div>
                  
                  {/* Summary with gaps */}
                  {reading.part5.summary_text && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant">
                      <h5 className="text-xs font-bold text-on-surface mb-2">Summary</h5>
                      <div className="text-sm text-on-surface leading-relaxed">
                        {reading.part5.summary_text}
                      </div>
                    </div>
                  )}
                  
                  {/* MCQ Questions */}
                  {reading.part5.mcq_questions && reading.part5.mcq_questions.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {reading.part5.mcq_questions.map((q, i) => (
                        <div key={q.id} className="p-3 rounded-lg border border-outline-variant">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                              {33 + i}
                            </span>
                            <p className="text-xs font-semibold text-on-surface leading-snug">
                              {q.question}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 pl-7">
                            {q.answers.map((opt, oi) => {
                              const letter = String.fromCharCode(65 + oi)
                              return (
                                <div key={opt.id} className="flex items-center gap-2 text-xs text-on-surface">
                                  <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center flex-shrink-0 bg-surface-container text-on-surface-variant">
                                    {letter}
                                  </span>
                                  <span className="leading-snug flex-1">{opt.answer}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ReadingMockReviewAccordion({ examData, result, userAnswers }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Answer Review Grid - First */}
      <AnswerReview result={result} examData={examData} userAnswers={userAnswers} />
      
      {/* All Texts & Questions - Second */}
      <AllTextsAccordion examData={examData} userAnswers={userAnswers} />
    </div>
  )
}