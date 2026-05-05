"use client"

import { memo } from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import {
  ListeningAudioBar,
  ListeningInstruction,
  ListeningProgressBar,
} from "@/components/elevo/listening/shared"
import { ListeningPart5Result } from "./listening-part5-result"
import { useListeningPart5 } from "./use-listening-part5"
import { cx } from "@/utils/cx"
import { getAnswerAriaLabel } from "@/lib/utils/a11y"

const EXAM_ID = 1

// ── MCQ Questions Component (Reading Part 4 pattern) ─────────────────────────
interface ListeningPart5McqQuestionsProps {
  questions: Array<{ 
    position: number
    question: string
    answers: Array<{ letter: string; text: string }> 
  }>
  answers: Record<number, string>
  onSelect: (position: number, letter: string) => void
  disabled: boolean
  startNumber: number
  extractNumber: number
}

const ListeningPart5McqQuestions = memo(function ListeningPart5McqQuestions({
  questions,
  answers,
  onSelect,
  disabled,
  startNumber,
  extractNumber,
}: ListeningPart5McqQuestionsProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Extract {extractNumber} (Questions {startNumber}-{startNumber + questions.length - 1})
        </p>
      </div>

      <div 
        className="flex flex-col gap-4 p-4"
        role="region"
        aria-label={`Extract ${extractNumber} questions`}
      >
        {questions.map((q) => {
          const selectedLetter = answers[q.position]

          return (
            <div 
              key={q.position} 
              className="flex flex-col gap-3"
              role="group"
              aria-labelledby={`question-${q.position}-text`}
            >
              {/* Question */}
              <div className="flex items-start gap-3">
                <span 
                  className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-primary text-white shadow-sm"
                  aria-hidden="true"
                >
                  {q.position}
                </span>
                <p 
                  id={`question-${q.position}-text`}
                  className="text-sm font-semibold text-on-surface leading-relaxed flex-1"
                >
                  {q.question}
                </p>
              </div>

              {/* Answer Options (A, B, C) */}
              <div 
                className="grid grid-cols-1 gap-2 pl-10"
                role="radiogroup"
                aria-labelledby={`question-${q.position}-text`}
                aria-required="true"
              >
                {q.answers.map((answer) => {
                  const isSelected = selectedLetter === answer.letter
                  const ariaLabel = getAnswerAriaLabel(answer.letter, answer.text, isSelected)

                  return (
                    <button
                      key={answer.letter}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={ariaLabel}
                      disabled={disabled}
                      onClick={() => onSelect(q.position, answer.letter)}
                      className={cx(
                        "w-full px-4 py-3 rounded-lg text-sm text-left transition-all duration-200",
                        "flex items-center gap-3",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected
                          ? "bg-primary text-white shadow-md"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.98]",
                      )}
                    >
                      <span className={cx(
                        "w-6 h-6 rounded-md text-[11px] font-black flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-surface-container-high text-on-surface-variant",
                      )}
                      aria-hidden="true"
                      >
                        {answer.letter}
                      </span>
                      <span className="flex-1">{answer.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

// ── Main Component ────────────────────────────────────────────────────────────
export function ListeningPart5Content() {
  const {
    phase,
    question,
    answers,
    result,
    isAudioPlaying,
    error,
    allFilled,
    filledCount,
    setAnswer,
    handleSubmit,
    retry,
  } = useListeningPart5(EXAM_ID)

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamLoading />
      </div>
    )
  }

  if (phase === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <ErrorCard message={error || "Noma'lum xatolik"} onRetry={retry} />
      </div>
    )
  }

  if (phase === "calculating") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CalculatingResults />
      </div>
    )
  }

  if (phase === "result" && result && question) {
    return <ListeningPart5Result result={result} question={question} answers={answers} />
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <ErrorCard message="Ma'lumot topilmadi" onRetry={retry} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Instruction Text (Reading Part 4 pattern) */}
      <ListeningInstruction
        text={question.instruction || "You will hear three different extracts. For questions 1-6, choose the answer (A, B or C) which fits best according to what you hear."}
      />

      {/* Audio Bar (Listening pattern) */}
      {(phase === "instruction" || phase === "question-audio") && (
        <ListeningAudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Progress Bar (Listening pattern) - always show */}
      <ListeningProgressBar
        current={filledCount}
        total={6}
        label="ta savol"
      />

      {/* MCQ Questions grouped by extract (Reading Part 4 MCQ pattern) - never disabled */}
      {question.extracts.map((extract) => (
        <ListeningPart5McqQuestions
          key={extract.extract_number}
          questions={extract.questions}
          answers={answers}
          onSelect={setAnswer}
          disabled={false}
          startNumber={extract.questions[0]?.position || 1}
          extractNumber={extract.extract_number}
        />
      ))}

      {/* Submit Button - always visible, only disabled if not all filled */}
      <div className="flex justify-end pt-2">
        <Button
          size="md"
          color="primary"
          isDisabled={!allFilled}
          onClick={handleSubmit}
        >
          Submit Answers
        </Button>
      </div>
    </div>
  )
}
