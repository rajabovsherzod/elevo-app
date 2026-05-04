"use client"

import { lazy, Suspense } from "react"
import { Button } from "@/components/base/buttons/button"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import {
  ListeningAudioBar,
  ListeningInstruction,
  ListeningLoading,
  ListeningError,
  ListeningProgressBar,
} from "@/components/elevo/listening/shared"
import { ListeningPart1Mcq } from "./listening-part1-mcq"
import { useListeningPart1 } from "./use-listening-part1"

const ListeningPart1Result = lazy(() =>
  import("./listening-part1-result").then(mod => ({ default: mod.ListeningPart1Result }))
)

export function ListeningPart1Content() {
  const {
    phase, questions, audioUrl, answers, result,
    isAudioPlaying, errorMsg, totalAnswered,
    selectAnswer, submit, retry,
  } = useListeningPart1()

  if (phase === "loading") return <ListeningLoading title="Part 1 — Short Conversations" />

  if (phase === "error") return (
    <ListeningError
      title="Part 1 — Short Conversations"
      message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
      onRetry={retry}
    />
  )

  if (phase === "submitting") return <CalculatingResults />

  if (phase === "result" && result) return (
    <div className="flex flex-col gap-5">
      <Suspense fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}>
        <ListeningPart1Result result={result} questions={questions} audioUrl={audioUrl} />
      </Suspense>
    </div>
  )

  const isLocked  = phase === "instruction"
  const canSubmit = phase === "exam"

  return (
    <div className="flex flex-col gap-4 pb-6">

      <ListeningInstruction
        text="You will hear some sentences. Choose the correct reply to each sentence (A, B or C)."
      />

      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {!isLocked && questions.length > 0 && (
        <ListeningProgressBar
          current={totalAnswered}
          total={questions.length}
          label="ta savol"
        />
      )}

      {questions.length > 0 && (
        <div className="flex flex-col gap-3">
          {questions.map((question, index) => (
            <ListeningPart1Mcq
              key={question.position}
              question={question}
              questionNumber={index + 1}
              selectedLetter={answers[question.position]}
              onSelect={selectAnswer}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}

      {canSubmit && questions.length > 0 && (
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
  )
}
