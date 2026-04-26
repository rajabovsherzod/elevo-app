"use client"

import { lazy, Suspense } from "react"
import { Button }             from "@/components/base/buttons/button"

import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart2GapText }  from "./listening-part2-gap-text"
import { useListeningPart2 }      from "./use-listening-part2"

const ListeningPart2Result = lazy(() =>
  import("./listening-part2-result").then((mod) => ({
    default: mod.ListeningPart2Result,
  }))
)

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart2Content() {
  const {
    phase,
    question,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    allFilled,
    filledCount,
    setAnswer,
    submit,
    retry,
  } = useListeningPart2()

  if (phase === "loading") {
    return <ListeningLoading title="Part 2 — Gap Filling" />
  }

  if (phase === "error") {
    return (
      <ListeningError
        title="Part 2 — Gap Filling"
        message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
        onRetry={retry}
      />
    )
  }

  if (phase === "submitting") return (
    <div className="flex flex-col gap-5 pb-6">

      <CalculatingResults />
    </div>
  )

  if (phase === "result" && result && question) {
    return (
      <div className="flex flex-col gap-5 pb-6">

        <Suspense fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}>
          <ListeningPart2Result result={result} question={question} audioUrl={audioUrl} />
        </Suspense>
      </div>
    )
  }

  // inputs locked only during instruction — open as soon as audio starts playing
  const inputsLocked = phase === "instruction"
  const canSubmit    = phase === "exam"

  return (
    <div className="flex flex-col gap-4 pb-6">


      {/* Instructions */}
      <ListeningInstruction text="You will hear a recording. Listen carefully and fill in the gaps with the missing words or phrases." />

      {/* Audio status */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Gap fill text — visible from instruction phase onward, locked until exam */}
      {question && (
        <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
          {question.title && (
            <h2 className="text-sm font-bold text-on-surface">{question.title}</h2>
          )}
          {question.instruction && (
            <p className="text-xs text-on-surface-variant">{question.instruction}</p>
          )}

          <div
            className="rounded-xl p-4 elevo-card-border"
            style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
          >
            <ListeningPart2GapText
              text={question.text ?? ""}
              positions={question.positions}
              answers={answers}
              onAnswerChange={setAnswer}
              disabled={inputsLocked}
              result={null}
            />
          </div>

          {/* Progress indicator — only during answer phase */}
          {!inputsLocked && (
            <ListeningProgressBar
              current={filledCount}
              total={question.positions.length}
              label="ta bo'shliq"
            />
          )}
        </div>
      )}

      {/* Submit */}
      {canSubmit && question && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isDisabled={!allFilled}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
