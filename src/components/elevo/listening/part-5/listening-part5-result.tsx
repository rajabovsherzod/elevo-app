"use client"

import { useRef, useEffect, useState, memo } from "react"
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"
import type {
  ListeningPart5Extract,
  ListeningPart5EvaluateResponse,
} from "@/lib/api/listening"

// ── Answer Review Grid (like Part 2/3/4) ─────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  details,
  extracts,
  userAnswers,
}: {
  details:     ListeningPart5EvaluateResponse["details"]
  extracts:    ListeningPart5Extract[]
  userAnswers: Record<number, number>
}) {
  // Flatten all questions from all extracts
  const allQuestions: Array<{ extractIndex: number; questionIndex: number; question: any }> = []
  extracts.forEach((extract, ei) => {
    extract.questions.forEach((q, qi) => {
      allQuestions.push({ extractIndex: ei, questionIndex: qi, question: q })
    })
  })

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allQuestions.map(({ extractIndex, questionIndex, question }, globalIndex) => {
            const detail       = details.find(d => d.question_id === question.id)
            const userAnswerId = userAnswers[question.id]
            const isCorrect    = detail?.correct ?? false

            const userOpt    = question.answers.find((a: any) => a.id === userAnswerId)
            const correctOpt = question.answers.find((a: any) => a.id === detail?.correct_answer_id)

            const userLetter    = userOpt ? String.fromCharCode(65 + question.answers.indexOf(userOpt)) : "—"
            const correctLetter = correctOpt ? String.fromCharCode(65 + question.answers.indexOf(correctOpt)) : "—"

            return (
              <div
                key={question.id}
                className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm">
                    {globalIndex + 1}
                  </span>
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <XCircle      className="w-4 h-4 text-error" />
                  }
                </div>

                <p className="text-[11px] text-on-surface-variant font-medium truncate">
                  Extract {extractIndex + 1} Q{questionIndex + 1}
                </p>

                {isCorrect ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-green-600">{userLetter}.</span>
                    <span className="text-[11px] font-semibold text-green-600 truncate">
                      {userOpt?.answer}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-black text-error line-through opacity-70">{userLetter}.</span>
                      <span className="text-[11px] font-semibold text-error line-through opacity-70 truncate">
                        {userOpt?.answer}
                      </span>
                    </div>
                    {correctLetter && correctLetter !== "—" && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-black text-green-600">{correctLetter}.</span>
                        <span className="text-[11px] font-semibold text-green-600 truncate">
                          {correctOpt?.answer}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

// ── Extracts Accordion (like Part 2/3/4) ─────────────────────────────────────
const ExtractsAccordion = memo(function ExtractsAccordion({
  extracts,
  details,
  userAnswers,
}: {
  extracts:    ListeningPart5Extract[]
  details:     ListeningPart5EvaluateResponse["details"]
  userAnswers: Record<number, number>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          All Extracts & Questions
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">
          View {extracts.length} extracts with questions
        </span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-on-surface-variant" />
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
            <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
              {extracts.map((extract, ei) => (
                <div key={extract.id} className="flex flex-col gap-3">
                  {/* Extract header */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-primary text-white flex-shrink-0">
                      {ei + 1}
                    </span>
                    <p className="text-xs font-bold text-on-surface">
                      Extract {ei + 1}
                      {extract.title ? ` — ${extract.title}` : ""}
                    </p>
                  </div>

                  {/* Questions */}
                  {extract.questions.map((q, qi) => {
                    const detail       = details.find(d => d.question_id === q.id)
                    const userAnswerId = userAnswers[q.id]
                    const isCorrect    = detail?.correct ?? false

                    return (
                      <div
                        key={q.id}
                        className="flex flex-col gap-2 p-3 rounded-xl border border-outline-variant ml-8"
                      >
                        {/* Question text */}
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                            {ei * 2 + qi + 1}
                          </span>
                          <p className="text-xs font-semibold text-on-surface leading-snug">
                            {q.question}
                          </p>
                        </div>

                        {/* Answers - show ALL 3 options */}
                        <div className="flex flex-col gap-1.5 pl-7">
                          {q.answers.map((opt, oi) => {
                            const letter       = String.fromCharCode(65 + oi)
                            const isUser       = opt.id === userAnswerId
                            const isCorrectOpt = opt.id === detail?.correct_answer_id

                            return (
                              <div
                                key={opt.id}
                                className="flex items-center gap-2 text-xs text-on-surface"
                              >
                                <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center flex-shrink-0 bg-surface-container text-on-surface-variant">
                                  {letter}
                                </span>
                                <span className="leading-snug flex-1">{opt.answer}</span>
                                {/* Show icons for user/correct */}
                                {isCorrectOpt && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
                                {isUser && !isCorrectOpt && (
                                  <XCircle className="w-4 h-4 text-error flex-shrink-0" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── Props / Main ──────────────────────────────────────────────────────────────
interface Props {
  result:      ListeningPart5EvaluateResponse
  extracts:    ListeningPart5Extract[]
  audioUrls:   string[]
  userAnswers: Record<number, number>
}

export function ListeningPart5Result({ result, extracts, audioUrls, userAnswers }: Props) {
  const barRef       = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent)
  const isGood       = scorePercent >= 70

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${scorePercent}%`
  }, [scorePercent])

  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* Score card */}
      <div className="elevo-card elevo-card-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
              Your Score
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {result.correct_count} / {result.total_questions} correct
            </p>
            {result.total_questions - result.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {result.total_questions - result.correct_count} incorrect
              </p>
            )}
          </div>
          <span className={cx("text-4xl font-black tabular-nums", isGood ? "text-primary" : "text-error")}>
            {scorePercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            ref={barRef}
            className={cx("h-full rounded-full", isGood ? "bg-primary" : "bg-error")}
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Answer review grid */}
      <AnswerReview details={result.details} extracts={extracts} userAnswers={userAnswers} />

      {/* Audio player */}
      {audioUrls.length > 0 && audioUrls[0] && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: "layout style paint" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio (All Extracts)
          </p>
          <ListeningAudioPlayer src={audioUrls[0]} />
        </div>
      )}

      {/* Extracts accordion */}
      <ExtractsAccordion extracts={extracts} details={result.details} userAnswers={userAnswers} />
    </div>
  )
}
