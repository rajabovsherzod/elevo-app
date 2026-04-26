import { memo } from "react"

interface Props {
  text: string
}

export const ListeningInstruction = memo(function ListeningInstruction({ text }: Props) {
  return (
    <div className="elevo-card elevo-card-border px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
        Instructions
      </p>
      <p className="text-sm text-on-surface leading-relaxed">{text}</p>
    </div>
  )
})
