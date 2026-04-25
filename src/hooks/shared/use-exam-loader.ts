"use client"

import { useState, useCallback } from "react"
import { parseError, type AppError } from "@/lib/types/errors"

const LOAD_TIMEOUT_MS = 30_000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1_500

export interface UseExamLoaderOptions<T> {
  loadFn: () => Promise<T>
  validateFn?: (data: T) => void // Throws error if invalid
  onSuccess?: (data: T) => void
}

export interface UseExamLoaderReturn<T> {
  loading: boolean
  error: AppError | null
  data: T | null
  load: () => Promise<void>
  retry: () => void
}

/**
 * Shared exam loader hook with retry logic
 * 
 * @example
 * const loader = useExamLoader({
 *   loadFn: () => getReadingPart1Question(),
 *   validateFn: (data) => {
 *     if (!data?.question?.text) {
 *       throw new Error('Invalid question data')
 *     }
 *   },
 *   onSuccess: (data) => {
 *     setQuestionData(data)
 *     // Initialize answers
 *   }
 * })
 */
export function useExamLoader<T>({
  loadFn,
  validateFn,
  onSuccess,
}: UseExamLoaderOptions<T>): UseExamLoaderReturn<T> {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [data, setData] = useState<T | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setData(null)

    let lastError: unknown
    let cancelled = false

    // Timeout handler
    const timeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        const timeoutError = parseError({ code: 'ECONNABORTED' })
        setError(timeoutError)
        setLoading(false)
      }
    }, LOAD_TIMEOUT_MS)

    // Retry loop
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (cancelled) break

      try {
        const result = await loadFn()

        if (cancelled) break

        clearTimeout(timeout)

        // Validate if validator provided
        if (validateFn) {
          validateFn(result)
        }

        // Success!
        setData(result)
        setError(null)
        setLoading(false)

        if (onSuccess) {
          onSuccess(result)
        }

        return
      } catch (err) {
        lastError = err
        console.error(`Load attempt ${attempt + 1} failed:`, err)

        if (attempt < MAX_RETRIES - 1) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }
    }

    // All retries failed
    clearTimeout(timeout)
    if (!cancelled) {
      const appError = parseError(lastError)
      setError(appError)
      setLoading(false)
    }
  }, [loadFn, validateFn, onSuccess])

  const retry = useCallback(() => {
    load()
  }, [load])

  return {
    loading,
    error,
    data,
    load,
    retry,
  }
}
