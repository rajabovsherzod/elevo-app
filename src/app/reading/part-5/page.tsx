"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ReadingPart5Content = lazy(() =>
  import("@/components/elevo/reading/part-5/reading-part5-content").then((mod) => ({
    default: mod.ReadingPart5Content,
  }))
)

export default function ReadingPart5Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Gap Filling + MCQ" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ReadingPart5Content key={mountKey} />
      </Suspense>
    </div>
  )
}
