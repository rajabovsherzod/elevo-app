import { memo } from "react"

interface ListeningProgressBarProps {
  /** Current progress value (e.g., answered count) */
  current: number
  /** Maximum value (e.g., total questions) */
  total: number
  /** Label for screen readers (e.g., "questions answered", "gaps filled") */
  label: string
}

/**
 * Reusable progress bar component for all listening parts.
 * Displays current/total count with accessible progressbar role.
 */
export const ListeningProgressBar = memo(function ListeningProgressBar({
  current,
  total,
  label,
}: ListeningProgressBarProps) {
  if (total === 0) return null

  const percentage = Math.round((current / total) * 100)

  return (
    <div className="elevo-card elevo-card-border px-4 py-3 flex flex-col gap-2">
      <div className="flex justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          {total} {label}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          {current} / {total}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-surface-container-high overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progress: ${current} of ${total} ${label}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
})
