"use client"

import { lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { useReadingPart2 } from "@/hooks/reading/part-2/use-reading-part2"
import { ReadingPart2AnswersGrid } from "./reading-part2-answers-grid"
import { ReadingPart2Questions } from "./reading-part2-questions"

const ReadingPart2Result = lazy(() =>
  import("./reading-part2-result").then((mod) => ({
    default: mod.ReadingPart2Result,
  }))
)

const ReadingPart2ReviewAccordion = lazy(() =>
  import("./reading-part2-review-accordion").then((mod) => ({
    default: mod.ReadingPart2ReviewAccordion,
  }))
)

export function ReadingPart2Content() {
  const {
    loading,
    submitting,
    questionData,
    matches,
    result,
    error,
    allMatched,
    timeLeft,
    formatTime,
    handleSelect,
    handleSubmit,
    retry,
  } = useReadingPart2()

  const { set } = questionData || {}

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
          {/* Instruction */}
          {set?.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {set.instruction}
              </p>
            </div>
          )}

          {/* Questions (A-J) - TEPADA, faqat matn */}
          <ReadingPart2Questions
            questions={set?.questions || []}
            answers={set?.answers || []}
            matches={matches}
            onSelect={handleSelect}
            disabled={!!result || submitting}
          />

          {/* Passages (1-8) - PASTDA, radio button'lar SHU YERDA */}
          <ReadingPart2AnswersGrid
            answers={set?.answers || []}
            questions={set?.questions || []}
            matches={matches}
            onSelect={handleSelect}
            disabled={!!result || submitting}
          />

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="md"
              color="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={!allMatched || submitting}
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
            <ReadingPart2Result
              result={result}
              questions={set?.questions || []}
              answers={set?.answers || []}
            />
          </Suspense>

          {/* Review Accordion */}
          {questionData && (
            <Suspense
              fallback={<div className="elevo-card p-8 animate-pulse">Loading review...</div>}
            >
              <ReadingPart2ReviewAccordion
                questionData={questionData}
                questions={set?.questions || []}
                answers={set?.answers || []}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}
