"use client"

import { PenLine } from "@/lib/icons"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { WritingPartsList } from "@/components/elevo/writing/writing-parts-list"

export default function WritingPage() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="Writing" icon={PenLine} />

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 mb-3">
          Parts
        </p>
        <WritingPartsList />
      </div>
    </div>
  )
}
