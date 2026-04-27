"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ReadingMockContent = lazy(() =>
  import("@/components/elevo/reading/mock/reading-mock-content").then((mod) => ({
    default: mod.ReadingMockContent,
  }))
)

export default function ReadingMockPage() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <Suspense
        fallback={
          <>
            <PageHeaderWithBack title="Full Mock Test" />
            <div className="flex items-center justify-center min-h-[60vh]">
              <ExamLoading />
            </div>
          </>
        }
      >
        <ReadingMockContent key={mountKey} />
      </Suspense>
    </div>
  )
}
