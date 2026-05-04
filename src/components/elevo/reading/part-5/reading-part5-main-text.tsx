import { memo } from "react"

interface ReadingPart5MainTextProps {
  title: string
  text: string
}

export const ReadingPart5MainText = memo(function ReadingPart5MainText({
  title,
  text,
}: ReadingPart5MainTextProps) {
  return (
    <div className="elevo-card overflow-hidden">
      <div className="px-4 py-3 bg-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          {title || "Reading Text"}
        </p>
      </div>

      <div className="p-5">
        <div className="prose prose-sm max-w-none text-on-surface">
          {text.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-xs sm:text-sm md:text-base leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
})
