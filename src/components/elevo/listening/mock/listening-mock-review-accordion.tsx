"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Volume2 } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { 
  ListeningFullMockQuestionsResponse, 
  ListeningFullMockEvaluateResponse 
} from "@/lib/api/listening-mock"

interface Props {
  examData: ListeningFullMockQuestionsResponse
  result: ListeningFullMockEvaluateResponse
  userAnswers: {
    part1Answers: Record<number, number>
    part2Answers: Record<number, string>
    part3Matches: Record<number, number>
    part4Matches: Record<number, string> // Changed to string for letter input
    part5Answers: Record<number, number>
    part6Answers: Record<number, string>
  }
}

// Professional Answer Card Component
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

// Answer Review Grid Component
function AnswerReview({ result, examData, userAnswers }: { 
  result: ListeningFullMockEvaluateResponse
  examData: ListeningFullMockQuestionsResponse
  userAnswers: Props['userAnswers']
}) {
  const { listening } = examData
  const allCards: React.JSX.Element[] = []

  // Part 1: MCQ (Questions 1-8)
  if (result.parts.part1?.details) {
    const details = result.parts.part1.details as any[]
    details.forEach((detail: any) => {
      const answer = listening.part1.answers.find(a => a.id === detail.answer_id)
      const correctAnswer = listening.part1.answers.find(a => a.id === detail.correct_answer_id)
      
      allCards.push(
        <AnswerCard
          key={`part1-${detail.global_number}`}
          questionNumber={detail.global_number}
          userAnswer={answer?.answer || "—"}
          correctAnswer={correctAnswer?.answer || "—"}
          isCorrect={detail.correct}
          partInfo="Part 1 MCQ"
        />
      )
    })
  }

  // Part 2: Gap Filling (Questions 9-13)
  if (result.parts.part2?.details) {
    const details = result.parts.part2.details as any[]
    details.forEach((detail: any) => {
      allCards.push(
        <AnswerCard
          key={`part2-${detail.global_number}`}
          questionNumber={detail.global_number}
          userAnswer={detail.user_answer || "—"}
          correctAnswer={detail.correct_answer || "—"}
          isCorrect={detail.correct}
          partInfo="Part 2 Gap"
        />
      )
    })
  }

  // Part 3: Matching (Questions 14-18)
  if (result.parts.part3?.details) {
    const details = result.parts.part3.details as any[]
    details.forEach((detail: any) => {
      const userAnswerText = listening.part3.answers?.find(a => a.id === detail.answer_question_id)?.text || "—"
      const correctAnswerText = listening.part3.answers?.find(a => a.id === detail.correct_answer_id)?.text || "—"
      
      allCards.push(
        <AnswerCard
          key={`part3-${detail.global_number}`}
          questionNumber={detail.global_number}
          userAnswer={userAnswerText.substring(0, 20) + (userAnswerText.length > 20 ? "..." : "")}
          correctAnswer={correctAnswerText.substring(0, 20) + (correctAnswerText.length > 20 ? "..." : "")}
          isCorrect={detail.correct}
          partInfo="Part 3 Match"
        />
      )
    })
  }

  // Part 4: Matching (Questions 19-23)
  if (result.parts.part4?.details) {
    const details = result.parts.part4.details as any[]
    details.forEach((detail: any) => {
      // Backend returns answer_question_id (letter ID) and correct_answer (letter text)
      // Find user's letter text from questions array
      const userAnswerText = listening.part4.questions?.find(q => q.id === detail.answer_question_id)?.text || "—"
      const correctAnswerText = detail.correct_answer || "—"
      
      allCards.push(
        <AnswerCard
          key={`part4-${detail.global_number}`}
          questionNumber={detail.global_number}
          userAnswer={userAnswerText.substring(0, 20) + (userAnswerText.length > 20 ? "..." : "")}
          correctAnswer={correctAnswerText.substring(0, 20) + (correctAnswerText.length > 20 ? "..." : "")}
          isCorrect={detail.correct}
          partInfo="Part 4 Match"
        />
      )
    })
  }

  // Part 5: MCQ (Questions 24-29)
  if (result.parts.part5?.details) {
    const details = result.parts.part5.details as any[]
    details.forEach((detail: any) => {
      // Find the question and answer from extracts
      let userAnswerText = "—"
      let correctAnswerText = "—"
      
      for (const extract of listening.part5.extracts) {
        const question = extract.questions.find(q => q.id === detail.question_id)
        if (question) {
          const userAns = question.answers.find(a => a.id === detail.answer_id)
          const correctAns = question.answers.find(a => a.id === detail.correct_answer_id)
          userAnswerText = userAns?.answer || "—"
          correctAnswerText = correctAns?.answer || "—"
          break
        }
      }
      
      allCards.push(
        <AnswerCard
          key={`part5-${detail.global_number}`}
          questionNumber={detail.global_number}
          userAnswer={userAnswerText}
          correctAnswer={correctAnswerText}
          isCorrect={detail.correct}
          partInfo="Part 5 MCQ"
        />
      )
    })
  }

  // Part 6: Gap Filling (Questions 30-35)
  if (result.parts.part6?.details) {
    const details = result.parts.part6.details as any[]
    details.forEach((detail: any) => {
      allCards.push(
        <AnswerCard
          key={`part6-${detail.global_number}`}
          questionNumber={detail.global_number}
          userAnswer={detail.user_answer || "—"}
          correctAnswer={detail.correct_answer || "—"}
          isCorrect={detail.correct}
          partInfo="Part 6 Gap"
        />
      )
    })
  }

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-indigo-500/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
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

// All Audio & Questions Accordion
function AllAudioAccordion({ examData, userAnswers }: { 
  examData: ListeningFullMockQuestionsResponse
  userAnswers: Props['userAnswers']
}) {
  const [open, setOpen] = useState(false)
  const { listening } = examData

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-indigo-500/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
          All Audio & Questions
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">
          View all 6 parts with audio and questions
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
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                    1
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 1 — Short Conversations (Questions 1-8)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {listening.part1.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{listening.part1.title}</h4>
                  )}
                  {listening.part1.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{listening.part1.instruction}</p>
                  )}
                  
                  {/* Audio Player */}
                  {listening.part1.audio_url && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <audio controls className="flex-1 h-8">
                        <source src={listening.part1.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  
                  {/* Questions */}
                  <div className="flex flex-col gap-2">
                    {listening.part1.answers.map((ans) => (
                      <div key={ans.id} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container/50">
                        <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500/20 text-indigo-600 flex-shrink-0 mt-0.5">
                          {ans.global_number}
                        </span>
                        <p className="text-sm text-on-surface leading-relaxed flex-1">{ans.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Part 2 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                    2
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 2 — Gap Filling (Questions 9-13)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {listening.part2.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{listening.part2.title}</h4>
                  )}
                  {listening.part2.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{listening.part2.instruction}</p>
                  )}
                  
                  {/* Audio Player */}
                  {listening.part2.audio_url && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <audio controls className="flex-1 h-8">
                        <source src={listening.part2.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  
                  {/* Positions */}
                  <div className="flex flex-col gap-2">
                    {listening.part2.positions.map((pos) => (
                      <div key={pos.position} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container/50">
                        <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500/20 text-indigo-600 flex-shrink-0">
                          {pos.global_number}
                        </span>
                        <span className="text-sm text-on-surface">Gap {pos.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Part 3 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                    3
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 3 — Matching (Questions 14-18)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {listening.part3.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{listening.part3.title}</h4>
                  )}
                  {listening.part3.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{listening.part3.instruction}</p>
                  )}
                  
                  {/* Audio Player */}
                  {listening.part3.audio_url && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <audio controls className="flex-1 h-8">
                        <source src={listening.part3.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  
                  {/* Options */}
                  <div className="mb-4 p-3 rounded-lg bg-surface-container">
                    <p className="text-xs font-bold text-on-surface-variant mb-2">OPTIONS:</p>
                    <div className="flex flex-col gap-1">
                      {listening.part3.answers.map((ans, i) => (
                        <div key={ans.id} className="text-xs text-on-surface">
                          <span className="font-bold">{String.fromCharCode(65 + i)}.</span> {ans.text}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Questions */}
                  <div className="flex flex-col gap-2">
                    {listening.part3.questions.map((q) => (
                      <div key={q.id} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container/50">
                        <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500/20 text-indigo-600 flex-shrink-0 mt-0.5">
                          {q.global_number}
                        </span>
                        <p className="text-sm text-on-surface leading-relaxed flex-1">{q.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Part 4 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                    4
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 4 — Matching (Questions 19-23)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {listening.part4.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{listening.part4.title}</h4>
                  )}
                  {listening.part4.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{listening.part4.instruction}</p>
                  )}
                  
                  {/* Image */}
                  {listening.part4.image_url && (
                    <div className="mb-4">
                      <img 
                        src={listening.part4.image_url} 
                        alt="Part 4" 
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* Audio Player */}
                  {listening.part4.audio_url && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <audio controls className="flex-1 h-8">
                        <source src={listening.part4.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  
                  {/* Options */}
                  <div className="mb-4 p-3 rounded-lg bg-surface-container">
                    <p className="text-xs font-bold text-on-surface-variant mb-2">OPTIONS:</p>
                    <div className="flex flex-col gap-1">
                      {listening.part4.answers.map((ans, i) => (
                        <div key={ans.id} className="text-xs text-on-surface">
                          <span className="font-bold">{String.fromCharCode(65 + i)}.</span> {ans.text}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Questions */}
                  <div className="flex flex-col gap-2">
                    {listening.part4.questions.map((q) => (
                      <div key={q.id} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container/50">
                        <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500/20 text-indigo-600 flex-shrink-0 mt-0.5">
                          {q.global_number}
                        </span>
                        <p className="text-sm text-on-surface leading-relaxed flex-1">{q.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Part 5 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                    5
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 5 — Multiple Choice (Questions 24-29)
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {listening.part5.instruction && (
                    <p className="text-xs text-on-surface-variant">{listening.part5.instruction}</p>
                  )}
                  
                  {listening.part5.extracts.map((extract) => (
                    <div key={extract.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                      <div className="mb-3 p-2 rounded bg-indigo-500/10">
                        <p className="text-xs font-bold text-indigo-600">{extract.extract}</p>
                        {extract.title && (
                          <p className="text-xs text-on-surface mt-1">{extract.title}</p>
                        )}
                      </div>
                      
                      {/* Audio Player */}
                      {extract.audio_url && (
                        <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                          <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <audio controls className="flex-1 h-8">
                            <source src={extract.audio_url} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                      
                      {/* Questions */}
                      <div className="flex flex-col gap-3">
                        {extract.questions.map((q) => (
                          <div key={q.id} className="p-3 rounded-lg border border-outline-variant">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500/20 text-indigo-600 flex-shrink-0 mt-0.5">
                                {q.global_number}
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
                  ))}
                </div>
              </div>

              {/* Part 6 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                    6
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    Part 6 — Gap Filling (Questions 30-35)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                  {listening.part6.title && (
                    <h4 className="text-sm font-bold text-on-surface mb-2">{listening.part6.title}</h4>
                  )}
                  {listening.part6.instruction && (
                    <p className="text-xs text-on-surface-variant mb-3">{listening.part6.instruction}</p>
                  )}
                  
                  {/* Audio Player */}
                  {listening.part6.audio_url && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <audio controls className="flex-1 h-8">
                        <source src={listening.part6.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  
                  {/* Positions */}
                  <div className="flex flex-col gap-2">
                    {listening.part6.positions.map((pos) => (
                      <div key={pos.position} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container/50">
                        <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500/20 text-indigo-600 flex-shrink-0">
                          {pos.global_number}
                        </span>
                        <span className="text-sm text-on-surface">Gap {pos.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ListeningMockReviewAccordion({ examData, result, userAnswers }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Answer Review Grid - First */}
      <AnswerReview result={result} examData={examData} userAnswers={userAnswers} />
      
      {/* All Audio & Questions - Second */}
      <AllAudioAccordion examData={examData} userAnswers={userAnswers} />
    </div>
  )
}
