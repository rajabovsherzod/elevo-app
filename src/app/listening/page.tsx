"use client"

import { Headphones } from "@/lib/icons"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { ListeningPartsList } from "@/components/elevo/listening/listening-parts-list"
import { ListeningFullMockCard } from "@/components/elevo/listening/shared"

export default function ListeningPage() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="Listening" icon={Headphones} />

      <ListeningFullMockCard />

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 mb-3">
          Parts
        </p>
        <ListeningPartsList />
      </div>
    </div>
  )
}
