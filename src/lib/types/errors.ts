/**
 * Error types for the application
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NO_CONNECTION = 'NO_CONNECTION',
  
  // API errors
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  
  // Data errors
  INVALID_DATA = 'INVALID_DATA',
  MISSING_DATA = 'MISSING_DATA',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  message: string
  code: ErrorCode
  retry: boolean
  details?: unknown
}

/**
 * Parse error from various sources into AppError
 */
export function parseError(error: unknown): AppError {
  // Zod validation error
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as any
    const firstIssue = zodError.issues?.[0]
    return {
      message: firstIssue?.message || "Ma'lumot noto'g'ri formatda keldi.",
      code: ErrorCode.VALIDATION_ERROR,
      retry: false,
      details: zodError.issues,
    }
  }
  
  // Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any
    
    // Network error
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return {
          message: "So'rov juda uzoq davom etdi. Qayta urinib ko'ring.",
          code: ErrorCode.TIMEOUT,
          retry: true,
        }
      }
      return {
        message: "Internet aloqasi yo'q. Iltimos, internetni tekshiring.",
        code: ErrorCode.NO_CONNECTION,
        retry: true,
      }
    }
    
    const status = axiosError.response.status
    const data = axiosError.response.data
    
    // 404 Not Found
    if (status === 404) {
      return {
        message: data?.detail || "Savol topilmadi. Keyinroq urinib ko'ring.",
        code: ErrorCode.NOT_FOUND,
        retry: true,
      }
    }
    
    // 401 Unauthorized
    if (status === 401) {
      return {
        message: "Tizimga kirish kerak. Iltimos, qayta kiring.",
        code: ErrorCode.UNAUTHORIZED,
        retry: false,
      }
    }
    
    // 403 Forbidden
    if (status === 403) {
      return {
        message: "Sizda bu amalni bajarish uchun ruxsat yo'q.",
        code: ErrorCode.FORBIDDEN,
        retry: false,
      }
    }
    
    // 400 Bad Request
    if (status === 400) {
      return {
        message: data?.detail || "Noto'g'ri so'rov. Iltimos, qayta urinib ko'ring.",
        code: ErrorCode.BAD_REQUEST,
        retry: false,
      }
    }
    
    // 500+ Server Error
    if (status >= 500) {
      return {
        message: "Server xatoligi. Iltimos, keyinroq urinib ko'ring.",
        code: ErrorCode.SERVER_ERROR,
        retry: true,
      }
    }
    
    // Other API errors
    return {
      message: data?.detail || data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.",
      code: ErrorCode.UNKNOWN,
      retry: true,
      details: data,
    }
  }
  
  // JavaScript Error
  if (error instanceof Error) {
    return {
      message: error.message || "Noma'lum xatolik yuz berdi.",
      code: ErrorCode.UNKNOWN,
      retry: true,
      details: error,
    }
  }
  
  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      code: ErrorCode.UNKNOWN,
      retry: true,
    }
  }
  
  // Unknown error
  return {
    message: "Noma'lum xatolik yuz berdi. Qayta urinib ko'ring.",
    code: ErrorCode.UNKNOWN,
    retry: true,
    details: error,
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return error.retry && [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT,
    ErrorCode.NO_CONNECTION,
    ErrorCode.SERVER_ERROR,
    ErrorCode.NOT_FOUND,
  ].includes(error.code)
}
