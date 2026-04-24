"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/base/buttons/button"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared"
import { useReadingPart5 } from "./use-reading-part5"
import { ReadingPart1Timer } from "./reading-part1-timer"
import { ReadingPart5Text } from "./reading-part5-text"
import { ReadingPart5GapFilling } from "./reading-part5-gap-filling"
import { ReadingPart5MCQQuestions } from "./reading-part5-mcq-questions"
import { ReadingPart5Result } from "./reading-part5-result"
import { ReadingPart5ReviewAccordion } from "./reading-part5-review-accordion"

export function ReadingPart5Content() {
  const {
    loading, submitting, questionData,
    gapAnswers, mcqAnswers, result, timeLeft,
    allAnswered, formatTime,
    handleGapChange, handleMcqSelect, handleSubmit,
    gapFillings, mcqQuestions,
  } = useReadingPart5()

  if (loading) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack
          title="Part 5 — Summary & MCQ"
          rightContent={undefined}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ExamLoading />
        </div>
      </div>
    )
  }

  if (submitting) return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Summary & MCQ" rightContent={undefined} />
      <CalculatingResults />
    </div>
  )

  if (!questionData) {
    return (
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-on-surface-variant">
          No question found. Try again later.
        </p>
      </div>
    )
  }

  const { text } = questionData

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <PageHeaderWithBack
        title="Part 5 — Summary & MCQ"
        rightContent={
          !result
            ? <ReadingPart1Timer timeLeft={timeLeft} formatTime={formatTime} />
            : undefined
        }
      />

      {!result ? (
        <>
          {/* Main Text */}
          <ReadingPart5Text
            title={text.title}
            instruction={text.instruction}
            text={text.text}
          />

          {/* Gap Filling (Questions 1-4) */}
          <ReadingPart5GapFilling
            summaryText={text.summary_text}
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
          <ReadingPart5Result
            result={result}
            questionData={questionData}
          />
          
          {/* Review Accordion */}
          <ReadingPart5ReviewAccordion
            questionData={questionData}
          />
        </>
      )}
    </div>
  )
}
