"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface UseExamTimerOptions {
  duration: number // seconds
  onTimeout: () => void
  enabled?: boolean // Timer faqat enabled bo'lganda ishlaydi
}

export interface UseExamTimerReturn {
  timeLeft: number
  formatTime: (secs: number) => string
  reset: () => void
  stop: () => void
}

/**
 * Shared exam timer hook
 * 
 * @example
 * const timer = useExamTimer({
 *   duration: 8 * 60, // 8 minutes
 *   onTimeout: handleSubmit,
 *   enabled: !loading && !result && !error
 * })
 */
export function useExamTimer({ 
  duration, 
  onTimeout, 
  enabled = true 
}: UseExamTimerOptions): UseExamTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTimeoutRef = useRef(onTimeout)

  // Keep onTimeout ref fresh
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  // Timer logic
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeoutRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    timerRef.current = timer

    return () => {
      clearInterval(timer)
    }
  }, [enabled])

  const reset = useCallback(() => {
    setTimeLeft(duration)
  }, [duration])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }, [])

  return {
    timeLeft,
    formatTime,
    reset,
    stop,
  }
}
