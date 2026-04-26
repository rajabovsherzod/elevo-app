"use client"

import { lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { useReadingPart5 } from "@/hooks/reading/part-5/use-reading-part5"
import { ReadingPart5Text } from "./reading-part5-text"
import { ReadingPart5GapFilling } from "./reading-part5-gap-filling"
import { ReadingPart5MCQQuestions } from "./reading-part5-mcq-questions"

const ReadingPart5Result = lazy(() =>
  import("./reading-part5-result").then((mod) => ({
    default: mod.ReadingPart5Result,
  }))
)

const ReadingPart5ReviewAccordion = lazy(() =>
  import("./reading-part5-review-accordion").then((mod) => ({
    default: mod.ReadingPart5ReviewAccordion,
  }))
)

export function ReadingPart5Content() {
  const {
    loading,
    submitting,
    questionData,
    gapAnswers,
    mcqAnswers,
    result,
    error,
    allAnswered,
    timeLeft,
    formatTime,
    handleGapChange,
    handleMcqSelect,
    handleSubmit,
    gapFillings,
    mcqQuestions,
    retry,
  } = useReadingPart5()

  const { text } = questionData || {}

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
          {/* Main Text */}
          <ReadingPart5Text
            title={text?.title || ""}
            instruction={text?.instruction || ""}
            text={text?.text || ""}
          />

          {/* Gap Filling (Questions 1-4) */}
          <ReadingPart5GapFilling
            summaryText={text?.summary_text || ""}
            gapFillings={gapFillings}
            answers={gapAnswers}
            onAnswerChange={handleGapChange}
            disabled={!!result || submitting}
          />

          {/* MCQ Questions (Questions 5-6) */}
          {mcqQuestions.length > 0 && (
            <ReadingPart5MCQQuestions
              questions={mcqQuestions}
              answers={mcqAnswers}
              onSelect={handleMcqSelect}
              disabled={!!result || submitting}
              startNumber={5}
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
            <ReadingPart5Result result={result} questionData={questionData!} />
          </Suspense>

          {/* Review Accordion */}
          <Suspense
            fallback={<div className="elevo-card p-8 animate-pulse">Loading review...</div>}
          >
            <ReadingPart5ReviewAccordion questionData={questionData!} />
          </Suspense>
        </>
      )}
    </div>
  )
}
