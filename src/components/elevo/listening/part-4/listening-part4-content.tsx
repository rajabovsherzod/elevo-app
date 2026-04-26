"use client"

import { lazy, Suspense } from "react"
import { Button }             from "@/components/base/buttons/button"

import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart4PlaceInput } from "./listening-part4-place-input"
import { useListeningPart4 }        from "./use-listening-part4"


const ListeningPart4Result = lazy(() =>
  import("./listening-part4-result").then((mod) => ({
    default: mod.ListeningPart4Result,
  }))
)

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart4Content() {
  const {
    phase,
    set,
    audioUrl,
    imageUrl,
    userLetters,
    result,
    isAudioPlaying,
    errorMsg,
    filledCount,
    allFilled,
    setLetter,
    submit,
    retry,
  } = useListeningPart4()

  if (phase === "loading") {
    return <ListeningLoading title="Part 4 — Map Matching" />
  }

  if (phase === "error") {
    return (
      <ListeningError
        title="Part 4 — Map Matching"
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
          <ListeningPart4Result
            result={result}
            set={set}
            audioUrl={audioUrl}
            imageUrl={imageUrl}
            userLetters={userLetters}
          />
        </Suspense>
      </div>
    )
  }

  const isLocked     = phase === "instruction"
  const canSubmit    = phase === "exam"
  const totalPlaces  = set?.answers.length ?? 0

  return (
    <div className="flex flex-col gap-4 pb-6">


      {/* Instruction */}
      <ListeningInstruction
        text={set?.instruction ?? "You will hear someone describing a map. Match each place (1–5) to the correct letter (A–H) shown on the map."}
      />

      {/* Audio status */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Map image */}
      {(imageUrl || set?.image_url) && (
        <div className="elevo-card elevo-card-border overflow-hidden">
          <div className="px-4 py-3 bg-surface-container/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Map
            </p>
          </div>
          <div className="p-3">
            <img
              src={imageUrl ?? set?.image_url ?? ""}
              alt="Map"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full rounded-lg object-contain max-h-72 border border-outline-variant"
            />
          </div>
        </div>
      )}

      {/* Places + inputs */}
      {set && set.answers.length > 0 && (
        <>
          {/* Capital letter hint */}
          <div className="elevo-card elevo-card-border px-4 py-3">
            <p className="text-[11px] font-medium text-on-surface-variant">
              Write the letter that matches each place on the map.{" "}
              <span className="font-black text-on-surface tracking-wide">WRITE IN CAPITAL LETTERS.</span>
            </p>
          </div>

          {/* Progress */}
          {!isLocked && (
            <ListeningProgressBar
              current={filledCount}
              total={totalPlaces}
              label="places"
            />
          )}

          {/* Place input cards */}
          <div className="flex flex-col gap-2.5">
            {set.answers.map((place: any, i: number) => (
              <ListeningPart4PlaceInput
                key={place.id}
                place={place}
                placeIndex={i}
                fields={set.questions}
                letter={userLetters[place.id] ?? ""}
                onChange={setLetter}
                isLocked={isLocked}
              />
            ))}
          </div>

          {/* Field letters reference */}
          {!isLocked && set.questions.length > 0 && (
            <div className="elevo-card elevo-card-border px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
                Available letters on map
              </p>
              <div className="flex gap-2 flex-wrap">
                {set.questions.map((q: any) => (
                  <span
                    key={q.id}
                    className="w-7 h-7 rounded-md text-xs font-black flex items-center justify-center bg-surface-container border border-outline-variant text-on-surface"
                  >
                    {q.text.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit */}
      {canSubmit && totalPlaces > 0 && (
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
