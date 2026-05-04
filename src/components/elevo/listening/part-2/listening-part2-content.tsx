"use client"

import { Button }             from "@/components/base/buttons/button"

import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart2GapText }  from "./listening-part2-gap-text"
import { ListeningPart2Result }   from "./listening-part2-result"
import { useListeningPart2 }      from "./use-listening-part2"

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart2Content() {
  const {
    phase,
    data,
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

  if (phase === "submitting") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <CalculatingResults />
      </div>
    )
  }

  if (phase === "result" && result && data) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <ListeningPart2Result result={result} data={data} audioUrl={audioUrl} />
      </div>
    )
  }

  // inputs locked only during instruction — open as soon as audio starts playing
  const inputsLocked = false  // Never lock inputs - better UX
  const canSubmit    = phase === "exam" || phase === "instruction" || phase === "question-audio"  // Always show submit

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

      {/* Gap fill text — visible from instruction phase onward, never locked */}
      {data && (
        <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
          {data.title && (
            <h2 className="text-sm font-bold text-on-surface">{data.title}</h2>
          )}
          {data.instruction && (
            <p className="text-xs text-on-surface-variant">{data.instruction}</p>
          )}

          <div
            className="rounded-xl p-4 elevo-card-border"
            style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
          >
            <ListeningPart2GapText
              text={data.question ?? ""}
              positions={data.positions}
              answers={answers}
              onAnswerChange={setAnswer}
              disabled={inputsLocked}
              result={null}
            />
          </div>

          {/* Progress indicator — always show */}
          <ListeningProgressBar
            current={filledCount}
            total={data.positions.length}
            label="ta bo'shliq"
          />
        </div>
      )}

      {/* Submit - always visible */}
      {canSubmit && data && (
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
