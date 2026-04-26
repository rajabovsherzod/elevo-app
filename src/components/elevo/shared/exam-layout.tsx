"use client"

import { memo, ReactNode } from "react"
import { PageHeaderWithBack } from "./page-header-with-back"
import { ExamLoading } from "./exam-loading"
import { CalculatingResults } from "./calculating-results"
import { ErrorCard } from "./error-card"
import { ExamTimer } from "./exam-timer"

interface ExamLayoutProps {
  // Required
  title: string
  children: ReactNode

  // States
  loading: boolean
  submitting: boolean
  error?: any
  noData: boolean

  // Timer (optional)
  showTimer?: boolean
  timeLeft?: number
  formatTime?: (seconds: number) => string

  // Callbacks
  onRetry?: () => void
  onBack?: () => void
}

export const ExamLayout = memo(function ExamLayout({
  title,
  children,
  loading,
  submitting,
  error,
  noData,
  showTimer = false,
  timeLeft,
  formatTime,
  onRetry,
  onBack,
}: ExamLayoutProps) {
  // 1️⃣ Loading State
  if (loading) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title={title} rightContent={undefined} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ExamLoading />
        </div>
      </div>
    )
  }

  // 2️⃣ Error State
  if (error) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title={title} rightContent={undefined} />
        <ErrorCard
          error={error}
          onRetry={onRetry}
          onBack={onBack || (() => window.history.back())}
        />
      </div>
    )
  }

  // 3️⃣ Submitting State
  if (submitting) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title={title} rightContent={undefined} />
        <CalculatingResults />
      </div>
    )
  }

  // 4️⃣ No Data State
  if (noData) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title={title} rightContent={undefined} />
        <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-on-surface-variant">
            No question found. Try again later.
          </p>
        </div>
      </div>
    )
  }

  // 5️⃣ Main Content
  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <PageHeaderWithBack
        title={title}
        rightContent={
          showTimer && timeLeft !== undefined && formatTime ? (
            <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />
          ) : undefined
        }
      />
      {children}
    </div>
  )
})
