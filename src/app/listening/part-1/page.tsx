import { Suspense } from "react"
import { ListeningPart1Content } from "@/components/elevo/listening/part-1/listening-part1-content"

export default function ListeningPart1Page() {
  return (
    <Suspense>
      <ListeningPart1Content />
    </Suspense>
  )
}
