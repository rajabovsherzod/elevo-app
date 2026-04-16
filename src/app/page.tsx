/* ═══════════════════════════════════════
   Dashboard Page — asosiy sahifa
   ═══════════════════════════════════════ */

import { AppLayout }     from "@/components/elevo/layout/app-layout"
import { AppHeader }     from "@/components/elevo/layout/app-header"
import { BottomNav }     from "@/components/elevo/layout/bottom-nav"
import { WelcomeCard }   from "@/components/elevo/dashboard/welcome-card"
import { ProgressCard }  from "@/components/elevo/dashboard/progress-card"
import { ExamStats }     from "@/components/elevo/dashboard/exam-stats"
import { QuickPractice } from "@/components/elevo/dashboard/quick-practice"

export default function DashboardPage() {
  return (
    <AppLayout>
      <AppHeader />

      <main className="px-5 pt-[88px] pb-28 flex flex-col gap-5">
        <WelcomeCard
          name="Akbar"
          level="B1"
          streak={7}
          xp={2340}
        />

        <ProgressCard
          level="B1"
          progress={70}
          questionsAnswered={1240}
          accuracy={84}
          studyTime="42 soat"
        />

        <ExamStats
          listening={7.5}
          reading={8.0}
          speaking={6.5}
          writing={7.0}
        />

        <QuickPractice />
      </main>

      <BottomNav />
    </AppLayout>
  )
}
