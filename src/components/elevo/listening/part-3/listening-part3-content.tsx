"use client"

import { lazy, Suspense } from "react"
import { useMemo } from "react"
import { Button }             from "@/components/base/buttons/button"

import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart3SpeakerCard } from "./listening-part3-speaker-card"
import { useListeningPart3 }         from "./use-listening-part3"

const ListeningPart3Result = lazy(() =>
  import("./listening-part3-result").then((mod) => ({
    default: mod.ListeningPart3Result,
  }))
)

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart3Content() {
  const {
    phase,
    set,
    speakers,
    audioUrl,
    matches,
    result,
    isAudioPlaying,
    errorMsg,
    allMatched,
    selectMatch,
    submit,
    retry,
  } = useListeningPart3()

  const matchedCount = useMemo(() => 
    speakers.filter((s: any) => matches[s.id] !== undefined).length,
    [speakers, matches]
  )


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

  if (phase === "submitting") return (
    <div className="flex flex-col gap-5 pb-6">

      <CalculatingResults />
    </div>
  )

  if (phase === "result" && result && set) {
    return (
      <div className="flex flex-col gap-5 pb-6">

        <Suspense fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}>
          <ListeningPart3Result result={result} set={set} speakers={speakers} audioUrl={audioUrl} />
        </Suspense>
      </div>
    )
  }

  const isLocked  = phase === "instruction"
  const canSubmit = phase === "exam"


  return (
    <div className="flex flex-col gap-4 pb-6">


      {/* Instructions */}
      <ListeningInstruction
        text={set?.instruction ?? "You will hear five people speaking. Match each speaker to the correct statement (A–F). There is one extra statement you do not need."}
      />

      {/* Audio status */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Options legend — always visible once loaded */}
      {set && set.answers.length > 0 && (
        <div className="elevo-card elevo-card-border overflow-hidden">
          <div className="px-4 py-3 bg-surface-container/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Options A–{String.fromCharCode(64 + set.answers.length)}
            </p>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {set.answers.map((opt: any, i: number) => (
              <div key={opt.id} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + i)}
                </span>
                <p className="text-xs text-on-surface leading-relaxed">{opt.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speaker cards */}
      {set && speakers.length > 0 && (
        <>
          {/* Progress */}
          {!isLocked && (
            <ListeningProgressBar
              current={matchedCount}
              total={speakers.length}
              label="ta speaker"
            />
          )}

          <div className="flex flex-col gap-3">
            {speakers.map((speaker: any, i: number) => (
              <ListeningPart3SpeakerCard
                key={speaker.id}
                speaker={speaker}
                speakerIndex={i}
                options={set.answers}
                selectedAnswerId={matches[speaker.id]}
                onSelect={selectMatch}
                isLocked={isLocked}
                result={result}
              />
            ))}
          </div>
        </>
      )}

      {/* Submit */}
      {canSubmit && speakers.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isDisabled={!allMatched}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
