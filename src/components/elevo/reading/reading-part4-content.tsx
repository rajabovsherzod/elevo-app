"use client"

import { Button }                    from "@/components/base/buttons/button"
import { PageHeaderWithBack }        from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }               from "@/components/elevo/shared/exam-loading"
import { useReadingPart4 }           from "./use-reading-part4"
import { ReadingPart1Timer }         from "./reading-part1-timer"
import { ReadingPart4Text }          from "./reading-part4-text"
import { ReadingPart4McqQuestions }  from "./reading-part4-mcq-questions"
import { ReadingPart4TfngQuestions } from "./reading-part4-tfng-questions"
import { ReadingPart4Result }        from "./reading-part4-result"
import { ReadingPart4ReviewAccordion } from "./reading-part4-review-accordion"

export function ReadingPart4Content() {
  const {
    loading, submitting, questionData,
    answers, result, timeLeft,
    allAnswered, formatTime,
    handleSelect, handleSubmit,
  } = useReadingPart4()

  if (loading) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack
          title="Part 4 — Comprehension"
          rightContent={undefined}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ExamLoading />
        </div>
      </div>
    )
  }

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
  // Separate MCQ (4 answers) and T/F/NG (3 answers)
  const mcqQuestions = text.questions.filter((q) => q.answers.length === 4)
  const tfngQuestions = text.questions.filter((q) => q.answers.length === 3)

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <PageHeaderWithBack
        title="Part 4 — Comprehension"
        rightContent={
          !result
            ? <ReadingPart1Timer timeLeft={timeLeft} formatTime={formatTime} />
            : undefined
        }
      />

      {!result ? (
        <>
          {/* Text with Title & Instruction */}
          <ReadingPart4Text
            title={text.title}
            instruction={text.instruction}
            text={text.text}
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
              startNumber={mcqQuestions.length + 1}  // 5 dan boshlanadi
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
          <ReadingPart4Result
            result={result}
            questions={text.questions}
          />
          
          {/* Review Accordion - Text & Questions */}
          {questionData && (
            <ReadingPart4ReviewAccordion
              questionData={questionData}
              questions={text.questions}
            />
          )}
        </>
      )}
    </div>
  )
}
