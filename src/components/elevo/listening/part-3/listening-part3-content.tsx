"use client"

import { Button }             from "@/components/base/buttons/button"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }        from "@/components/elevo/shared/exam-loading"
import { ListeningAudioBar, ListeningInstruction } from "@/components/elevo/listening/shared"
import { ListeningPart3SpeakerCard } from "./listening-part3-speaker-card"
import { ListeningPart3Result }      from "./listening-part3-result"
import { useListeningPart3 }         from "./use-listening-part3"

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingBlock() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 3 — Speaker Matching" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamLoading />
      </div>
    </div>
  )
}

// ── Error ─────────────────────────────────────────────────────────────────────
function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 3 — Speaker Matching" />
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
          <span className="text-error text-xl">!</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface mb-1">Yuklashda xatolik</p>
          <p className="text-xs text-on-surface-variant">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" color="secondary" onClick={() => window.location.reload()}>
            Sahifani yangilash
          </Button>
          <Button size="sm" color="primary" onClick={onRetry}>
            Qayta urinish
          </Button>
        </div>
      </div>
    </div>
  )
}

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

  if (phase === "loading") return <LoadingBlock />

  if (phase === "error") {
    return (
      <ErrorBlock
        message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
        onRetry={retry}
      />
    )
  }

  if (phase === "result" && result && set) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 3 — Results" />
        <ListeningPart3Result result={result} set={set} speakers={speakers} audioUrl={audioUrl} />
      </div>
    )
  }

  const isLocked  = phase === "instruction"
  const canSubmit = phase === "exam"
  const matchedCount = speakers.filter(s => matches[s.id] !== undefined).length

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeaderWithBack title="Part 3 — Speaker Matching" />

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
            {set.answers.map((opt, i) => (
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
            <div className="elevo-card elevo-card-border px-4 py-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {speakers.length} ta speaker
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {matchedCount} / {speakers.length}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(matchedCount / speakers.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {speakers.map((speaker, i) => (
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
      {(canSubmit || phase === "submitting") && speakers.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isLoading={phase === "submitting"}
            isDisabled={phase === "submitting" || !allMatched}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
