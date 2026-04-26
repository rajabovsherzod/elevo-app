"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ReadingPart1Content = lazy(() =>
  import("@/components/elevo/reading/part-1/reading-part1-content").then((mod) => ({
    default: mod.ReadingPart1Content,
  }))
)

export default function ReadingPart1Page() {
  // Force remount on every page visit to prevent stale data
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    // Increment key on mount to force fresh component
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header - Always visible immediately (NO TIMER HERE) */}
      <PageHeaderWithBack title="Part 1.1 — Gap Filling" />
      
      {/* Content - Lazy loaded with key to force remount */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ReadingPart1Content key={mountKey} />
      </Suspense>
    </div>
  )
}
