"use client"

import { Button }                    from "@/components/base/buttons/button"
import { PageHeaderWithBack }        from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }               from "@/components/elevo/shared/exam-loading"
import { CalculatingResults }        from "@/components/elevo/shared"
import { useReadingPart3 }           from "./use-reading-part3"
import { ReadingPart1Timer }         from "./reading-part1-timer"
import { ReadingPart3Headings }      from "./reading-part3-headings"
import { ReadingPart3Paragraphs }    from "./reading-part3-paragraphs"
import { ReadingPart3Result }        from "./reading-part3-result"

export function ReadingPart3Content() {
  const {
    loading, submitting, questionData,
    matches, result, timeLeft,
    allMatched, formatTime,
    handleSelect, handleSubmit,
  } = useReadingPart3()

  if (loading) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack
          title="Part 3 — Headings"
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
      <PageHeaderWithBack title="Part 3 — Headings" rightContent={undefined} />
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

  const { set } = questionData

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <PageHeaderWithBack
        title="Part 3 — Headings"
        rightContent={
          !result
            ? <ReadingPart1Timer timeLeft={timeLeft} formatTime={formatTime} />
            : undefined
        }
      />

      {/* Title */}
      {set.title && (
        <div className="elevo-card px-4 py-3 bg-primary/5 border-l-4 border-primary">
          <p className="text-xs font-bold text-on-surface leading-relaxed">
            {set.title}
          </p>
        </div>
      )}

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

          {/* Headings (A-H) - TEPADA, faqat matn */}
          <ReadingPart3Headings
            headings={set.answers}
            disabled={!!result || submitting}
          />

          {/* Paragraphs (I-VI) - PASTDA, match buttons SHU YERDA */}
          <ReadingPart3Paragraphs
            paragraphs={set.questions}
            headings={set.answers}
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
        <ReadingPart3Result
          result={result}
          questions={set.questions}
          answers={set.answers}
        />
      )}
    </div>
  )
}
