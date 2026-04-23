"use client"

import { useState, useCallback }  from "react"
import { Button }                  from "@/components/base/buttons/button"
import { PageHeaderWithBack }      from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }             from "@/components/elevo/shared/exam-loading"
import { ListeningPart1Mcq }       from "./listening-part1-mcq"
import { ListeningPart1Result }    from "./listening-part1-result"
import { useListeningPart1, type ListeningPhase } from "./use-listening-part1"

// ── Audio waveform indicator ───────────────────────────────────────────────────
function AudioBar({ isPlaying, label }: { isPlaying: boolean; label: string }) {
  const bars = [3, 5, 4, 7, 5, 3, 6, 4]
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant">
      <div className="flex items-end gap-[3px] h-5 flex-shrink-0">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-primary"
            style={{
              height: isPlaying ? `${h * 3}px` : "4px",
              transition: "height 0.2s ease",
              animation: isPlaying ? `pulse 0.9s ease-in-out ${i * 0.1}s infinite` : "none",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
    </div>
  )
}

// ── Floating hint pill ─────────────────────────────────────────────────────────
function HintPill({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-on-surface text-surface text-xs font-semibold shadow-lg transition-all duration-300 pointer-events-none whitespace-nowrap ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      Audio tugagandan keyin belgilay olasiz
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ListeningPart1Content() {
  const {
    phase,
    questions,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    error,
    totalAnswered,
    selectAnswer,
    submit,
  } = useListeningPart1()

  const [hintVisible, setHintVisible] = useState(false)

  const showHint = useCallback(() => {
    setHintVisible(true)
    setTimeout(() => setHintVisible(false), 2000)
  }, [])

  const instructionOnly = phase === "instruction"
  const canAnswer       = phase === "question-audio" || phase === "exam" || phase === "submitting"
  const canSubmit       = phase === "exam"

  // Loading
  if (phase === "loading") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Short Conversations" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ExamLoading />
        </div>
      </div>
    )
  }

  // Error - show even if questions loaded partially
  if (error) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Short Conversations" />
        <div className="elevo-card elevo-card-border p-8 text-center">
          <p className="text-error text-sm font-medium">{error}</p>
          <p className="text-on-surface-variant text-xs mt-2">Sahifani yangilab qayta urinib ko'ring</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sahifani yangilash
          </button>
        </div>
      </div>
    )
  }

  // Result
  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Results" />
        <ListeningPart1Result result={result} questions={questions} audioUrl={audioUrl} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <PageHeaderWithBack title="Part 1 — Short Conversations" />

      {/* Instructions */}
      <div className="elevo-card elevo-card-border px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
          Instructions
        </p>
        <p className="text-sm text-on-surface leading-relaxed">
          You will hear some sentences. You will hear each sentence twice.
          Choose the correct reply to each sentence (A, B or C).
        </p>
      </div>

      {/* Audio status bar */}
      {(phase === "instruction" || phase === "question-audio") && (
        <AudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Progress — exam phase */}
      {canAnswer && questions.length > 0 && (
        <div className="elevo-card elevo-card-border px-4 py-3 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {questions.length} ta savol
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {totalAnswered} / {questions.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <>
          {/* Instruction phase: invisible overlay captures taps and shows hint */}
          <div className="relative">
            <div className="flex flex-col gap-4">
              {questions.map((question, index) => (
                <ListeningPart1Mcq
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  selectedAnswerId={answers[question.id]}
                  onSelect={canAnswer ? selectAnswer : undefined}
                />
              ))}
            </div>

            {instructionOnly && (
              <div
                className="absolute inset-0 z-10 cursor-not-allowed"
                onClick={showHint}
              />
            )}
          </div>
        </>
      )}

      {/* Submit */}
      {(canSubmit || phase === "submitting") && questions.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isLoading={phase === "submitting"}
            isDisabled={phase === "submitting" || totalAnswered < questions.length}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}

      {/* Hint pill */}
      <HintPill visible={hintVisible} />
    </div>
  )
}
