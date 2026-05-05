"use client"

import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ListeningPart4Content } from "@/components/elevo/listening/part-4/listening-part4-content"

const EXAM_ID = 1

export default function ListeningPart4Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey(k => k + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 4 — Map Matching" />
      <ListeningPart4Content key={mountKey} examId={EXAM_ID} />
    </div>
  )
}
