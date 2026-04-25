"use client"

import { useRef, useEffect, useState, memo } from "react"
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type { ListeningPart6EvaluateResponse, ListeningPart6Question } from "@/lib/api/listening"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"
import { ListeningPart6GapText } from "./listening-part6-gap-text"

// ── Memoized Answer Review ────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  details,
}: {
  details: ListeningPart6EvaluateResponse["details"]
}) {
  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {details.map((d) => (
            <div
              key={d.position}
              className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm">
                  {d.position}
                </span>
                {d.correct
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <XCircle      className="w-4 h-4 text-error" />
                }
              </div>

              {d.correct ? (
                <span className="text-[11px] font-bold text-green-600 truncate">
                  {d.answer || "—"}
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-error line-through opacity-70 truncate">
                    {d.answer || "—"}
                  </span>
                  {d.correct_answer && (
                    <span className="text-[11px] font-bold text-green-600 truncate">
                      {d.correct_answer}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

// ── Text Accordion ────────────────────────────────────────────────────────────
const TextAccordion = memo(function TextAccordion({
  question,
  result,
}: {
  question: ListeningPart6Question
  result: ListeningPart6EvaluateResponse
}) {
  const [open, setOpen] = useState(false)
  // Show user's answers with color (correct_answer not returned by backend)
  const filledAnswers: Record<number, string> = {}
  result.details.forEach(d => {
    filledAnswers[d.position] = d.correct_answer ?? d.answer ?? ""
  })

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Text & Answers
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">View full text</span>
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
            <div className="px-4 pb-4 pt-1">
              <div
                className="rounded-xl p-4 elevo-card-border"
                style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
              >
                <ListeningPart6GapText
                  text={question.text ?? ""}
                  positions={question.positions}
                  answers={filledAnswers}
                  onAnswerChange={() => {}}
                  disabled
                  result={result}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  result:   ListeningPart6EvaluateResponse
  question: ListeningPart6Question
  audioUrl: string | null
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart6Result({ result, question, audioUrl }: Props) {
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
      <AnswerReview details={result.details} />

      {/* Audio player */}
      {audioUrl && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: "layout style paint" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio
          </p>
          <ListeningAudioPlayer src={audioUrl} />
        </div>
      )}

      {/* Text accordion */}
      <TextAccordion question={question} result={result} />
    </div>
  )
}
