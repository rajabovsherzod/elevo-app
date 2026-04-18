"use client"

import { Button }                  from "@/components/base/buttons/button"
import { PageHeaderWithBack }      from "@/components/elevo/shared/page-header-with-back"
import { useReadingPart1 }         from "./use-reading-part1"
import { ReadingPart1Loading }     from "./reading-part1-loading"
import { ReadingPart1Timer }       from "./reading-part1-timer"
import { ReadingPart1Text }        from "./reading-part1-text"
import { ReadingPart1Result }      from "./reading-part1-result"

export function ReadingPart1Content() {
  const {
    loading, submitting, questionData,
    answers, result, timeLeft,
    allFilled, formatTime,
    handleAnswerChange, handleSubmit,
  } = useReadingPart1()

  if (loading) return <ReadingPart1Loading />

  if (!questionData) {
    return (
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-on-surface-variant">
          Savol topilmadi. Keyinroq urinib ko'ring.
        </p>
      </div>
    )
  }

  const { question } = questionData

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <PageHeaderWithBack
        title="Part 1.1 — Gap Filling"
        rightContent={
          !result
            ? <ReadingPart1Timer timeLeft={timeLeft} formatTime={formatTime} />
            : undefined
        }
      />

      {/* Passage card */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        {question.title && (
          <h2 className="text-sm font-bold text-on-surface">{question.title}</h2>
        )}
        {question.instruction && (
          <p className="text-xs text-on-surface-variant">{question.instruction}</p>
        )}

        {/* Text with inline inputs */}
        <div className="rounded-xl p-4 elevo-card-border" style={{ background: "color-mix(in srgb, currentColor 3%, transparent)" }}>
          <ReadingPart1Text
            text={question.text}
            positions={question.positions}
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

      {result && <ReadingPart1Result result={result} />}
    </div>
  )
}
