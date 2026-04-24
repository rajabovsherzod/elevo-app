import { Mic2, Radio, Users, MapPin, Layers, FileText } from "lucide-react"
import { ListeningPartCard } from "./listening-part-card"
import type { ListeningPart } from "./listening-part-card"

const PARTS: ListeningPart[] = [
  {
    id: "1",
    title: "Short Conversations",
    level: "B1",
    levelColor: "#f59e0b",
    icon: Mic2,
    href: "/listening/part-1",
  },
  {
    id: "2",
    title: "Monologues",
    level: "B1–B2",
    levelColor: "#6366f1",
    icon: Radio,
    href: "/listening/part-2",
  },
  {
    id: "3",
    title: "Extended Dialogues",
    level: "B2",
    levelColor: "#6366f1",
    icon: Users,
    href: "/listening/part-3",
  },
  {
    id: "4",
    title: "Map Matching",
    level: "B2–C1",
    levelColor: "#10b981",
    icon: MapPin,
    href: "/listening/part-4",
  },
  {
    id: "5",
    title: "Extracts",
    level: "C1",
    levelColor: "#10b981",
    icon: Layers,
    href: "/listening/part-5",
    comingSoon: true,
  },
  {
    id: "6",
    title: "Transcripts",
    level: "C1",
    levelColor: "#ef4444",
    icon: FileText,
    href: "/listening/part-6",
    comingSoon: true,
  },
]

export function ListeningPartsList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PARTS.map((part) => (
        <ListeningPartCard key={part.id} {...part} />
      ))}
    </div>
  )
}
