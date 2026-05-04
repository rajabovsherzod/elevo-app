"use client"

import { useRef, useEffect, useState, memo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type { ListeningPart2EvaluateResponse, ListeningPart2QuestionsResponse } from "@/lib/api/listening"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"
import { ListeningPart2GapText } from "./listening-part2-gap-text"
import { AnswerCard } from "@/components/elevo/shared/answer-card"

// ── Memoized Answer Review ────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  results,
}: {
  results: Record<string, { is_correct: boolean; user_answer: string; correct_answer: string }>
}) {
  const positions = Object.keys(results).sort((a, b) => parseInt(a) - parseInt(b))
  
  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {positions.map((pos) => {
            const r = results[pos]
            return (
              <AnswerCard
                key={pos}
                position={pos}
                isCorrect={r.is_correct}
                userAnswer={r.user_answer}
                correctAnswer={r.correct_answer}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
})

// ── Text Accordion ────────────────────────────────────────────────────────────
const TextAccordion = memo(function TextAccordion({
  data,
  result,
}: {
  data: ListeningPart2QuestionsResponse
  result: ListeningPart2EvaluateResponse
}) {
  const [open, setOpen] = useState(false)
  // Show correct answers only
  const correctAnswers: Record<number, string> = {}
  Object.entries(result.results).forEach(([pos, r]) => {
    correctAnswers[parseInt(pos)] = r.correct_answer
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
                <ListeningPart2GapText
                  text={data.question ?? ""}
                  positions={data.positions}
                  answers={correctAnswers}
                  onAnswerChange={() => {}}
                  disabled
                  result={null}
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
  result:   ListeningPart2EvaluateResponse
  data:     ListeningPart2QuestionsResponse
  audioUrl: string | null
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart2Result({ result, data, audioUrl }: Props) {
  const barRef       = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.summary.score_percent)
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
              {result.summary.correct_count} / {result.summary.total} correct
            </p>
            {result.summary.total - result.summary.correct_count > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {result.summary.total - result.summary.correct_count} incorrect
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
      <AnswerReview results={result.results} />

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
      <TextAccordion data={data} result={result} />
    </div>
  )
}

