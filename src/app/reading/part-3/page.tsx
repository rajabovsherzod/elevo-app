"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ReadingPart3Content = lazy(() =>
  import("@/components/elevo/reading/part-3/reading-part3-content").then((mod) => ({
    default: mod.ReadingPart3Content,
  }))
)

export default function ReadingPart3Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 3 — Multiple Choice" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ReadingPart3Content key={mountKey} />
      </Suspense>
    </div>
  )
}
