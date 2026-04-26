"use client"

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "@/lib/icons"
import { Button } from "@/components/base/buttons/button"
import { ErrorCode, type AppError } from "@/lib/types/errors"
import { getErrorAriaLabel } from "@/lib/utils/a11y"

interface ErrorCardProps {
  error: AppError
  onRetry?: () => void
  onBack?: () => void
}

export function ErrorCard({ error, onRetry, onBack }: ErrorCardProps) {
  const getIcon = () => {
    switch (error.code) {
      case ErrorCode.NO_CONNECTION:
      case ErrorCode.NETWORK_ERROR:
        return <WifiOff className="w-12 h-12 text-error" strokeWidth={1.5} />
      case ErrorCode.TIMEOUT:
        return <RefreshCw className="w-12 h-12 text-error" strokeWidth={1.5} />
      default:
        return <AlertCircle className="w-12 h-12 text-error" strokeWidth={1.5} />
    }
  }

  const getTitle = () => {
    switch (error.code) {
      case ErrorCode.NO_CONNECTION:
        return "Internet aloqasi yo'q"
      case ErrorCode.TIMEOUT:
        return "So'rov uzoq davom etdi"
      case ErrorCode.NOT_FOUND:
        return "Savol topilmadi"
      case ErrorCode.SERVER_ERROR:
        return "Server xatoligi"
      case ErrorCode.UNAUTHORIZED:
        return "Tizimga kirish kerak"
      default:
        return "Xatolik yuz berdi"
    }
  }

  return (
    <div 
      className="elevo-card elevo-card-border p-8 flex flex-col items-center text-center gap-5 animate-fade-in"
      role="alert"
      aria-live="assertive"
      aria-label={getErrorAriaLabel(getTitle())}
    >
      {/* Icon */}
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ 
          background: "color-mix(in srgb, var(--el-error) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--el-error) 20%, transparent)"
        }}
        aria-hidden="true"
      >
        {getIcon()}
      </div>

      {/* Title & Message */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold text-on-surface">
          {getTitle()}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">
          {error.message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {onBack && (
          <Button 
            size="md" 
            color="secondary" 
            onClick={onBack}
            className="w-full sm:w-auto"
            aria-label="Go back to previous page"
          >
            Orqaga
          </Button>
        )}
        {error.retry && onRetry && (
          <Button 
            size="md" 
            color="primary" 
            onClick={onRetry}
            className="w-full sm:w-auto"
            aria-label="Retry loading exam"
          >
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Qayta urinish
          </Button>
        )}
      </div>

      {/* Error code (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 px-3 py-1.5 rounded-lg bg-surface-container-low">
          <p className="text-[10px] font-mono text-on-surface-variant">
            Error Code: {error.code}
          </p>
        </div>
      )}
    </div>
  )
}
