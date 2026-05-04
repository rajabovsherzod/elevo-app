"use client"

import { useRef, useEffect, useState, memo } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "@/utils/cx"
import type {
  ListeningPart3EvaluateResponse,
  ListeningPart3QuestionsResponse,
} from "@/lib/api/listening"
import { ListeningAudioPlayer } from "@/components/elevo/listening/shared"
import { AnswerCard } from "@/components/elevo/shared/answer-card"

// ── Answer Review Grid ────────────────────────────────────────────────────────
const AnswerReview = memo(function AnswerReview({
  result,
  data,
}: {
  result: ListeningPart3EvaluateResponse
  data: ListeningPart3QuestionsResponse
}) {
  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Answer Review</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.speakers.map((speaker, i) => {
            const positionKey = String(speaker.position)
            const resultItem = result.results?.[positionKey]
            const isCorrect = resultItem?.is_correct ?? false
            const userAnswer = resultItem?.user_answer ?? ""
            const correctAnswer = resultItem?.correct_answer ?? ""

            return (
              <AnswerCard
                key={speaker.position}
                questionNumber={i + 1}
                isCorrect={isCorrect}
                userAnswer={userAnswer}
                correctAnswer={correctAnswer}
              />
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
  options: Array<{ letter: string; text: string }>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Answer Options (A–{options[options.length - 1]?.letter ?? "F"})
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
              {options.map((opt) => (
                <div key={opt.letter} className="flex gap-3">
                  <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                    {opt.letter}
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

// ── Speaker Matches Accordion ─────────────────────────────────────────────────
const SpeakerMatchesAccordion = memo(function SpeakerMatchesAccordion({
  result,
  data,
}: {
  result: ListeningPart3EvaluateResponse
  data: ListeningPart3QuestionsResponse
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
        <span className="text-sm font-bold text-on-surface">View speaker matches</span>
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
              {data.speakers.map((speaker, i) => {
                const positionKey = String(speaker.position)
                const resultItem = result.results?.[positionKey]
                const correctLetter = resultItem?.correct_answer ?? ""
                const correctOption = data.options.find(opt => opt.letter === correctLetter)

                return (
                  <div key={speaker.position} className="flex items-start gap-2">
                    {/* Position number */}
                    <span className="w-5 h-5 rounded text-[10px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {/* Speaker text */}
                    <span className="text-xs text-on-surface font-medium flex-shrink-0">
                      {speaker.text}
                    </span>
                    {/* Correct letter with green background */}
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-green-500 text-white flex-shrink-0">
                      {correctLetter}
                    </span>
                    {/* Option text */}
                    <span className="text-xs text-on-surface-variant leading-relaxed">
                      {correctOption?.text}
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  result:   ListeningPart3EvaluateResponse
  data:     ListeningPart3QuestionsResponse
  audioUrl: string | null
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart3Result({ result, data, audioUrl }: Props) {
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

      {/* Answer review */}
      <AnswerReview result={result} data={data} />

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
      <OptionsAccordion options={data.options} />

      {/* Speaker matches accordion */}
      <SpeakerMatchesAccordion result={result} data={data} />
    </div>
  )
}
