"use client"

import { Button } from "@/components/base/buttons/button"

import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart3SpeakerCard } from "./listening-part3-speaker-card"
import { ListeningPart3Result } from "./listening-part3-result"
import { useListeningPart3 } from "./use-listening-part3"

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart3Content() {
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
    selectAnswer,
    submit,
    retry,
  } = useListeningPart3()

  if (phase === "loading") {
    return <ListeningLoading title="Part 3 — Speaker Matching" />
  }

  if (phase === "error") {
    return (
      <ListeningError
        title="Part 3 — Speaker Matching"
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
        <ListeningPart3Result result={result} data={data} audioUrl={audioUrl} />
      </div>
    )
  }

  const isLocked  = false  // Never lock - user can select anytime
  const canSubmit = phase === "exam" || phase === "instruction" || phase === "question-audio"  // Submit always visible

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Instructions */}
      <ListeningInstruction
        text={data?.instruction ?? "You will hear five people speaking. Match each speaker to the correct statement (A–F). There is one extra statement you do not need."}
      />

      {/* Audio status */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Options card — always visible once loaded */}
      {data && data.options.length > 0 && (
        <div className="elevo-card elevo-card-border overflow-hidden">
          <div className="px-4 py-3 bg-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              Options (A–{data.options[data.options.length - 1]?.letter ?? "F"})
            </p>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {data.options.map((opt) => (
              <div key={opt.letter} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                  {opt.letter}
                </span>
                <p className="text-xs text-on-surface leading-relaxed">{opt.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speaker cards */}
      {data && data.speakers.length > 0 && (
        <>
          {/* Progress */}
          <ListeningProgressBar
            current={filledCount}
            total={data.speakers.length}
            label="ta speaker"
          />

          <div className="flex flex-col gap-3">
            {data.speakers.map((speaker, i) => (
              <ListeningPart3SpeakerCard
                key={speaker.position}
                speaker={speaker}
                speakerIndex={i}
                options={data.options}
                selectedLetter={answers[String(speaker.position)]}
                onSelect={selectAnswer}
                isLocked={isLocked}
                result={result}
              />
            ))}
          </div>
        </>
      )}

      {/* Submit - always visible when data loaded */}
      {canSubmit && data && data.speakers.length > 0 && (
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
