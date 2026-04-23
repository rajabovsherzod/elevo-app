"use client"

import { Button }             from "@/components/base/buttons/button"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }        from "@/components/elevo/shared/exam-loading"
import { ListeningAudioBar, ListeningInstruction } from "@/components/elevo/listening/shared"
import { ListeningPart2GapText }  from "./listening-part2-gap-text"
import { ListeningPart2Result }   from "./listening-part2-result"
import { useListeningPart2 }      from "./use-listening-part2"

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingBlock() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 2 — Gap Filling" />
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
      <PageHeaderWithBack title="Part 2 — Gap Filling" />
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
    setAnswer,
    submit,
    retry,
  } = useListeningPart2()

  if (phase === "loading") return <LoadingBlock />

  if (phase === "error") {
    return (
      <ErrorBlock
        message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
        onRetry={retry}
      />
    )
  }

  if (phase === "result" && result && question) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 2 — Results" />
        <ListeningPart2Result result={result} question={question} audioUrl={audioUrl} />
      </div>
    )
  }

  // inputs locked only during instruction — open as soon as audio starts playing
  const inputsLocked = phase === "instruction"
  const canSubmit    = phase === "exam"
  const filledCount  = question
    ? question.positions.filter(p => (answers[p] ?? "").trim().length > 0).length
    : 0

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeaderWithBack title="Part 2 — Gap Filling" />

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
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {question.positions.length} ta bo'shliq
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {filledCount} / {question.positions.length}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(filledCount / question.positions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      {(canSubmit || phase === "submitting") && question && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isLoading={phase === "submitting"}
            isDisabled={phase === "submitting" || !allFilled}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
