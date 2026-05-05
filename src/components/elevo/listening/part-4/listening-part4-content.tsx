"use client"

import { Button } from "@/components/base/buttons/button"
import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart4PlaceCard } from "./listening-part4-place-card"
import { ListeningPart4Result } from "./listening-part4-result"
import { useListeningPart4 } from "./use-listening-part4"

// ── Main ──────────────────────────────────────────────────────────────────────
export function ListeningPart4Content({ examId }: { examId: number }) {
  const {
    phase,
    question,
    error,
    answers,
    result,
    filledCount,
    isAudioPlaying,
    setAnswer,
    handleSubmit,
    getAvailableLetters,
    retry,
  } = useListeningPart4(examId)

  if (phase === "loading") {
    return <ListeningLoading title="Part 4 — Map Matching" />
  }

  if (phase === "error" || error) {
    return (
      <ListeningError
        title="Part 4 — Map Matching"
        message={error ?? "Xatolik yuz berdi"}
        onRetry={retry}
      />
    )
  }

  if (phase === "calculating") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <CalculatingResults />
      </div>
    )
  }

  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <ListeningPart4Result result={result} />
      </div>
    )
  }

  if (!question) {
    return (
      <ListeningError
        title="Part 4 — Map Matching"
        message="No questions available"
        onRetry={retry}
      />
    )
  }

  const availableLetters = getAvailableLetters()
  const totalPlaces = question.places.length
  const canSubmit = phase === "exam" || phase === "instruction" || phase === "question-audio"

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* Instruction text */}
      <ListeningInstruction
        text={question.instruction ?? "You will hear someone giving a talk. Label the places (1–5) on the map (A–H). There are THREE extra options which you do not need to use."}
      />

      {/* Audio playback status bar */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions audio" : "Question audio"}
        />
      )}

      {/* Map image */}
      {question.map_image_url && (
        <div className="elevo-card elevo-card-border overflow-hidden">
          <div className="px-4 py-3 bg-surface-container/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Map
            </p>
          </div>
          <div className="p-3">
            <img
              src={question.map_image_url}
              alt="Map"
              loading="eager"
              decoding="async"
              className="w-full rounded-lg object-contain max-h-72 border border-outline-variant"
            />
          </div>
        </div>
      )}

      {/* Available letters legend */}
      {availableLetters.length > 0 && (
        <div className="elevo-card elevo-card-border overflow-hidden">
          <div className="px-4 py-3 bg-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              Available Options ({availableLetters.join(", ")})
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs text-on-surface-variant">
              Select the correct letter for each place below
            </p>
          </div>
        </div>
      )}

      {/* Progress + place cards */}
      {totalPlaces > 0 && (
        <>
          <ListeningProgressBar
            current={filledCount}
            total={totalPlaces}
            label="ta place"
          />

          <div className="flex flex-col gap-3">
            {question.places.map((place: { position: number; text: string }) => (
              <ListeningPart4PlaceCard
                key={place.position}
                position={place.position}
                text={place.text}
                selectedLetter={answers[place.position]}
                availableLetters={availableLetters}
                onSelect={setAnswer}
              />
            ))}
          </div>
        </>
      )}

      {/* Submit button */}
      {canSubmit && totalPlaces > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isDisabled={filledCount < totalPlaces}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
