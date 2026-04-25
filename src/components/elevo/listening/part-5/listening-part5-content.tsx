"use client"

import { Button }             from "@/components/base/buttons/button"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }        from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction } from "@/components/elevo/listening/shared"
import { ListeningPart5Mcq }         from "./listening-part5-mcq"
import { ListeningPart5Result }      from "./listening-part5-result"
import { useListeningPart5 }         from "./use-listening-part5"

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingBlock() {
  return (
    <div className="flex flex-col pb-6">
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />
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
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />
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
export function ListeningPart5Content() {
  const {
    phase,
    extracts,
    audioUrls,
    userAnswers,
    result,
    isAudioPlaying,
    errorMsg,
    totalQuestions,
    answeredCount,
    allAnswered,
    selectAnswer,
    submit,
    retry,
  } = useListeningPart5()

  if (phase === "loading") return <LoadingBlock />

  if (phase === "error") {
    return (
      <ErrorBlock
        message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
        onRetry={retry}
      />
    )
  }

  if (phase === "submitting") return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />
      <CalculatingResults />
    </div>
  )

  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 5 — Results" />
        <ListeningPart5Result
          result={result}
          extracts={extracts}
          audioUrls={audioUrls}
          userAnswers={userAnswers}
        />
      </div>
    )
  }

  const isLocked = phase === "instruction"
  const canSubmit = phase === "exam"

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />

      {/* Instruction */}
      <ListeningInstruction
        text={extracts[0]?.instruction ?? "You will hear three extracts. For each question, choose the correct answer (A, B, or C)."}
      />

      {/* Audio status */}
      {phase === "instruction" && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label="Instructions"
        />
      )}
      
      {phase === "question-audio" && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label="Question audio"
        />
      )}

      {/* Progress - only during exam phase when user can answer */}
      {!isLocked && totalQuestions > 0 && (
        <div className="elevo-card elevo-card-border px-4 py-3 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {totalQuestions} questions
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Extract cards with questions - visible from instruction phase onward, locked until exam */}
      {extracts.length > 0 && (
        <div className="flex flex-col gap-4">
          {extracts.map((extract, ei) => (
            <div key={extract.id || ei} className="flex flex-col gap-3">
              {/* Extract label */}
              <div className="elevo-card elevo-card-border px-4 py-2.5 bg-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Extract {ei + 1}
                </p>
              </div>

              {/* Questions for this extract */}
              {extract.questions.map((q: any, qi: number) => {
                const globalQuestionNumber = ei * 2 + qi + 1
                return (
                  <ListeningPart5Mcq
                    key={q.id}
                    question={q}
                    questionNumber={globalQuestionNumber}
                    selectedAnswerId={userAnswers[q.id]}
                    onSelect={selectAnswer}
                    isLocked={isLocked}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      {canSubmit && totalQuestions > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isDisabled={!allAnswered}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
