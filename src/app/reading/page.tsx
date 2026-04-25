"use client"

import { BookOpen } from "lucide-react"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { FullMockCard } from "@/components/elevo/reading/shared/full-mock-card"
import { ReadingPartsList } from "@/components/elevo/reading/shared/reading-parts-list"

export default function ReadingPage() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="Reading" icon={BookOpen} />

      <FullMockCard />

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 mb-3">
          Parts
        </p>
        <ReadingPartsList />
      </div>
    </div>
  )
}
