"use client"

import { lazy, Suspense } from "react"
import { Button }             from "@/components/base/buttons/button"

import { CalculatingResults } from "@/components/elevo/shared"
import { ListeningAudioBar, ListeningInstruction, ListeningLoading, ListeningError, ListeningProgressBar } from "@/components/elevo/listening/shared"
import { ListeningPart5Mcq }         from "./listening-part5-mcq"
import { useListeningPart5 }         from "./use-listening-part5"


const ListeningPart5Result = lazy(() =>
  import("./listening-part5-result").then((mod) => ({
    default: mod.ListeningPart5Result,
  }))
)

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

  if (phase === "loading") {
    return <ListeningLoading title="Part 5 — Multiple Choice" />
  }

  if (phase === "error") {
    return (
      <ListeningError
        title="Part 5 — Multiple Choice"
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

  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-5 pb-6">

        <Suspense fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}>
          <ListeningPart5Result
            result={result}
            extracts={extracts}
            audioUrls={audioUrls}
            userAnswers={userAnswers}
          />
        </Suspense>
      </div>
    )
  }

  const isLocked = phase === "instruction"
  const canSubmit = phase === "exam"

  return (
    <div className="flex flex-col gap-4 pb-6">


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
        <ListeningProgressBar
          current={answeredCount}
          total={totalQuestions}
          label="questions"
        />
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
