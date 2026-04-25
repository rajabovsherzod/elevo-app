interface ReadingPart5TextProps {
  title: string | null
  instruction: string | null
  text: string
}

export function ReadingPart5Text({ title, instruction, text }: ReadingPart5TextProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      {title && (
        <div className="elevo-card px-5 py-4 bg-primary/5 border-l-4 border-primary">
          <h2 className="text-sm font-bold text-on-surface leading-snug">
            {title}
          </h2>
        </div>
      )}

      {/* Instruction */}
      {instruction && (
        <div className="elevo-card px-4 py-3 bg-surface-container-low border-l-4 border-primary">
          <p className="text-xs font-medium text-on-surface leading-relaxed">
            {instruction}
          </p>
        </div>
      )}

      {/* Main Text */}
      <div className="elevo-card p-5">
        <div className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
          {text}
        </div>
      </div>
    </div>
  )
}
