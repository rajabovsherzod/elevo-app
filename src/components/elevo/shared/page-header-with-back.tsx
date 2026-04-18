"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface PageHeaderWithBackProps {
  /** Page title */
  title: string
  /** Optional description below title */
  description?: string
  /** Optional right side content (e.g., timer, actions) */
  rightContent?: ReactNode
  /** Custom back action, defaults to router.back() */
  onBack?: () => void
  /** Hide back button */
  hideBackButton?: boolean
}

export function PageHeaderWithBack({
  title,
  description,
  rightContent,
  onBack,
  hideBackButton = false,
}: PageHeaderWithBackProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="elevo-card elevo-card-border p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Left side: Back button + Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {!hideBackButton && (
            <button
              onClick={handleBack}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-on-surface-variant mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Custom content (timer, actions, etc.) */}
        {rightContent && (
          <div className="flex-shrink-0 pt-1">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}
