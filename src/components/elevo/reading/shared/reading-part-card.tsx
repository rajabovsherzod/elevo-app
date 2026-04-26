import Link from "next/link"
import { memo } from "react"
import type { LucideIcon } from "@/lib/icons"

export interface ReadingPart {
  id: string        // "1.1", "2", "3" ...
  title: string
  level: string
  levelColor: string
  icon: LucideIcon
  href: string
}

export const ReadingPartCard = memo(function ReadingPartCard({ 
  id, title, level, levelColor, icon: Icon, href 
}: ReadingPart) {
  return (
    <Link 
      href={href} 
      className="elevo-card elevo-card-border p-4 flex flex-col gap-3 active:scale-[0.97] transition-transform"
      prefetch={false}
      aria-label={`Start Reading Part ${id}: ${title}, Level ${level}`}
    >
      <div className="flex items-start justify-between">
        <div 
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center"
          aria-hidden="true"
        >
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ 
            ['--level-color' as string]: levelColor,
            color: 'var(--level-color)',
            background: `color-mix(in srgb, var(--level-color) 10%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--level-color) 20%, transparent)`
          }}
          aria-label={`Difficulty level: ${level}`}
        >
          {level}
        </span>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
          Part {id}
        </p>
        <p className="text-[14px] font-bold text-on-surface leading-snug">{title}</p>
      </div>
    </Link>
  )
})
