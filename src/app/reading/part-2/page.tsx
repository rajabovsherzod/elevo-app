"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ReadingPart2Content = lazy(() =>
  import("@/components/elevo/reading/part-2/reading-part2-content").then((mod) => ({
    default: mod.ReadingPart2Content,
  }))
)

export default function ReadingPart2Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 2 — Matching Headings" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ReadingPart2Content key={mountKey} />
      </Suspense>
    </div>
  )
}
