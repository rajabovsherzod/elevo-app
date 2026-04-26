"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ListeningPart2Content = lazy(() =>
  import("@/components/elevo/listening/part-2/listening-part2-content").then((mod) => ({
    default: mod.ListeningPart2Content,
  }))
)

export default function ListeningPart2Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 2 — Gap Filling" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ListeningPart2Content key={mountKey} />
      </Suspense>
    </div>
  )
}
