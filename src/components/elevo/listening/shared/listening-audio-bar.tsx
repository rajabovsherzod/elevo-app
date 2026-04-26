import { memo } from "react"

interface Props {
  isPlaying: boolean
  label: string
}

const BAR_HEIGHTS = [3, 5, 4, 7, 5, 3, 6, 4]

export const ListeningAudioBar = memo(function ListeningAudioBar({ isPlaying, label }: Props) {
  return (
    <div 
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant"
      role="status"
      aria-live="polite"
      aria-label={`Audio player: ${label} ${isPlaying ? 'playing' : 'paused'}`}
    >
      <div className="flex items-end gap-[3px] h-5 flex-shrink-0">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-primary"
            style={{
              height: isPlaying ? `${h * 3}px` : "4px",
              transition: "height 0.2s ease",
              animation: isPlaying ? `pulse 0.9s ease-in-out ${i * 0.1}s infinite` : "none",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
    </div>
  )
})
