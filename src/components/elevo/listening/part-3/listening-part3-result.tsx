"use client"

import { useRef, useEffect, useState, memo } from "react"
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type {
  ListeningPart3EvaluateResponse,
  ListeningPart3Set,
  ListeningPart3QuestionItem,
} from "@/lib/api/listening"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"

// ── Answer Review Grid ────────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  details,
  speakers,
  options,
}: {
  details: ListeningPart3EvaluateResponse["details"]
  speakers: ListeningPart3QuestionItem[]
  options: ListeningPart3Set["answers"]
}) {
  const letterOf = (id: number | null | undefined) => {
    if (id == null) return "—"
    const i = options.findIndex(o => o.id === id)
    return i >= 0 ? String.fromCharCode(65 + i) : "—"
  }

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Answer Review</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {details.map((d, i) => {
            const speaker = speakers.find(s => s.id === d.question_id)
            const userLetter    = letterOf(d.answer_question_id)
            const correctLetter = letterOf(d.correct_answer_id)

            return (
              <div
                key={d.question_id}
                className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm">
                    {i + 1}
                  </span>
                  {d.correct
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <XCircle      className="w-4 h-4 text-error" />
                  }
                </div>

                <p className="text-[11px] text-on-surface-variant font-medium truncate">
                  {speaker?.text ?? `Speaker ${i + 1}`}
                </p>

                {d.correct ? (
                  <span className="text-[13px] font-black text-green-600">{userLetter}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-black text-error line-through opacity-70">
                      {userLetter}
                    </span>
                    {d.correct_answer_id && (
                      <span className="text-[13px] font-black text-green-600">{correctLetter}</span>
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

// ── Options Accordion ─────────────────────────────────────────────────────────
const OptionsAccordion = memo(function OptionsAccordion({
  options,
}: {
  options: ListeningPart3Set["answers"]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Options (A–{String.fromCharCode(64 + options.length)})
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">View all options</span>
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
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              {options.map((opt, i) => (
                <div key={opt.id} className="flex gap-3">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-xs text-on-surface leading-relaxed">{opt.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  result:   ListeningPart3EvaluateResponse
  set:      ListeningPart3Set
  speakers: ListeningPart3QuestionItem[]
  audioUrl: string | null
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart3Result({ result, set, speakers, audioUrl }: Props) {
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

      {/* Answer review */}
      <AnswerReview details={result.details} speakers={speakers} options={set.answers} />

      {/* Audio player */}
      {audioUrl && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: "layout style paint" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio
          </p>
          <ListeningAudioPlayer src={audioUrl} />
        </div>
      )}

      {/* Options accordion */}
      <OptionsAccordion options={set.answers} />
    </div>
  )
}
