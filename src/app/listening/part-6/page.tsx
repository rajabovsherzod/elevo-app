"use client"

import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ListeningPart6Content } from "@/components/elevo/listening/part-6/listening-part6-content"

const EXAM_ID = 1

export default function ListeningPart6Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey(k => k + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 6 — Gap Filling" />
      <ListeningPart6Content key={mountKey} examId={EXAM_ID} />
    </div>
  )
}
