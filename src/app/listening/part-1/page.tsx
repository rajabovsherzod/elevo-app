"use client"

import { useState, useEffect } from "react"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ListeningPart1Content } from "@/components/elevo/listening/part-1/listening-part1-content"

export default function ListeningPart1Page() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    setMountKey((prev) => prev + 1)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1 — Short Conversations" />
      <ListeningPart1Content key={mountKey} />
    </div>
  )
}
