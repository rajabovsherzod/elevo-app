"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ReadingPart4Content = lazy(() =>
  import("@/components/elevo/reading/part-4/reading-part4-content").then((mod) => ({
    default: mod.ReadingPart4Content,
  }))
)

export default function ReadingPart4Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 4 — MCQ Questions" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ReadingPart4Content key={mountKey} />
      </Suspense>
    </div>
  )
}
