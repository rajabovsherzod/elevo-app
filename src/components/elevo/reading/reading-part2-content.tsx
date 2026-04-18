"use client"

import { Button }                    from "@/components/base/buttons/button"
import { PageHeaderWithBack }        from "@/components/elevo/shared/page-header-with-back"
import { useReadingPart2 }           from "./use-reading-part2"
import { ReadingPart2Loading }       from "./reading-part2-loading"
import { ReadingPart1Timer }         from "./reading-part1-timer"
import { ReadingPart2AnswersGrid }   from "./reading-part2-answers-grid"
import { ReadingPart2Questions }     from "./reading-part2-questions"
import { ReadingPart2Result }        from "./reading-part2-result"

export function ReadingPart2Content() {
  const {
    loading, submitting, questionData,
    matches, result, timeLeft,
    allMatched, formatTime,
    handleSelect, handleSubmit,
  } = useReadingPart2()

  if (loading) return <ReadingPart2Loading />

  if (!questionData) {
    return (
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-on-surface-variant">
          No question found. Try again later.
        </p>
      </div>
    )
  }

  const { set } = questionData

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <PageHeaderWithBack
        title="Part 2 — Matching"
        rightContent={
          !result
            ? <ReadingPart1Timer timeLeft={timeLeft} formatTime={formatTime} />
            : undefined
        }
      />

      {!result ? (
        <>
          {/* Instruction */}
          {set.instruction && (
            <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
              <p className="text-xs font-medium text-on-surface leading-relaxed">
                {set.instruction}
              </p>
            </div>
          )}

          {/* Answer options reference */}
          <ReadingPart2AnswersGrid
            answers={set.answers}
            selectedIds={Object.values(matches)}
          />

          {/* Questions with letter selectors */}
          <ReadingPart2Questions
            questions={set.questions}
            answers={set.answers}
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
        <ReadingPart2Result
          result={result}
          questions={set.questions}
          answers={set.answers}
        />
      )}
    </div>
  )
}
