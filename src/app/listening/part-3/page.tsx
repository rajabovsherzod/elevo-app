"use client"

import { Suspense } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { ListeningPart3Content } from "@/components/elevo/listening/part-3/listening-part3-content"

export default function ListeningPart3Page() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 3 — Speaker Matching" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ListeningPart3Content />
      </Suspense>
    </div>
  )
}
