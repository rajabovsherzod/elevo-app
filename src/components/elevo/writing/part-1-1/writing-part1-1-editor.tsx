"use client"

import { memo, useEffect, useRef, useState } from "react"
import { cx } from "@/utils/cx"
import { Button } from "@/components/base/buttons/button"
import { MIN_WORDS } from "./use-writing-part1-1"
import type { WritingTaskResponse } from "@/lib/api/writing"

interface WritingEditorProps {
  task: WritingTaskResponse
  text: string
  wordCount: number
  canSubmit: boolean
  isLocked: boolean
  onTextChange: (value: string) => void
  onSubmit: () => void
}

export const WritingPart1_1Editor = memo(function WritingPart1_1Editor({
  task,
  text,
  wordCount,
  canSubmit,
  isLocked,
  onTextChange,
  onSubmit,
}: WritingEditorProps) {
  const remaining = MIN_WORDS - wordCount
  const hasEnough = wordCount >= MIN_WORDS

  // Push content above virtual keyboard on mobile
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const submitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return
    const vv = window.visualViewport

    const update = () => {
      const kbH = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardOffset(Math.max(0, kbH))
    }

    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  const handleFocus = () => {
    setTimeout(() => {
      submitRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 350)
  }

  return (
    <div
      className="flex flex-col gap-4 animate-fade-in"
      style={{ paddingBottom: keyboardOffset }}
    >

      {/* ── Task card ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Task 1.1 · Informal Letter
          </p>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm font-bold text-on-surface leading-snug">{task.title}</p>
          <div className="rounded-xl p-4 bg-surface-container">
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
              {task.instruction}
            </p>
          </div>
        </div>
      </div>

      {/* ── Answer card ───────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border overflow-hidden">
        <div className="px-4 py-3 bg-primary/10 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Your Answer
          </p>
          <WordBadge wordCount={wordCount} minWords={MIN_WORDS} />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="rounded-xl bg-surface-container overflow-hidden">
            <textarea
              value={text}
              onChange={e => onTextChange(e.target.value)}
              onFocus={handleFocus}
              disabled={isLocked}
              placeholder="Start writing your answer here..."
              className={cx(
                "w-full min-h-[260px] p-4 text-sm text-on-surface leading-relaxed",
                "bg-transparent resize-none outline-none",
                "placeholder:text-on-surface-variant/40",
                "caret-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              spellCheck
            />
          </div>

          {/* Progress hint + submit */}
          <div ref={submitRef} className="flex items-center justify-between gap-3">
            <p className={cx(
              "text-xs transition-colors",
              hasEnough ? "text-success font-semibold" : "text-on-surface-variant",
            )}>
              {hasEnough
                ? `${wordCount} words — ready to submit`
                : `${remaining} more word${remaining !== 1 ? "s" : ""} needed`}
            </p>

            <Button
              size="md"
              color="primary"
              isDisabled={!canSubmit || isLocked}
              onClick={onSubmit}
            >
              Submit Answer
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
})

// ── Word badge ────────────────────────────────────────────────────────────────

const WordBadge = memo(function WordBadge({
  wordCount,
  minWords,
}: {
  wordCount: number
  minWords: number
}) {
  const hasEnough = wordCount >= minWords
  return (
    <div className={cx(
      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors",
      hasEnough
        ? "bg-success/10 text-success"
        : "bg-surface-container text-on-surface-variant",
    )}>
      <span>{wordCount}</span>
      <span className="opacity-40">/</span>
      <span>{minWords}+</span>
    </div>
  )
})
