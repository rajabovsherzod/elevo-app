"use client"

import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ListeningPart5Content } from "@/components/elevo/listening/part-5/listening-part5-content"

export default function ListeningPart5Page() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 5 — Multiple Choice" />
      <ListeningPart5Content />
    </div>
  )
}
