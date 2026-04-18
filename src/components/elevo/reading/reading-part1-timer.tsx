import { Clock } from "lucide-react"

interface ReadingPart1TimerProps {
  timeLeft: number
  formatTime: (s: number) => string
}

export function ReadingPart1Timer({ timeLeft, formatTime }: ReadingPart1TimerProps) {
  const isLow = timeLeft <= 60

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-bold tabular-nums transition-colors ${
        isLow ? "bg-error" : "bg-primary"
      }`}
    >
      <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
      <span className="text-sm">{formatTime(timeLeft)}</span>
    </div>
  )
}
