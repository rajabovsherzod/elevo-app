"use client"

import { useRef, useEffect, useState, memo } from "react"
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"
import type {
  ListeningPart4EvaluateResponse,
  ListeningPart4Set,
} from "@/lib/api/listening"

// ── Answer review ─────────────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  details,
  set,
  userLetters,
}: {
  details: ListeningPart4EvaluateResponse["details"]
  set: ListeningPart4Set
  userLetters: Record<number, string>
}) {
  const fieldLetterById = Object.fromEntries(set.questions.map(q => [q.id, q.text.toUpperCase()]))
  const placeById       = Object.fromEntries(set.answers.map(p => [p.id, p.text]))

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Answer Review</p>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        {details.map((d, i) => {
          const placeName   = placeById[d.question_id] ?? `Place ${i + 1}`
          const userLetter  = fieldLetterById[d.answer_question_id] ?? (userLetters[d.question_id] ?? "—")

          return (
            <div
              key={d.question_id}
              className={cx(
                "flex items-center gap-3 p-3 rounded-xl border",
                d.correct
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-error/30 bg-error/5"
              )}
            >
              {/* Number */}
              <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-white">{i + 1}</span>
              </div>

              {/* Place name */}
              <p className="flex-1 text-xs font-semibold text-on-surface truncate">{placeName}</p>

              {/* User answer */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {d.correct ? (
                  <>
                    <span className="w-7 h-7 rounded-lg border-2 border-green-500 bg-green-500/10 flex items-center justify-center text-sm font-black text-green-600">
                      {userLetter}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <span className="w-7 h-7 rounded-lg border-2 border-error/60 bg-error/5 flex items-center justify-center text-sm font-black text-error line-through opacity-70">
                      {userLetter}
                    </span>
                    <XCircle className="w-4 h-4 text-error flex-shrink-0" />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

// ── Map + places accordion ────────────────────────────────────────────────────
const MapAccordion = memo(function MapAccordion({
  set,
}: {
  set: ListeningPart4Set
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Map & Places</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">View map & places</span>
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
            <div className="px-4 pb-5 pt-1 flex flex-col gap-4">
              {set.image_url && (
                <img
                  src={set.image_url}
                  alt="Map"
                  loading="eager"
                  decoding="async"
                  className="w-full rounded-md border border-outline-variant object-contain max-h-64"
                />
              )}
              <div className="flex flex-col gap-2">
                {set.answers.map((place, i) => (
                  <div key={place.id} className="flex gap-3 items-center">
                    <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">{place.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── Props / Main ──────────────────────────────────────────────────────────────
interface Props {
  result:      ListeningPart4EvaluateResponse
  set:         ListeningPart4Set
  audioUrl:    string | null
  imageUrl:    string | null
  userLetters: Record<number, string>
}

export function ListeningPart4Result({ result, set, audioUrl, imageUrl, userLetters }: Props) {
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
      <AnswerReview details={result.details} set={set} userLetters={userLetters} />

      {/* Audio */}
      {audioUrl && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: "layout style paint" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio
          </p>
          <ListeningAudioPlayer src={audioUrl} />
        </div>
      )}

      {/* Map accordion */}
      <MapAccordion set={set} />
    </div>
  )
}
