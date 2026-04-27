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
import { ReadingPart5Text } from "@/components/elevo/reading/part-5/reading-part5-text"
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
    allFilled,
    answeredCount,
    totalQuestionsCount,
    timeLeft,
    formatTime,
  } = useReadingMock()

  const showTimer = useMemo(
    () => !loading && !error && !submitting && !result,
    [loading, error, submitting, result]
  )

  // Scroll to top smoothly when currentPart changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPart])

  // Loading state
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

  // Error state
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

  // Submitting state
  if (submitting) {
    return (
      <>
        <PageHeaderWithBack title="Full Mock Test" hideBackButton={true} />
        <CalculatingResults />
      </>
    )
  }

  // Result state - WITH BACK BUTTON
  if (result) {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* Header with back button */}
        <PageHeaderWithBack title="Full Mock Result" />
        
        {/* Result page - direct render, no lazy loading */}
        <ReadingMockResult result={result} onRetry={retry} />

        {/* Review Accordion */}
        {examData && (
          <ReadingMockReviewAccordion
            examData={examData}
            result={result}
            userAnswers={{
              part1Answers,
              part2Matches,
              part3Matches,
              part4Answers,
              part5GapAnswers,
              part5McqAnswers,
            }}
          />
        )}
      </div>
    )
  }

  // No data
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

  const { reading } = examData

  // ── Compute question number offsets ─────────────────────────────────────────
  const p1Count = reading.part1.questions?.length || 0
  const p2Count = reading.part2.answers?.length || 0
  const p3Count = reading.part3.questions?.length || 0
  const p4Count = reading.part4.questions?.length || 0

  const p2Start = p1Count + 1
  const p3Start = p2Start + p2Count
  const p4Start = p3Start + p3Count
  const p5Start = p4Start + p4Count

  // Part 4 question type separation
  const mcqQuestions = reading.part4.questions?.filter((q) => q.answers.length === 4) || []
  const tfngQuestions = reading.part4.questions?.filter((q) => q.answers.length === 3) || []

  // Part 5 data
  const gapFillings = reading.part5.gap_fillings || []
  const mcqQuestionsP5 = reading.part5.mcq_questions || []

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-24 relative">
      {/* Header with back button - only during exam */}
      <PageHeaderWithBack title="Full Mock Test" />

      {/* Timer */}
      {showTimer && (
        <div className="fixed top-4 right-4 z-50">
          <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />
        </div>
      )}

      {/* Stepper */}
      <ReadingMockStepper
        currentPart={currentPart}
        completions={partCompletions}
        onGoToPart={goToPart}
      />

      {/* Part title */}
      <div className="elevo-card elevo-card-border px-4 py-3 bg-primary/5 border-l-4 border-primary">
        <p className="text-xs font-bold text-on-surface">
          {PART_TITLES[currentPart]}
        </p>
      </div>

      {/* ── Part 1 Content ─────────────────────────────────────────────────── */}
      {currentPart === 1 && (
        <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
          {reading.part1.title && (
            <h2 className="text-sm font-bold text-on-surface">{reading.part1.title}</h2>
          )}
          {reading.part1.instruction && (
            <p className="text-xs text-on-surface-variant">{reading.part1.instruction}</p>
          )}
          <div
            className="rounded-xl p-4 elevo-card-border"
            style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}
          >
            <ReadingPart1Text
              text={reading.part1.text || ""}
              positions={reading.part1.questions?.map(q => q.position) || []}
              answers={part1Answers}
              onAnswerChange={handlePart1Change}
            />
          </div>
        </div>
      )}

      {/* ── Part 2 Content ─────────────────────────────────────────────────── */}
      {currentPart === 2 && (
        <>
          {reading.part2.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {reading.part2.instruction}
              </p>
            </div>
          )}
          <ReadingPart2Questions
            questions={reading.part2.questions || []}
            answers={reading.part2.answers || []}
            matches={part2Matches}
            onSelect={handlePart2Select}
            disabled={false}
          />
          <ReadingPart2AnswersGrid
            answers={reading.part2.answers || []}
            questions={reading.part2.questions || []}
            matches={part2Matches}
            onSelect={handlePart2Select}
            disabled={false}
            startNumber={7}
          />
        </>
      )}

      {/* ── Part 3 Content ─────────────────────────────────────────────────── */}
      {currentPart === 3 && (
        <>
          {reading.part3.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {reading.part3.instruction}
              </p>
            </div>
          )}
          <ReadingPart3Headings headings={reading.part3.answers || []} disabled={false} />
          <ReadingPart3Paragraphs
            paragraphs={reading.part3.questions || []}
            headings={reading.part3.answers || []}
            matches={part3Matches}
            onSelect={handlePart3Select}
            disabled={false}
            startNumber={15}
          />
        </>
      )}

      {/* ── Part 4 Content ─────────────────────────────────────────────────── */}
      {currentPart === 4 && (
        <>
          <ReadingPart4Text
            title={reading.part4.title || ""}
            instruction={reading.part4.instruction || ""}
            text={reading.part4.text || ""}
          />
          {mcqQuestions.length > 0 && (
            <ReadingPart4McqQuestions
              questions={mcqQuestions}
              answers={part4Answers}
              onSelect={handlePart4Select}
              disabled={false}
              startNumber={21}
            />
          )}
          {tfngQuestions.length > 0 && (
            <ReadingPart4TfngQuestions
              questions={tfngQuestions}
              answers={part4Answers}
              onSelect={handlePart4Select}
              disabled={false}
              startNumber={21 + mcqQuestions.length}
            />
          )}
        </>
      )}

      {/* ── Part 5 Content ─────────────────────────────────────────────────── */}
      {currentPart === 5 && (
        <>
          <ReadingPart5Text
            title={reading.part5.title || ""}
            instruction={reading.part5.instruction || ""}
            text={reading.part5.text || ""}
          />
          <ReadingPart5GapFilling
            summaryText={reading.part5.summary_text || ""}
            gapFillings={gapFillings.flatMap((gf: any) =>
              gf.positions.map((pos: any) => ({ 
                position: pos.position,
                globalNumber: pos.global_number 
              }))
            )}
            answers={Object.fromEntries(
              Object.entries(part5GapAnswers).map(([key, val]) => {
                const pos = parseInt(key.split("_")[1])
                return [pos, val]
              })
            )}
            onAnswerChange={(pos: number, val: string) => {
              const gf = gapFillings.find((g: any) => 
                g.positions.some((p: any) => p.position === pos)
              )
              if (gf) handlePart5GapChange(`${gf.id}_${pos}`, val)
            }}
            disabled={false}
            startNumber={30}
          />
          {mcqQuestionsP5.length > 0 && (
            <ReadingPart5MCQQuestions
              questions={mcqQuestionsP5}
              answers={part5McqAnswers}
              onSelect={handlePart5McqSelect}
              disabled={false}
              startNumber={30 + gapFillings.reduce((acc, gf) => acc + gf.positions.length, 0)}
            />
          )}
        </>
      )}

      {/* ── Navigation Buttons ─────────────────────────────────────────────── */}
      <div className="sticky bottom-4 z-40 mt-4 md:mt-8">
        <div className="flex justify-between items-center p-2 sm:p-3 rounded-full bg-surface/80 backdrop-blur-xl shadow-lg border border-outline-variant">
          {/* Previous */}
          <button
            onClick={goToPrevPart}
            disabled={currentPart === 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentPart === 1
                ? "opacity-0 cursor-default" // Hide if part 1
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-95"
            }`}
            aria-label="Previous Part"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

          {/* Center Info: Part Title & Answered Count */}
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

          {/* Next / Submit */}
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
