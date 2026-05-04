"use client"

import { useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { useReadingPart2 } from "@/hooks/reading/part-2/use-reading-part2"
import { ReadingPart2AnswersGrid } from "./reading-part2-answers-grid"
import { ReadingPart2Questions } from "./reading-part2-questions"
import { ReadingPart2Result } from "./reading-part2-result"
import { ReadingPart2ReviewAccordion } from "./reading-part2-review-accordion"

export function ReadingPart2Content() {
  const {
    loading,
    submitting,
    questionData,
    answers,
    result,
    error,
    allMatched,
    timeLeft,
    formatTime,
    handleSelect,
    handleSubmit,
    retry,
  } = useReadingPart2()

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
          {questionData.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {questionData.instruction}
              </p>
            </div>
          )}

          {/* Headings (A-J) - TOP section, just text */}
          <ReadingPart2Questions
            headings={questionData.headings}
            passages={questionData.passages}
            answers={answers}
            onSelect={handleSelect}
            disabled={!!result || submitting}
          />

          {/* Passages (1-8) - BOTTOM section, with radio buttons */}
          <ReadingPart2AnswersGrid
            passages={questionData.passages}
            headings={questionData.headings}
            answers={answers}
            onSelect={handleSelect}
            disabled={!!result || submitting}
          />

          {/* Submit - ALWAYS enabled */}
          <div className="flex justify-end">
            <Button
              size="md"
              color="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={submitting}
              showTextWhileLoading
            >
              Submit Answers
            </Button>
          </div>
        </>
      ) : (
        <>
          <ReadingPart2Result result={result} />

          {/* Review Accordion */}
          {questionData && result && (
            <ReadingPart2ReviewAccordion
              questionData={result.set}
              results={result.results}
            />
          )}
        </>
      )}
    </div>
  )
}
