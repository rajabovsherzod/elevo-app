"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ListeningPart5Content = lazy(() =>
  import("@/components/elevo/listening/part-5/listening-part5-content").then((mod) => ({
    default: mod.ListeningPart5Content,
  }))
)

export default function ListeningPart5Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ListeningPart5Content key={mountKey} />
      </Suspense>
    </div>
  )
}
