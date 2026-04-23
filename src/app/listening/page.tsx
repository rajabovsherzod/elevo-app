"use client"

import { Headphones } from "lucide-react"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { ListeningPartsList } from "@/components/elevo/listening/listening-parts-list"

export default function ListeningPage() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="Listening" icon={Headphones} />

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 mb-3">
          Parts
        </p>
        <ListeningPartsList />
      </div>
    </div>
  )
}
