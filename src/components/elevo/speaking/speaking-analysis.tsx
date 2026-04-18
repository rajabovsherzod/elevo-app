"use client"

import { useState, useEffect, useRef } from "react"
import {
  CheckCircle2, ChevronRight, TrendingUp,
  BookOpen, Layers, Volume2, Zap, Clock, Hash, Wind, FileText,
} from "lucide-react"
import type { SpeakingEvaluateResponseSchema } from "@/schemas/speaking.schema"

interface SpeakingAnalysisProps {
  results: SpeakingEvaluateResponseSchema[]
  onFinish: () => void
}

/* ── CEFR — faqat ring va badge uchun rang ────────────────────── */
const CEFR_COLOR: Record<string, string> = {
  "Below B1": "#f43f5e",
  B1:         "#f59e0b",
  B2:         "#6366f1",
  C1:         "#10b981",
}
const getCefrColor = (key: string) => CEFR_COLOR[key] ?? "#6366f1"

/* ── Score Ring ───────────────────────────────────────────────── */
const RING_R    = 52
const RING_CIRC = 2 * Math.PI * RING_R

function ScoreRing({ score, max, color }: { score: number; max: number; color: string }) {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return

    // Force browser to paint initial state (empty ring) before transition
    el.style.transition = "none"
    el.style.strokeDashoffset = String(RING_CIRC)
    // getBoundingClientRect forces a reflow so the initial state is committed
    el.getBoundingClientRect()
    // Now enable transition and animate to target
    el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)"
    el.style.strokeDashoffset = String(RING_CIRC * (1 - score / max))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60" cy="60" r={RING_R}
          fill="none" stroke="currentColor" strokeWidth="7"
          className="text-surface-container-high"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx="60" cy="60" r={RING_R}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={RING_CIRC}
        />
      </svg>
      <div className="flex flex-col items-center z-10 select-none">
        <span className="text-3xl font-black text-on-surface">{score}</span>
        <span className="text-[11px] font-semibold text-on-surface-variant">/ {max}</span>
      </div>
    </div>
  )
}

