"use client"

import { useRef, useEffect, useState, memo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type { ListeningPart4EvaluateResponseSimple } from "@/lib/api/listening"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"
import { AnswerCard } from "@/components/elevo/shared/answer-card"

interface Props {
  result: ListeningPart4EvaluateResponseSimple
}

// Same URL fix as the hook — strips production domain and uses local API base
const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function fixUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    return API_BASE() + new URL(raw).pathname
  } catch {
    return raw
  }
}

// ── Answer Review ─────────────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  results,
}: {
  results: ListeningPart4EvaluateResponseSimple["results"]
}) {
  const positions = Object.keys(results).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Review
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {positions.map(pos => {
            const item = results[pos]
            return (
              <AnswerCard
                key={pos}
                questionNumber={Number(pos)}
                isCorrect={item.is_correct}
                userAnswer={item.user_answer}
                correctAnswer={item.correct_answer}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
})

// ── Places Accordion ──────────────────────────────────────────────────────────
const PlacesAccordion = memo(function PlacesAccordion({
  places,
  results,
}: {
  places: Array<{ position: number; text: string }>
  results: ListeningPart4EvaluateResponseSimple["results"]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Correct Matches
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container/40 transition-colors"
      >
        <span className="text-sm font-bold text-on-surface">View place matches</span>
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
            <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5">
              {places.map(place => {
                const item = results[String(place.position)]
                const correct = item?.correct_answer ?? "—"
                return (
                  <div key={place.position} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0">
                      {place.position}
                    </span>
                    <span className="flex-1 text-xs font-medium text-on-surface">
                      {place.text}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-green-500 text-white flex-shrink-0">
                      {correct}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart4Result({ result }: Props) {
  const places = result.places ?? []
  const barRef       = useRef<HTMLDivElement>(null)
  const scorePercent = Math.round(result.summary.score_percent)
  const isGood       = scorePercent >= 70

  const mapUrl   = fixUrl(result.question.map_image_url)
  const audioUrl = fixUrl(result.question.audio_url)

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

      {/* Map image */}
      {mapUrl && (
        <div className="elevo-card elevo-card-border overflow-hidden">
          <div className="px-4 py-3 bg-surface-container/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Map
            </p>
          </div>
          <div className="p-3">
            <img
              src={mapUrl}
              alt="Map"
              loading="eager"
              decoding="async"
              className="w-full rounded-lg object-contain max-h-72 border border-outline-variant"
            />
          </div>
        </div>
      )}

      {/* Answer review */}
      <AnswerReview results={result.results} />

      {/* Places accordion */}
      {places.length > 0 && (
        <PlacesAccordion places={places} results={result.results} />
      )}

      {/* Audio player — last */}
      {audioUrl && (
        <div className="elevo-card elevo-card-border p-4" style={{ contain: "layout style paint" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            Exam Audio
          </p>
          <ListeningAudioPlayer src={audioUrl} />
        </div>
      )}

    </div>
  )
}
