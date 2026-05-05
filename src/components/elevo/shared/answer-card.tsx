import { memo } from "react"
import { CheckCircle2, XCircle } from "@/lib/icons"

interface AnswerCardProps {
  questionNumber: number
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation_uz?: string | null
  explanation_en?: string | null
  onExplanationClick?: () => void
}

/**
 * Shared Answer Card Component
 * Used in all result pages (Reading, Listening, etc.)
 * Shows question number, user answer, correct answer with consistent styling
 * 
 * Mobile: YA / CA labels
 * Desktop: Your Answer / Correct Answer labels
 * 
 * Optional: Shows "Why?" button if explanation is available
 */
export const AnswerCard = memo(function AnswerCard({
  questionNumber,
  userAnswer,
  correctAnswer,
  isCorrect,
  explanation_uz,
  explanation_en,
  onExplanationClick,
}: AnswerCardProps) {
  const hasExplanation = !isCorrect && (explanation_uz || explanation_en)
  
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/50 border border-outline-variant">
      {/* Header: Number + Why? + Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center bg-primary text-white shadow-sm">
            {questionNumber}
          </span>
          {hasExplanation && onExplanationClick && (
            <button
              onClick={onExplanationClick}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Why?
            </button>
          )}
        </div>
        {isCorrect ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-error" />
        )}
      </div>

      {/* Answer */}
      {isCorrect ? (
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
            <span className="hidden md:inline">Your Answer:</span>
            <span className="md:hidden">YA:</span>
          </p>
          <span className="text-[11px] font-bold uppercase text-green-600 truncate">
            {userAnswer}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {/* User answer (wrong) */}
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
              <span className="hidden md:inline">Your Answer:</span>
              <span className="md:hidden">YA:</span>
            </p>
            <span className="text-[11px] font-bold uppercase text-error line-through opacity-70 truncate">
              {userAnswer || "—"}
            </span>
          </div>
          {/* Correct answer */}
          {correctAnswer && (
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold uppercase text-on-surface-variant flex-shrink-0">
                <span className="hidden md:inline">Correct Answer:</span>
                <span className="md:hidden">CA:</span>
              </p>
              <span className="text-[11px] font-bold uppercase text-green-600 truncate">
                {correctAnswer}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