/* ── Skill Bar — hammasi primary rang ────────────────────────── */
function SkillBar({ label, icon: Icon, value, max = 8 }: {
  label: string; icon: React.ElementType; value: number; max?: number
}) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return

    el.style.transition = "none"
    el.style.width = "0%"
    el.getBoundingClientRect()
    el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)"
    el.style.width = `${(value / max) * 100}%`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/15">
        <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-on-surface">{label}</span>
          <span className="text-[13px] font-black text-primary tabular-nums">
            {value}<span className="text-on-surface-variant font-medium text-[11px]">/{max}</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
          <div
            ref={barRef}
            className="h-full rounded-full bg-primary"
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Feedback Card ───────────────────────────────────────────── */
function FeedbackCard({ title, uz, en, borderColor, icon: Icon }: {
  title: string; uz: string; en: string; borderColor: string; icon: React.ElementType
}) {
  const [lang, setLang] = useState<"uz" | "en">("uz")
  const text = lang === "uz" ? uz || en : en || uz

  return (
    <div
      className="elevo-card elevo-card-border p-4"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: borderColor }} strokeWidth={2.5} />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: borderColor }}>
            {title}
          </span>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-outline-variant/40">
          {(["uz", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase transition-colors ${
                lang === l
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[13px] text-on-surface leading-relaxed">{text}</p>
    </div>
  )
}

/* ── Stat Chip ───────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="elevo-card elevo-card-border px-4 py-3 flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-on-surface-variant shrink-0" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant truncate">{label}</p>
        <p className="text-[15px] font-black text-on-surface">{value}</p>
      </div>
    </div>
  )
}

/* ── Transcript Card ─────────────────────────────────────────── */
function TranscriptCard({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 200

  return (
    <div className="elevo-card elevo-card-border p-4" style={{ borderLeft: "3px solid #6366f1" }}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" strokeWidth={2.5} />
        <span className="text-[11px] font-black uppercase tracking-widest text-primary">
          Sizning javobingiz
        </span>
      </div>
      <p className="text-[13px] text-on-surface leading-relaxed">
        {isLong && !expanded ? `${text.slice(0, 200)}…` : text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[11px] font-bold text-primary"
        >
          {expanded ? "Yig'ish" : "To'liq ko'rish"}
        </button>
      )}
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export function SpeakingAnalysis({ results, onFinish }: SpeakingAnalysisProps) {
  const [activeTab, setActiveTab] = useState(0)

  if (!results.length) return null

  const current = results[activeTab]
  const r = current.result
  const m = current.metrics
  const cefrColor = getCefrColor(r.cefr)
  const transcript = current.transcript

  const verdict =
    r.total_32 >= 24 ? "Ajoyib natija!" :
    r.total_32 >= 16 ? "Yaxshi natija"  :
    "Ko'proq mashq kerak"

  const skills = [
    { label: "Ravonlik",   icon: Wind,     value: r.fluency       },
    { label: "Lug'at",     icon: BookOpen, value: r.vocabulary    },
    { label: "Grammatika", icon: Layers,   value: r.grammar       },
    { label: "Talaffuz",   icon: Volume2,  value: r.pronunciation },
  ]

  const speedVal    = m.speaking_speed_wpm ? `${Math.round(m.speaking_speed_wpm)} so'm/min` : "—"
  const durationVal = m.duration_seconds   ? `${Math.round(m.duration_seconds)}s`           : "—"

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in pb-8">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-6 flex flex-col items-center text-center gap-4">
        {/* CEFR badge */}
        <span
          className="text-[11px] font-black uppercase tracking-[0.18em] px-4 py-1.5 rounded-full"
          style={{
            color: cefrColor,
            background: `${cefrColor}14`,
            border: `1px solid ${cefrColor}35`,
          }}
        >
          {r.cefr} Darajasi
        </span>

        <ScoreRing score={r.total_32} max={32} color={cefrColor} />

        <div>
          <p className="text-sm text-on-surface-variant">Umumiy ball (32 dan)</p>
          <p className="text-xs text-on-surface-variant/50 mt-0.5">{verdict}</p>
        </div>
      </div>

      {/* ── Question Tabs ─────────────────────────────────────── */}
      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {results.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                activeTab === idx
                  ? "bg-primary text-on-primary"
                  : "elevo-card text-on-surface-variant"
              }`}
            >
              Savol {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* ── Transcript ───────────────────────────────────────── */}
      {transcript && <TranscriptCard text={transcript} />}

      {/* ── Skills ───────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Ko'nikmalar
        </p>
        {skills.map((s) => (
          <SkillBar key={s.label} {...s} />
        ))}
      </div>

      {/* ── Metrics ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatChip icon={Hash}       label="So'z soni"      value={String(m.word_count)} />
        <StatChip icon={Zap}        label="Nutq tezligi"   value={speedVal} />
        <StatChip icon={Clock}      label="Davomiyligi"    value={durationVal} />
        <StatChip icon={TrendingUp} label="To'ldirgichlar" value={`${(m.filler_ratio * 100).toFixed(1)}%`} />
      </div>

      {/* ── Feedback ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Baho va tavsiyalar
        </p>
        <FeedbackCard
          title="Yutuqlar"
          uz={r.feedback.strengths.uz}
          en={r.feedback.strengths.en}
          borderColor="#10b981"
          icon={CheckCircle2}
        />
        <FeedbackCard
          title="Kamchiliklar"
          uz={r.feedback.weaknesses.uz}
          en={r.feedback.weaknesses.en}
          borderColor="#f43f5e"
          icon={TrendingUp}
        />
        <FeedbackCard
          title="Maslahatlar"
          uz={r.feedback.improvements.uz}
          en={r.feedback.improvements.en}
          borderColor="#6366f1"
          icon={Zap}
        />
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <button
        onClick={onFinish}
        className="elevo-btn-primary w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
      >
        Speaking bo'limiga qaytish
        <ChevronRight className="w-5 h-5" />
      </button>

    </div>
  )
}
