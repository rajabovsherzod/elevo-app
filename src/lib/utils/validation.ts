import { z } from 'zod'
import { ErrorCode, type AppError } from '@/lib/types/errors'

/**
 * Validate data with Zod schema and throw user-friendly error
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      const path = firstError.path.join('.')
      const message = firstError.message
      
      // Log for debugging
      console.error(`Validation error${context ? ` in ${context}` : ''}:`, {
        path,
        message,
        received: firstError,
        allErrors: error.issues
      })
      
      // Throw user-friendly error
      const userMessage = context
        ? `${context}: ${message}`
        : `Ma'lumot noto'g'ri formatda: ${message}`
      
      const validationError: AppError = {
        message: userMessage,
        code: ErrorCode.VALIDATION_ERROR,
        retry: false,
        details: error.issues
      }
      
      throw validationError
    }
    throw error
  }
}

/**
 * Safe validation - returns null on error instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', error.issues)
    }
    return null
  }
}
