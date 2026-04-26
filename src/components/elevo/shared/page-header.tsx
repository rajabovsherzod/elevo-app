/* ═══════════════════════════════════════
   PageHeader — reusable page title component
   Icon (optional) tilted 12° on right side
   Solid card bg, follows design system
   ═══════════════════════════════════════ */

import type { LucideIcon } from "@/lib/icons"
import type { ReactNode } from "react"

interface PageHeaderProps {
  /** Page title (required) */
  title: string
  /** Optional subtitle/description */
  subtitle?: ReactNode
  /** Optional decorative icon (Lucide icon) */
  icon?: LucideIcon
  /** Custom icon color (default: primary) */
  iconColor?: string
  /** Custom icon size (default: 64px) */
  iconSize?: number
  /** Custom icon rotation (default: 12deg) */
  iconRotation?: number
  /** Custom icon opacity (default: 0.4) */
  iconOpacity?: number
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "currentColor",
  iconSize = 64,
  iconRotation = 12,
  iconOpacity = 0.4,
}: PageHeaderProps) {
  return (
    <header className="relative elevo-card p-5 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" aria-hidden />
      
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title & Subtitle */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Decorative Icon (tilted) */}
        {Icon && (
          <Icon
            className="shrink-0 text-primary"
            style={{
              width: iconSize,
              height: iconSize,
              color: iconColor,
              transform: `rotate(${iconRotation}deg)`,
              opacity: iconOpacity,
            }}
            strokeWidth={1.5}
            aria-hidden
          />
        )}
      </div>
    </header>
  )
}
