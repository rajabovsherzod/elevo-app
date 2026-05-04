"use client"

import { memo, useState } from "react"
import { motion } from "framer-motion"
import { cx } from "@/utils/cx"
import { Button } from "@/components/base/buttons/button"
import type { WritingEvaluateResponse, WritingResult, WritingCefr } from "@/lib/api/writing"

const CEFR_CONFIG: Record<WritingCefr, { label: string; color: string; bg: string }> = {
  C1:        { label: "C1",        color: "text-emerald-600", bg: "bg-emerald-500/10" },
  B2:        { label: "B2",        color: "text-indigo-600",  bg: "bg-indigo-500/10"  },
  B1:        { label: "B1",        color: "text-amber-600",   bg: "bg-amber-500/10"   },
  B1_Below:  { label: "Below B1",  color: "text-rose-600",    bg: "bg-rose-500/10"    },
}

const CRITERIA = [
  { key: "task_achievement" as const, label: "Task Achievement", max: 12 },
  { key: "coherence"        as const, label: "Coherence & Cohesion", max: 8 },
  { key: "vocabulary"       as const, label: "Vocabulary", max: 8 },
  { key: "grammar"          as const, label: "Grammar Accuracy", max: 8 },
]

interface WritingPart1_1ResultProps {
  response: WritingEvaluateResponse
  onRetry: () => void
}

export function WritingPart1_1Result({ response, onRetry }: WritingPart1_1ResultProps) {
  const { result } = response
  const cefr = CEFR_CONFIG[result.cefr] ?? CEFR_CONFIG.B1_Below

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* Score header */}
      <ScoreHeader result={result} cefrConfig={cefr} />

      {/* Off-topic warning */}
      {result.is_off_topic && (
        <div className="elevo-card elevo-card-border p-4 border-error/30 bg-error/5">
          <p className="text-sm font-bold text-error mb-1">Topic dan tashqari</p>
          <p className="text-xs text-on-surface-variant">
            Javobingiz berilgan topshiriq mavzusiga mos kelmadi. Barcha ball 0 qilib qo'yildi.
          </p>
        </div>
      )}

      {/* Criteria breakdown */}
      <CriteriaCard result={result} />

      {/* Feedback */}
      <FeedbackCard result={result} />

      {/* Retry */}
      <div className="flex justify-center pt-2">
        <Button size="md" color="secondary" onClick={onRetry}>
          Qayta yozish
        </Button>
      </div>
    </div>
  )
}

// ── Score Header ──────────────────────────────────────────────────────────────

const ScoreHeader = memo(function ScoreHeader({
  result,
  cefrConfig,
}: {
  result: WritingResult
  cefrConfig: (typeof CEFR_CONFIG)[WritingCefr]
}) {
  const pct = Math.round((result.total_36 / 36) * 100)

  return (
    <div className="elevo-card elevo-card-border p-5 flex flex-col gap-5">
      {/* Score row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Writing Score
          </p>
          <p className="text-4xl font-black text-on-surface leading-none">
            {result.total_36}
            <span className="text-xl font-bold text-on-surface-variant">/36</span>
          </p>
          {result.total_75 != null && (
            <p className="text-xs text-on-surface-variant mt-1">
              ≈ {result.total_75} / 75 scaled
            </p>
          )}
        </div>

        <div
          className={cx("px-5 py-3 rounded-2xl text-center", cefrConfig.bg)}
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
            CEFR Level
          </p>
          <p className={cx("text-3xl font-black leading-none", cefrConfig.color)}>
            {cefrConfig.label}
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div className="flex flex-col gap-2">
        <div className="h-2 rounded-full bg-surface-container overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-on-surface-variant">0</p>
          <p className="text-[11px] font-semibold text-on-surface-variant">{pct}%</p>
          <p className="text-[11px] text-on-surface-variant">36</p>
        </div>
      </div>
    </div>
  )
})

// ── Criteria Breakdown ────────────────────────────────────────────────────────

const CriteriaCard = memo(function CriteriaCard({ result }: { result: WritingResult }) {
  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Detailed Scores
        </p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {CRITERIA.map(({ key, label, max }) => {
          const score = result[key]
          const pct = Math.round((score / max) * 100)
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-on-surface">{label}</p>
                <p className="text-xs font-black text-on-surface">
                  {score}
                  <span className="font-normal text-on-surface-variant">/{max}</span>
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

// ── Feedback ──────────────────────────────────────────────────────────────────

type FeedbackKey = "strengths" | "weaknesses" | "improvements"

const FEEDBACK_SECTIONS: Array<{ key: FeedbackKey; label: string; color: string; dot: string }> = [
  { key: "strengths",    label: "Strengths",    color: "text-emerald-600", dot: "bg-emerald-500" },
  { key: "weaknesses",   label: "Weaknesses",   color: "text-red-500",     dot: "bg-red-500"     },
  { key: "improvements", label: "Improvements", color: "text-indigo-500",  dot: "bg-indigo-500"  },
]

const FeedbackCard = memo(function FeedbackCard({ result }: { result: WritingResult }) {
  const [lang, setLang] = useState<"en" | "uz">("en")

  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <div className="px-4 py-3 bg-primary/10 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          AI Feedback
        </p>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      <div className="p-4 flex flex-col gap-3">
        {FEEDBACK_SECTIONS.map(({ key, label, color, dot }) => (
          <div key={key} className="rounded-xl p-4 bg-surface-container flex flex-col gap-2">
            <div className="flex flex-row items-center justify-start gap-2">
              <span className={cx("w-2 h-2 rounded-full shrink-0", dot)} />
              <p className={cx("text-xs font-bold leading-none", color)}>{label}</p>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {result.feedback[key][lang]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})

const LangToggle = memo(function LangToggle({
  lang,
  onChange,
}: {
  lang: "en" | "uz"
  onChange: (l: "en" | "uz") => void
}) {
  return (
    <div className="flex items-center bg-surface-container rounded-full p-0.5 gap-0.5">
      {(["en", "uz"] as const).map(l => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={cx(
            "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors",
            lang === l
              ? "bg-primary text-white"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
})
