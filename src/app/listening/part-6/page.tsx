"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

const ListeningPart6Content = lazy(() =>
  import("@/components/elevo/listening/part-6/listening-part6-content").then((mod) => ({
    default: mod.ListeningPart6Content,
  }))
)

export default function ListeningPart6Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 6 — Gap Filling" />
      
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <ExamLoading />
          </div>
        }
      >
        <ListeningPart6Content key={mountKey} />
      </Suspense>
    </div>
  )
}
