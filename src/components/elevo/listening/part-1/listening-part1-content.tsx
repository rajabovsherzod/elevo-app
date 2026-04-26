"use client"

import { lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

import { ListeningAudioBar } from "@/components/elevo/listening/shared/listening-audio-bar"
import { ListeningInstruction } from "@/components/elevo/listening/shared/listening-instruction"
import { ListeningProgressBar } from "@/components/elevo/listening/shared/listening-progress-bar"
import { ListeningPart1Mcq } from "./listening-part1-mcq"
import { useListeningPart1 } from "./use-listening-part1"
import { ErrorCode } from "@/lib/types/errors"

const ListeningPart1Result = lazy(() =>
  import("./listening-part1-result").then((mod) => ({
    default: mod.ListeningPart1Result,
  }))
)

export function ListeningPart1Content() {
  const {
    phase,
    questions,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    totalAnswered,
    selectAnswer,
    submit,
    retry,
  } = useListeningPart1()

  // Memoize phase checks to prevent unnecessary re-renders
  const isLoading = useMemo(() => phase === "loading", [phase])
  const isError = useMemo(() => phase === "error", [phase])
  const isSubmitting = useMemo(() => phase === "submitting", [phase])
  const isResult = useMemo(() => phase === "result", [phase])
  const isInstruction = useMemo(() => phase === "instruction", [phase])
  const canAnswer = useMemo(() => phase === "question-audio" || phase === "exam", [phase])
  const canSubmit = useMemo(() => phase === "exam", [phase])
  const showAudioBar = useMemo(() => phase === "instruction" || phase === "question-audio", [phase])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamLoading />
      </div>
    )
  }

  // Error state
  if (isError) {
    const appError = {
      message: errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring.",
      code: ErrorCode.UNKNOWN,
      retry: true,
    }
    
    return (
      <ErrorCard
        error={appError}
        onRetry={retry}
        onBack={() => window.history.back()}
      />
    )
  }

  // Submitting state
  if (isSubmitting) {
    return <CalculatingResults />
  }

  // Result state
  if (isResult && result) {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">

        <Suspense fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}>
          <ListeningPart1Result result={result} questions={questions} audioUrl={audioUrl} />
        </Suspense>
      </div>
    )
  }

  // Main content - professional structure like reading parts
  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Instructions card */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <ListeningInstruction text="You will hear some sentences. You will hear each sentence twice. Choose the correct reply to each sentence (A, B or C)." />

        {/* Audio status bar */}
        {showAudioBar && (
          <ListeningAudioBar
            isPlaying={isAudioPlaying}
            label={isInstruction ? "Instructions" : "Question audio"}
          />
        )}

        {/* Progress bar during answer phase */}
        {canAnswer && questions.length > 0 && (
          <ListeningProgressBar
            current={totalAnswered}
            total={questions.length}
            label="ta savol"
          />
        )}
      </div>

      {/* Questions card */}
      {questions.length > 0 && (
        <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
          {questions.map((question, index) => (
            <ListeningPart1Mcq
              key={question.id}
              question={question}
              questionNumber={index + 1}
              selectedAnswerId={answers[question.id]}
              onSelect={selectAnswer}
              isLocked={isInstruction}
            />
          ))}

          {/* Submit button */}
          {canSubmit && (
            <div className="flex justify-end pt-2">
              <Button
                size="md"
                color="primary"
                isDisabled={totalAnswered < questions.length}
                onClick={submit}
              >
                Submit Answers
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
