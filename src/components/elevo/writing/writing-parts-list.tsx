import { memo } from "react"
import { PenLine, FileText, AlignLeft } from "@/lib/icons"
import { ListeningPartCard } from "@/components/elevo/listening/listening-part-card"
import type { ListeningPart } from "@/components/elevo/listening/listening-part-card"

const PARTS: ListeningPart[] = [
  {
    id: "1.1",
    title: "Informal Letter",
    level: "B1",
    levelColor: "#f59e0b",
    icon: PenLine,
    href: "/writing/part-1-1",
  },
  {
    id: "1.2",
    title: "Formal Letter",
    level: "B1–B2",
    levelColor: "#6366f1",
    icon: FileText,
    href: "/writing/part-1-2",
    comingSoon: true,
  },
  {
    id: "2",
    title: "Essay",
    level: "B2–C1",
    levelColor: "#10b981",
    icon: AlignLeft,
    href: "/writing/part-2",
    comingSoon: true,
  },
]

export const WritingPartsList = memo(function WritingPartsList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PARTS.map(part => (
        <ListeningPartCard key={part.id} {...part} />
      ))}
    </div>
  )
})
