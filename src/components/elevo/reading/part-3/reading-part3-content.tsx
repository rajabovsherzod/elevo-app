"use client"

import { lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { useReadingPart3 } from "@/hooks/reading/part-3/use-reading-part3"
import { ReadingPart3Headings } from "./reading-part3-headings"
import { ReadingPart3Paragraphs } from "./reading-part3-paragraphs"

const ReadingPart3Result = lazy(() =>
  import("./reading-part3-result").then((mod) => ({
    default: mod.ReadingPart3Result,
  }))
)

const ReadingPart3ReviewAccordion = lazy(() =>
  import("./reading-part3-review-accordion").then((mod) => ({
    default: mod.ReadingPart3ReviewAccordion,
  }))
)

export function ReadingPart3Content() {
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
  } = useReadingPart3()

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

      {/* Title */}
      {set?.title && (
        <div className="elevo-card px-4 py-3 bg-primary/5 border-l-4 border-primary">
          <p className="text-xs font-bold text-on-surface leading-relaxed">
            {set.title}
          </p>
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

          {/* Headings (A-H) - TEPADA, faqat matn */}
          <ReadingPart3Headings headings={set?.answers || []} disabled={!!result || submitting} />

          {/* Paragraphs (I-VI) - PASTDA, match buttons SHU YERDA */}
          <ReadingPart3Paragraphs
            paragraphs={set?.questions || []}
            headings={set?.answers || []}
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
            <ReadingPart3Result
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
              <ReadingPart3ReviewAccordion
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
