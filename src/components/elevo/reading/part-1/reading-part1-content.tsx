"use client"

import { lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { useReadingPart1 } from "@/hooks/reading/part-1/use-reading-part1"
import { ReadingPart1Text } from "./reading-part1-text"

const ReadingPart1Result = lazy(() =>
  import("./reading-part1-result").then((mod) => ({
    default: mod.ReadingPart1Result,
  }))
)

const ReadingPart1ReviewAccordion = lazy(() =>
  import("./reading-part1-review-accordion").then((mod) => ({
    default: mod.ReadingPart1ReviewAccordion,
  }))
)

export function ReadingPart1Content() {
  const {
    loading,
    submitting,
    questionData,
    answers,
    result,
    timeLeft,
    error,
    allFilled,
    formatTime,
    handleAnswerChange,
    handleSubmit,
    retry,
  } = useReadingPart1()

  const { question } = questionData || {}

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
      {/* Timer - Fixed position, no flickering */}
      {showTimer && (
        <div className="fixed top-4 right-4 z-50">
          <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />
        </div>
      )}

      {/* Passage card */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        {question?.title && (
          <h2 className="text-sm font-bold text-on-surface">{question.title}</h2>
        )}
        {question?.instruction && (
          <p className="text-xs text-on-surface-variant">{question.instruction}</p>
        )}

        {/* Text with inline inputs */}
        <div
          className="rounded-xl p-4 elevo-card-border"
          style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
        >
          <ReadingPart1Text
            text={question?.text || ""}
            positions={question?.positions || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            result={result}
          />
        </div>

        {!result && (
          <div className="flex justify-end">
            <Button
              size="md"
              color="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={!allFilled || submitting}
            >
              Submit Answers
            </Button>
          </div>
        )}
      </div>

      {result && (
        <>
          <Suspense
            fallback={<div className="elevo-card p-8 animate-pulse">Loading results...</div>}
          >
            <ReadingPart1Result result={result} />
          </Suspense>

          {/* Review Accordion */}
          {questionData && (
            <Suspense
              fallback={<div className="elevo-card p-8 animate-pulse">Loading review...</div>}
            >
              <ReadingPart1ReviewAccordion questionData={questionData} />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}
