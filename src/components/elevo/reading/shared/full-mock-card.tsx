import Link from "next/link"
import { ClipboardList, ChevronRight } from "@/lib/icons"

export function FullMockCard() {
  return (
    <Link
      href="/reading/mock"
      className="elevo-card elevo-card-border p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
        <ClipboardList className="w-6 h-6 text-primary" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
          To'liq test
        </p>
        <p className="text-[16px] font-bold text-on-surface">Full Mock</p>
      </div>
      <ChevronRight className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
    </Link>
  )
}
