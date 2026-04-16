/* ═══════════════════════════════════════
   Profile Page — User profile
   ═══════════════════════════════════════ */

import { AppLayout } from "@/components/elevo/layout/app-layout"
import { AppHeader } from "@/components/elevo/layout/app-header"
import { BottomNav } from "@/components/elevo/layout/bottom-nav"
import { PageHeader } from "@/components/elevo/shared/page-header"
import { User, Settings, Bell, HelpCircle, LogOut } from "lucide-react"

export default function ProfilePage() {
  return (
    <AppLayout>
      <AppHeader />

      <main className="px-5 pt-[88px] pb-28 flex flex-col gap-5">
        {/* Page Header without subtitle */}
        <PageHeader
          title="Profil"
          icon={User}
        />

        {/* User info card */}
        <div className="elevo-card p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 border-2 border-primary/30 rounded-full flex items-center justify-center">
            <span className="text-2xl font-black text-primary">A</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-on-surface">Akbar</h2>
            <p className="text-sm text-on-surface-variant">akbar@example.com</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="flex flex-col gap-2">
          <MenuItem icon={Settings} label="Sozlamalar" />
          <MenuItem icon={Bell} label="Bildirishnomalar" />
          <MenuItem icon={HelpCircle} label="Yordam" />
          <MenuItem icon={LogOut} label="Chiqish" danger />
        </div>
      </main>

      <BottomNav />
    </AppLayout>
  )
}

function MenuItem({ icon: Icon, label, danger }: { icon: any; label: string; danger?: boolean }) {
  return (
    <button className="elevo-card-hover p-4 flex items-center gap-3">
      <Icon className={`w-5 h-5 ${danger ? "text-error" : "text-on-surface-variant"}`} />
      <span className={`text-sm font-medium ${danger ? "text-error" : "text-on-surface"}`}>
        {label}
      </span>
    </button>
  )
}
