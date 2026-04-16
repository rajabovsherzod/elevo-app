/* ═══════════════════════════════════════
   Stats Page — User statistics
   ═══════════════════════════════════════ */

import { AppLayout } from "@/components/elevo/layout/app-layout"
import { AppHeader } from "@/components/elevo/layout/app-header"
import { BottomNav } from "@/components/elevo/layout/bottom-nav"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { TrendingUp } from "lucide-react"

export default function StatsPage() {
  return (
    <AppLayout>
      <AppHeader />

      <main className="px-5 pt-[88px] pb-28 flex flex-col gap-5">
        {/* Page Header with custom icon color */}
        <PageHeader
          title="Statistika"
          subtitle="O'sish dinamikangizni kuzating"
          icon={TrendingUp}
          iconColor="#10b981"
          iconOpacity={0.5}
        />

        {/* Stats content will go here */}
        <div className="elevo-card p-6 text-center">
          <p className="text-on-surface-variant">
            Statistika tez orada qo'shiladi...
          </p>
        </div>
      </main>

      <BottomNav />
    </AppLayout>
  )
}
