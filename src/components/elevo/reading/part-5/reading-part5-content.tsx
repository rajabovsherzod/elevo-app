"use client"

import { useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { useReadingPart5 } from "@/hooks/reading/part-5/use-reading-part5"
import { ReadingPart5GapFilling } from "./reading-part5-gap-filling"
import { ReadingPart5MCQQuestions } from "./reading-part5-mcq-questions"
import { ReadingPart5Result } from "./reading-part5-result"
import { ReadingPart5ReviewAccordion } from "./reading-part5-review-accordion"
import { ReadingPart5MainText } from "./reading-part5-main-text"

export function ReadingPart5Content() {
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
    handleAnswerChange,
    handleSubmit,
    retry,
  } = useReadingPart5()

  const { title, instruction, main_text, summary_text, gap_positions, questions } = questionData || {}

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
          {/* Main Text (Asosiy katta text - o'qish uchun) */}
          {main_text && (
            <ReadingPart5MainText
              title={title || "Reading Text"}
              text={main_text}
            />
          )}

          {/* Gap Filling (Questions 1-4) - Summary text bilan */}
          <ReadingPart5GapFilling
            text={summary_text || ""}
            gapPositions={gap_positions || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            disabled={!!result || submitting}
          />

          {/* MCQ Questions (Questions 5-6) */}
          {questions && questions.length > 0 && (
            <ReadingPart5MCQQuestions
              questions={questions}
              answers={answers}
              onSelect={(position, letter) => handleAnswerChange(parseInt(position), letter)}
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
          <ReadingPart5Result result={result} />
          <ReadingPart5ReviewAccordion questionData={questionData} result={result} />
        </>
      )}
    </div>
  )
}
