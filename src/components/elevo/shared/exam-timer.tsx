import { Clock } from "@/lib/icons"
import { getTimerAriaLabel } from "@/lib/utils/a11y"

interface ExamTimerProps {
  timeLeft: number
  formatTime: (s: number) => string
}

export function ExamTimer({ timeLeft, formatTime }: ExamTimerProps) {
  const isLow = timeLeft <= 60
  const ariaLabel = getTimerAriaLabel(timeLeft)

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-bold tabular-nums transition-colors ${
        isLow ? "bg-error" : "bg-primary"
      }`}
      role="timer"
      aria-label={ariaLabel}
      aria-live="polite"
      aria-atomic="true"
    >
      <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      <span className="text-sm">{formatTime(timeLeft)}</span>
    </div>
  )
}
