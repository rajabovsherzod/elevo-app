"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const WritingPart1_1Content = lazy(() =>
  import("@/components/elevo/writing/part-1-1/writing-part1-1-content").then(mod => ({
    default: mod.WritingPart1_1Content,
  }))
)

export default function WritingPart1_1Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey(k => k + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1.1 — Informal Letter" />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <WritingPart1_1Content key={mountKey} />
      </Suspense>
    </div>
  )
}
