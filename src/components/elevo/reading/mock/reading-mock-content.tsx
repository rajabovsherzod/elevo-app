"use client"

import { useEffect, useMemo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { ExamTimer } from "@/components/elevo/shared/exam-timer"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { useReadingMock } from "@/hooks/reading/mock/use-reading-mock"
import { ErrorCode, type AppError } from "@/lib/types/errors"
import { ReadingMockStepper } from "./reading-mock-stepper"
import { ReadingMockReviewAccordion } from "./reading-mock-review-accordion"
import { ReadingMockResult } from "./reading-mock-result"
import { ChevronLeft, ChevronRight } from "@/lib/icons"

// Reuse existing part UI components
import { ReadingPart1Text } from "@/components/elevo/reading/part-1/reading-part1-text"
import { ReadingPart2Questions } from "@/components/elevo/reading/part-2/reading-part2-questions"
import { ReadingPart2AnswersGrid } from "@/components/elevo/reading/part-2/reading-part2-answers-grid"
import { ReadingPart3Headings } from "@/components/elevo/reading/part-3/reading-part3-headings"
import { ReadingPart3Paragraphs } from "@/components/elevo/reading/part-3/reading-part3-paragraphs"
import { ReadingPart4Text } from "@/components/elevo/reading/part-4/reading-part4-text"
import { ReadingPart4McqQuestions } from "@/components/elevo/reading/part-4/reading-part4-mcq-questions"
import { ReadingPart4TfngQuestions } from "@/components/elevo/reading/part-4/reading-part4-tfng-questions"
import { ReadingPart5MainText } from "@/components/elevo/reading/part-5/reading-part5-main-text"
import { ReadingPart5GapFilling } from "@/components/elevo/reading/part-5/reading-part5-gap-filling"
import { ReadingPart5MCQQuestions } from "@/components/elevo/reading/part-5/reading-part5-mcq-questions"

const PART_TITLES: Record<number, string> = {
  1: "Part 1 — Gap Filling",
  2: "Part 2 — Match Passages",
  3: "Part 3 — Headings",
  4: "Part 4 — Multiple Choice",
  5: "Part 5 — Mixed",
}

export function ReadingMockContent() {
  const {
    loading,
    submitting,
    error,
    examData,
    result,
    currentPart,
    part1Answers,
    part2Matches,
    part3Matches,
    part4Answers,
    part5GapAnswers,
    part5McqAnswers,
    handlePart1Change,
    handlePart2Select,
    handlePart3Select,
    handlePart4Select,
    handlePart5GapChange,
    handlePart5McqSelect,
    goToNextPart,
    goToPrevPart,
    goToPart,
    handleSubmit,
    retry,
    partCompletions,
    answeredCount,
    totalQuestionsCount,
    timeLeft,
    formatTime,
  } = useReadingMock()

  const showTimer = useMemo(
    () => !loading && !error && !submitting && !result,
    [loading, error, submitting, result]
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPart])

  if (loading) {
    return (
      <>
        <PageHeaderWithBack title="Full Mock Test" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ExamLoading />
        </div>
      </>
    )
  }

  if (error) {
    const appError: AppError = {
      message: error,
      code: ErrorCode.UNKNOWN,
      retry: true,
    }
    return (
      <>
        <PageHeaderWithBack title="Full Mock Test" />
        <ErrorCard
          error={appError}
          onRetry={retry}
          onBack={() => window.history.back()}
        />
      </>
    )
  }

  if (submitting) {
    return (
      <>
        <PageHeaderWithBack title="Full Mock Test" hideBackButton={true} />
        <CalculatingResults />
      </>
    )
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <PageHeaderWithBack title="Full Mock Result" />
        <ReadingMockResult result={result} onRetry={retry} />
        {examData && (
          <ReadingMockReviewAccordion
            examData={examData}
            result={result}
          />
        )}
      </div>
    )
  }

  if (!examData) {
    return (
      <>
        <PageHeaderWithBack title="Full Mock Test" />
        <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-on-surface-variant">
            No questions found. Try again later.
          </p>
        </div>
      </>
    )
  }

  const part1Data = examData.part1
  const part2Data = examData.part2
  const part3Data = examData.part3
  const part4Data = examData.part4
  const part5Data = examData.part5

  const mcqQuestions = part4Data.questions?.filter((q) => q.answers.length === 4) || []
  const tfngQuestions = part4Data.questions?.filter((q) => q.answers.length === 3) || []

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-24 relative">
      <PageHeaderWithBack title="Full Mock Test" />

      {showTimer && (
        <div className="fixed top-4 right-4 z-50">
          <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />
        </div>
      )}

      <ReadingMockStepper
        currentPart={currentPart}
        completions={partCompletions}
        onGoToPart={goToPart}
      />

      <div className="elevo-card elevo-card-border px-4 py-3 bg-primary/5 border-l-4 border-primary">
        <p className="text-xs font-bold text-on-surface">
          {PART_TITLES[currentPart]}
        </p>
      </div>

      {currentPart === 1 && (
        <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
          {part1Data.title && (
            <h2 className="text-sm font-bold text-on-surface">{part1Data.title}</h2>
          )}
          {part1Data.instruction && (
            <p className="text-xs text-on-surface-variant">{part1Data.instruction}</p>
          )}
          <div
            className="rounded-xl p-4 elevo-card-border"
            style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
          >
            <ReadingPart1Text
              text={part1Data.text || ""}
              positions={part1Data.positions || []}
              answers={part1Answers}
              onAnswerChange={handlePart1Change}
            />
          </div>
        </div>
      )}

      {currentPart === 2 && (
        <>
          {part2Data.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {part2Data.instruction}
              </p>
            </div>
          )}
          <ReadingPart2Questions
            headings={part2Data.headings}
            passages={part2Data.passages}
            answers={part2Matches}
            onSelect={(passagePos, letter) => handlePart2Select(passagePos, letter)}
            disabled={false}
          />
          <ReadingPart2AnswersGrid
            passages={part2Data.passages}
            headings={part2Data.headings}
            answers={part2Matches}
            onSelect={(passagePos, letter) => handlePart2Select(passagePos, letter)}
            disabled={false}
            startNumber={part2Data.global_start || 7}
          />
        </>
      )}

      {currentPart === 3 && (
        <>
          {part3Data.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {part3Data.instruction}
              </p>
            </div>
          )}
          <ReadingPart3Headings headings={part3Data.headings} disabled={false} />
          <ReadingPart3Paragraphs
            paragraphs={part3Data.paragraphs}
            headings={part3Data.headings}
            answers={part3Matches}
            onSelect={(paragraphPos, letter) => handlePart3Select(paragraphPos, letter)}
            disabled={false}
            startNumber={part3Data.global_start || 15}
          />
        </>
      )}

      {currentPart === 4 && (
        <>
          <ReadingPart4Text
            title={part4Data.title || ""}
            instruction={part4Data.instruction || ""}
            text={part4Data.text || ""}
          />
          {mcqQuestions.length > 0 && (
            <ReadingPart4McqQuestions
              questions={mcqQuestions}
              answers={part4Answers}
              onSelect={(questionPos, letter) => handlePart4Select(questionPos, letter)}
              disabled={false}
              startNumber={part4Data.global_start || 21}
            />
          )}
          {tfngQuestions.length > 0 && (
            <ReadingPart4TfngQuestions
              questions={tfngQuestions}
              answers={part4Answers}
              onSelect={(questionPos, letter) => handlePart4Select(questionPos, letter)}
              disabled={false}
              startNumber={(part4Data.global_start || 21) + mcqQuestions.length}
            />
          )}
        </>
      )}

      {currentPart === 5 && (
        <>
          {part5Data.main_text && (
            <ReadingPart5MainText
              title={part5Data.title || "Reading Text"}
              text={part5Data.main_text}
            />
          )}
          <ReadingPart5GapFilling
            text={part5Data.summary_text || ""}
            gapPositions={part5Data.gap_positions || []}
            answers={part5GapAnswers}
            onAnswerChange={handlePart5GapChange}
            disabled={false}
            startNumber={part5Data.global_start || 30}
          />
          {part5Data.questions.length > 0 && (
            <ReadingPart5MCQQuestions
              questions={part5Data.questions}
              answers={part5McqAnswers}
              onSelect={(questionPos, letter) => handlePart5McqSelect(questionPos, letter)}
              disabled={false}
              startNumber={(part5Data.global_start || 30) + (part5Data.gap_positions?.length || 0)}
            />
          )}
        </>
      )}

      <div className="sticky bottom-4 z-40 mt-4 md:mt-8">
        <div className="flex justify-between items-center p-2 sm:p-3 rounded-full bg-surface/80 backdrop-blur-xl shadow-lg border border-outline-variant">
          <button
            onClick={goToPrevPart}
            disabled={currentPart === 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentPart === 1
                ? "opacity-0 cursor-default"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-95"
            }`}
            aria-label="Previous Part"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
              {PART_TITLES[currentPart]}
            </span>
            <div className="flex items-center gap-1.5 bg-surface-container-highest/50 px-2.5 py-0.5 rounded-full border border-outline-variant/30">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  answeredCount === totalQuestionsCount
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-primary animate-pulse"
                }`}
              />
              <span className="text-[8px] sm:text-[9px] font-bold text-on-surface tracking-wider">
                ANSWERED {answeredCount}/{totalQuestionsCount}
              </span>
            </div>
          </div>

          {currentPart < 5 ? (
            <button
              onClick={goToNextPart}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-95 transition-all"
              aria-label="Next Part"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </button>
          ) : (
            <Button
              size="lg"
              color="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={submitting}
              className="rounded-full px-6 font-bold shadow-md h-12"
            >
              Submit All
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
