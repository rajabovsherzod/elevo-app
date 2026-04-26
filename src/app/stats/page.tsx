/* ═══════════════════════════════════════
   Stats Page — User statistics
   ═══════════════════════════════════════ */

import { PageHeader } from "@/components/elevo/shared/page-header"
import { TrendingUp } from "@/lib/icons"

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-5">
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
    </div>
  )
}
