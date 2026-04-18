"use client";

/* ═══════════════════════════════════════
   Dashboard Page — asosiy sahifa
   ═══════════════════════════════════════ */

import { useState, useEffect } from "react";
import { WelcomeCard }    from "@/components/elevo/dashboard/welcome-card";
import { ProgressCard }   from "@/components/elevo/dashboard/progress-card";
import { ExamStats }      from "@/components/elevo/dashboard/exam-stats";
import { QuickPractice }  from "@/components/elevo/dashboard/quick-practice";
import { DebugPanel }     from "@/components/elevo/debug-panel";
import { useAuthStore }   from "@/store/auth.store";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { getDisplayName } from "@/types/auth.types";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  useCurrentUser(); // background'da fresh data oladi va store'ni yangilaydi

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = getDisplayName(user);
  const level = user?.status === "PAID" ? "B2" : "B1";

  return (
    <div className="flex flex-col gap-5 relative z-10">
      <WelcomeCard
        name={displayName}
        level={level}
        streak={0}
        xp={0}
      />

      <ProgressCard
        level={level}
        progress={0}
        questionsAnswered={0}
        accuracy={0}
        studyTime="0 soat"
      />

      <ExamStats
        listening={0}
        reading={0}
        speaking={0}
        writing={0}
      />

      <QuickPractice />
      
      {/* DEV DEBUG PANEL */}
      <DebugPanel />
    </div>
  );
}
