"use client"

import { useRef, useEffect, useState } from "react"
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type { ListeningPart1EvaluateResponse, ListeningPart1Question } from "@/lib/api/listening"
import { ListeningPart1AudioPlayer } from "./listening-part1-audio-player"

// ── Props ──────────────────────────────────────────────────────────────────────
function AccordionRow({
  title,
  open,
  onToggle,
  last = false,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={last ? "" : "border-b border-surface-container-high"}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">{title}</span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-on-surface-variant" />
          : <ChevronDown className="w-4 h-4 text-on-surface-variant" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  result:    ListeningPart1EvaluateResponse
  questions: ListeningPart1Question[]
  audioUrl:  string | null
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart1Result({ result, questions, audioUrl }: Props) {
  const barRef       = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.score_percent)
  const isGood       = scorePercent >= 70

  const [audioOpen,     setAudioOpen]     = useState(true)
  const [questionsOpen, setQuestionsOpen] = useState(false)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${scorePercent}%`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* ── Score card ── */}
      <div className="elevo-card p-6">
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

      {/* ── Question results grid (no separators) ── */}
      <div className="elevo-card p-4">
        <div className="grid grid-cols-4 gap-2">
          {result.details.map((d, i) => (
            <div
              key={d.question_id}
              className="flex flex-col items-center gap-1.5 py-2.5"
            >
              <span className="text-[10px] font-black text-on-surface-variant">Q{i + 1}</span>
              {d.correct
                ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                : <XCircle      className="w-5 h-5 text-error" />
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── Answer review ── */}
      <div className="elevo-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Answer Review
          </p>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {result.details.map((d, i) => {
            const question  = questions.find(q => q.id === d.question_id)
            const isCorrect = d.correct

            return (
              <div
                key={d.question_id}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
              >
                <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500 text-white shadow-sm">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {question?.question && (
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">
                      {question.question}
                    </p>
                  )}
                  {isCorrect ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 h-7 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center shadow-sm">
                        {d.user_answer_text ?? "—"}
                      </span>
                      <span className="text-xs font-bold text-green-600">Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 h-7 rounded-lg bg-red-500/10 text-error text-xs font-bold flex items-center line-through opacity-70 border border-red-500/20">
                        {d.user_answer_text ?? "—"}
                      </span>
                      <span className="text-on-surface-variant text-xs">→</span>
                      <span className="px-3 h-7 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center shadow-sm">
                        {d.correct_answer_text ?? "—"}
                      </span>
                    </div>
                  )}
                </div>

                {isCorrect
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                  : <XCircle      className="w-5 h-5 text-error shrink-0 mt-1" />
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Audio review accordion ── */}
      {audioUrl && (
        <div className="elevo-card overflow-hidden">
          <div className="px-4 py-3 bg-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              Audio Review
            </p>
          </div>

          <div className="flex flex-col">
            <AccordionRow
              title="Listen Again"
              open={audioOpen}
              onToggle={() => setAudioOpen(p => !p)}
            >
              <div className="px-4 pb-4 pt-2">
                <ListeningPart1AudioPlayer src={audioUrl} />
              </div>
            </AccordionRow>

            <AccordionRow
              title={`Questions (${questions.length})`}
              open={questionsOpen}
              onToggle={() => setQuestionsOpen(p => !p)}
              last
            >
              <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-on-surface">
                      <span className="text-primary font-black">{i + 1}.</span> {q.question}
                    </p>
                    <div className="pl-6 flex flex-col gap-1.5">
                      {q.answers.map((a, ai) => (
                        <p key={a.id} className="text-xs text-on-surface-variant">
                          <span className="font-bold text-on-surface">
                            {String.fromCharCode(65 + ai)}.
                          </span>{" "}
                          {a.answer.length > 2 && a.answer[1] === "." ? a.answer.slice(3) : a.answer}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionRow>
          </div>
        </div>
      )}
    </div>
  )
}
