import { memo } from "react"
import { AlignLeft, Tag, Heading, ListChecks, FileSearch } from "@/lib/icons"
import { ReadingPartCard } from "./reading-part-card"
import type { ReadingPart } from "./reading-part-card"

const PARTS: ReadingPart[] = [
  {
    id: "1.1",
    title: "Gap Filling",
    level: "B1",
    levelColor: "#f59e0b",
    icon: AlignLeft,
    href: "/reading/part-1-1",
  },
  {
    id: "2",
    title: "Matching Banners",
    level: "B1–B2",
    levelColor: "#6366f1",
    icon: Tag,
    href: "/reading/part-2",
  },
  {
    id: "3",
    title: "Matching Headers",
    level: "B2",
    levelColor: "#6366f1",
    icon: Heading,
    href: "/reading/part-3",
  },
  {
    id: "4",
    title: "Multiple Choice & T/F/NG",
    level: "B2–C1",
    levelColor: "#10b981",
    icon: ListChecks,
    href: "/reading/part-4",
  },
  {
    id: "5",
    title: "Gap Filling",
    level: "C1",
    levelColor: "#10b981",
    icon: FileSearch,
    href: "/reading/part-5",
  },
]

export const ReadingPartsList = memo(function ReadingPartsList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PARTS.map((part) => (
        <ReadingPartCard key={part.id} {...part} />
      ))}
    </div>
  )
})
