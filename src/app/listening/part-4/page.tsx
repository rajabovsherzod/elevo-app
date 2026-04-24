import { Suspense } from "react"
import { ListeningPart4Content } from "@/components/elevo/listening/part-4/listening-part4-content"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

export default function ListeningPart4Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><ExamLoading /></div>}>
      <ListeningPart4Content />
    </Suspense>
  )
}
