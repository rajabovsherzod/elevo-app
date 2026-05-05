"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Volume2 } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { ListeningPart2GapText } from "@/components/elevo/listening/part-2/listening-part2-gap-text"
import { ListeningPart6GapText } from "@/components/elevo/listening/part-6/listening-part6-gap-text"
import type { 
  ListeningMockQuestionResponse, 
  ListeningMockEvaluateResponse 
} from "@/lib/api/listening-mock"

interface Props {
  examData: ListeningMockQuestionResponse
  result: ListeningMockEvaluateResponse
}

// All Audio & Questions Accordion
function AllAudioAccordion({ examData, result }: { 
  examData: ListeningMockQuestionResponse
  result: ListeningMockEvaluateResponse
}) {
  const [open, setOpen] = useState(false)
  const partDetails = result.part_details

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
              {partDetails.part1 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 pt-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      1
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Part 1 — Short Conversations (Questions 1-8)
                    </p>
                    <span className="ml-auto text-xs text-on-surface-variant">
                      {partDetails.part1.summary.correct_count}/{partDetails.part1.summary.total}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    {examData.part1.title && (
                      <h4 className="text-sm font-bold text-on-surface mb-2">{examData.part1.title}</h4>
                    )}
                    {examData.part1.instruction && (
                      <p className="text-xs text-on-surface-variant mb-3">{examData.part1.instruction}</p>
                    )}
                    
                    {/* Audio Player */}
                    {examData.part1.audio_url && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <audio controls className="flex-1 h-8">
                          <source src={examData.part1.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    
                    {/* Questions */}
                    <div className="flex flex-col gap-3">
                      {examData.part1.questions.map((q) => {
                        const globalPos = q.position.toString()
                        const correctAnswer = result.results[globalPos]?.correct_answer
                        
                        return (
                          <div key={q.position} className="p-3 rounded-lg border border-outline-variant">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                                {q.position}
                              </span>
                              <p className="text-xs font-semibold text-on-surface leading-snug">
                                {q.question}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 pl-7">
                              {q.answers.map((ans) => {
                                const isCorrect = ans.letter === correctAnswer
                                return (
                                  <div 
                                    key={ans.letter} 
                                    className="flex items-center gap-2 text-xs text-on-surface"
                                  >
                                    <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center flex-shrink-0 bg-surface-container text-on-surface-variant">
                                      {ans.letter}
                                    </span>
                                    <span className="leading-snug flex-1">{ans.text}</span>
                                    {isCorrect && (
                                      <span className="text-[10px] font-bold uppercase tracking-wide text-green-500">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Part 2 */}
              {partDetails.part2 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      2
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Part 2 — Gap Filling (Questions 9-13)
                    </p>
                    <span className="ml-auto text-xs text-on-surface-variant">
                      {partDetails.part2.summary.correct_count}/{partDetails.part2.summary.total}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    {examData.part2.title && (
                      <h4 className="text-sm font-bold text-on-surface mb-2">{examData.part2.title}</h4>
                    )}
                    {examData.part2.instruction && (
                      <p className="text-xs text-on-surface-variant mb-3">{examData.part2.instruction}</p>
                    )}
                    
                    {/* Audio Player */}
                    {examData.part2.audio_url && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <audio controls className="flex-1 h-8">
                          <source src={examData.part2.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    
                    {/* Gap Text with Correct Answers (Disabled Inputs) */}
                    <div className="rounded-xl p-4 bg-surface-container mb-4">
                      <ListeningPart2GapText
                        text={examData.part2.question}
                        positions={examData.part2.positions}
                        answers={Object.fromEntries(
                          examData.part2.positions.map((pos) => {
                            const globalPos = (8 + pos).toString()
                            return [pos, result.results[globalPos]?.correct_answer || ""]
                          })
                        )}
                        onAnswerChange={() => {}}
                        disabled={true}
                      />
                    </div>
                    
                    {/* Correct Answers List */}
                    <div className="flex flex-col gap-2">
                      {examData.part2.positions.map((pos) => {
                        const globalPos = (8 + pos).toString()
                        const resultItem = result.results[globalPos]
                        return (
                          <div key={pos} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container/50">
                            <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                              {8 + pos}
                            </span>
                            <span className="text-sm text-green-500 font-semibold">
                              {resultItem?.correct_answer || "—"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Part 3 */}
              {partDetails.part3 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      3
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Part 3 — Speaker Matching (Questions 14-18)
                    </p>
                    <span className="ml-auto text-xs text-on-surface-variant">
                      {partDetails.part3.summary.correct_count}/{partDetails.part3.summary.total}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    {examData.part3.title && (
                      <h4 className="text-sm font-bold text-on-surface mb-2">{examData.part3.title}</h4>
                    )}
                    {examData.part3.instruction && (
                      <p className="text-xs text-on-surface-variant mb-3">{examData.part3.instruction}</p>
                    )}
                    
                    {/* Audio Player */}
                    {examData.part3.audio_url && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <audio controls className="flex-1 h-8">
                          <source src={examData.part3.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    
                    {/* Options */}
                    <div className="mb-4 p-3 rounded-lg bg-surface-container">
                      <p className="text-xs font-bold text-on-surface-variant mb-2">OPTIONS:</p>
                      <div className="flex flex-col gap-1">
                        {examData.part3.options.map((opt) => (
                          <div key={opt.letter} className="text-xs text-on-surface">
                            <span className="font-bold">{opt.letter}.</span> {opt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Speakers with Correct Answers */}
                    <div className="flex flex-col gap-2">
                      {examData.part3.speakers.map((speaker) => {
                        const globalPos = (examData.part3.global_start + speaker.position - 1).toString()
                        const correctAnswer = result.results[globalPos]?.correct_answer
                        
                        return (
                          <div key={speaker.position} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container/50">
                            <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                              {examData.part3.global_start + speaker.position - 1}
                            </span>
                            <p className="text-sm text-on-surface leading-relaxed flex-1">{speaker.text}</p>
                            {correctAnswer && (
                              <span className="text-sm font-black text-green-500 flex-shrink-0">
                                {correctAnswer}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Part 4 */}
              {partDetails.part4 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      4
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Part 4 — Map Task (Questions 19-23)
                    </p>
                    <span className="ml-auto text-xs text-on-surface-variant">
                      {partDetails.part4.summary.correct_count}/{partDetails.part4.summary.total}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    {examData.part4.title && (
                      <h4 className="text-sm font-bold text-on-surface mb-2">{examData.part4.title}</h4>
                    )}
                    {examData.part4.instruction && (
                      <p className="text-xs text-on-surface-variant mb-3">{examData.part4.instruction}</p>
                    )}
                    
                    {/* Map Image */}
                    {examData.part4.map_image_url && (
                      <div className="mb-4">
                        <img 
                          src={examData.part4.map_image_url} 
                          alt="Part 4 Map" 
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                    
                    {/* Audio Player */}
                    {examData.part4.audio_url && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <audio controls className="flex-1 h-8">
                          <source src={examData.part4.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    
                    {/* Places with Correct Answers */}
                    <div className="flex flex-col gap-2">
                      {examData.part4.places.map((place) => {
                        const globalPos = (examData.part4.global_start + place.position - 1).toString()
                        const correctAnswer = result.results[globalPos]?.correct_answer
                        
                        return (
                          <div key={place.position} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container/50">
                            <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                              {examData.part4.global_start + place.position - 1}
                            </span>
                            <p className="text-sm text-on-surface leading-relaxed flex-1">{place.text}</p>
                            {correctAnswer && (
                              <span className="text-lg font-black text-green-500 flex-shrink-0">
                                {correctAnswer}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Part 5 */}
              {partDetails.part5 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      5
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Part 5 — Multiple Choice (Questions 24-29)
                    </p>
                    <span className="ml-auto text-xs text-on-surface-variant">
                      {partDetails.part5.summary.correct_count}/{partDetails.part5.summary.total}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {examData.part5.instruction && (
                      <p className="text-xs text-on-surface-variant">{examData.part5.instruction}</p>
                    )}
                    
                    {examData.part5.extracts.map((extract) => (
                      <div key={extract.extract_number} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                        <div className="mb-3 p-2 rounded bg-indigo-500/10">
                          <p className="text-xs font-bold text-indigo-600">Extract {extract.extract_number}</p>
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
                          {extract.questions.map((q) => {
                            const globalPos = (examData.part5.global_start + q.position - 1).toString()
                            const correctAnswer = result.results[globalPos]?.correct_answer
                            
                            return (
                              <div key={q.position} className="p-3 rounded-lg border border-outline-variant">
                                <div className="flex items-start gap-2 mb-2">
                                  <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                                    {examData.part5.global_start + q.position - 1}
                                  </span>
                                  <p className="text-xs font-semibold text-on-surface leading-snug">
                                    {q.question}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1 pl-7">
                                  {q.answers.map((ans) => {
                                    const isCorrect = ans.letter === correctAnswer
                                    return (
                                      <div 
                                        key={ans.letter} 
                                        className="flex items-center gap-2 text-xs text-on-surface"
                                      >
                                        <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center flex-shrink-0 bg-surface-container text-on-surface-variant">
                                          {ans.letter}
                                        </span>
                                        <span className="leading-snug flex-1">{ans.text}</span>
                                        {isCorrect && (
                                          <span className="text-[10px] font-bold uppercase tracking-wide text-green-500">
                                            Correct
                                          </span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Part 6 */}
              {partDetails.part6 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      6
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Part 6 — Gap Filling (Questions 30-35)
                    </p>
                    <span className="ml-auto text-xs text-on-surface-variant">
                      {partDetails.part6.summary.correct_count}/{partDetails.part6.summary.total}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                    {examData.part6.title && (
                      <h4 className="text-sm font-bold text-on-surface mb-2">{examData.part6.title}</h4>
                    )}
                    {examData.part6.instruction && (
                      <p className="text-xs text-on-surface-variant mb-3">{examData.part6.instruction}</p>
                    )}
                    
                    {/* Audio Player */}
                    {examData.part6.audio_url && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <audio controls className="flex-1 h-8">
                          <source src={examData.part6.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    
                    {/* Gap Text with Correct Answers (Disabled Inputs) */}
                    <div className="rounded-xl p-4 bg-surface-container mb-4">
                      <ListeningPart6GapText
                        text={examData.part6.question}
                        positions={examData.part6.positions}
                        answers={Object.fromEntries(
                          examData.part6.positions.map((pos) => {
                            const globalPos = (29 + pos).toString()
                            return [pos, result.results[globalPos]?.correct_answer || ""]
                          })
                        )}
                        onAnswerChange={() => {}}
                        disabled={true}
                      />
                    </div>
                    
                    {/* Correct Answers List */}
                    <div className="flex flex-col gap-2">
                      {examData.part6.positions.map((pos) => {
                        const globalPos = (29 + pos).toString()
                        const resultItem = result.results[globalPos]
                        return (
                          <div key={pos} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container/50">
                            <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                              {29 + pos}
                            </span>
                            <span className="text-sm text-green-500 font-semibold">
                              {resultItem?.correct_answer || "—"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ListeningMockReviewAccordion({ examData, result }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* All Audio & Questions - Only This */}
      <AllAudioAccordion examData={examData} result={result} />
    </div>
  )
}
