"use client"

import { lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { useReadingPart4 } from "@/hooks/reading/part-4/use-reading-part4"
import { ReadingPart4Text } from "./reading-part4-text"
import { ReadingPart4McqQuestions } from "./reading-part4-mcq-questions"
import { ReadingPart4TfngQuestions } from "./reading-part4-tfng-questions"

const ReadingPart4Result = lazy(() =>
  import("./reading-part4-result").then((mod) => ({
    default: mod.ReadingPart4Result,
  }))
)

const ReadingPart4ReviewAccordion = lazy(() =>
  import("./reading-part4-review-accordion").then((mod) => ({
    default: mod.ReadingPart4ReviewAccordion,
  }))
)

export function ReadingPart4Content() {
  const {
    loading,
    submitting,
    questionData,
    answers,
    result,
    error,
    allAnswered,
    timeLeft,
    formatTime,
    handleSelect,
    handleSubmit,
    retry,
  } = useReadingPart4()

  const { text } = questionData || {}
  // Separate MCQ (4 answers) and T/F/NG (3 answers)
  const mcqQuestions = text?.questions.filter((q) => q.answers.length === 4) || []
  const tfngQuestions = text?.questions.filter((q) => q.answers.length === 3) || []

  // Memoize showTimer to prevent unnecessary re-renders
  const showTimer = useMemo(
    () => !loading && !error && !submitting && !result,
    [loading, error, submitting, result]
  )

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamLoading />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorCard
        error={error}
        onRetry={retry}
        onBack={() => window.history.back()}
      />
    )
  }

  // Submitting state
  if (submitting) {
    return <CalculatingResults />
  }

  // No data state
  if (!questionData) {
    return (
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-on-surface-variant">
          No question found. Try again later.
        </p>
      </div>
    )
  }

  // Main content
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Fixed Timer - only show during exam */}
      {showTimer && (
        <div className="fixed top-4 right-4 z-50">
          <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />
        </div>
      )}

      {!result ? (
        <>
          {/* Text with Title & Instruction */}
          <ReadingPart4Text
            title={text?.title || ""}
            instruction={text?.instruction || ""}
            text={text?.text || ""}
          />

          {/* Multiple Choice Questions (4 ta) */}
          {mcqQuestions.length > 0 && (
            <ReadingPart4McqQuestions
              questions={mcqQuestions}
              answers={answers}
              onSelect={handleSelect}
              disabled={!!result || submitting}
            />
          )}

          {/* True/False/Not Given Questions (5 ta) */}
          {tfngQuestions.length > 0 && (
            <ReadingPart4TfngQuestions
              questions={tfngQuestions}
              answers={answers}
              onSelect={handleSelect}
              disabled={!!result || submitting}
              startNumber={mcqQuestions.length + 1} // 5 dan boshlanadi
            />
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="md"
              color="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={!allAnswered || submitting}
              showTextWhileLoading
            >
              Submit Answers
            </Button>
          </div>
        </>
      ) : (
        <>
          <Suspense
            fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}
          >
            <ReadingPart4Result result={result} questions={text?.questions || []} />
          </Suspense>

          {/* Review Accordion - Text & Questions */}
          {questionData && (
            <Suspense
              fallback={<div className="elevo-card p-8 animate-pulse">Loading review...</div>}
            >
              <ReadingPart4ReviewAccordion
                questionData={questionData}
                questions={text?.questions || []}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}
