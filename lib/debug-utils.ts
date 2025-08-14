/**
 * Production debugging utilities for tracking authentication and logout issues
 */

export interface DebugLogData {
  timestamp: string
  message: string
  data?: unknown
  environment: string
  component: string
  userAgent?: string
  url?: string
  userId?: string
  sessionId?: string
}

export const createDebugLogger = (component: string) => {
  return (message: string, data?: unknown, additionalContext?: Partial<DebugLogData>) => {
    const isProduction = process.env.NODE_ENV === 'production'
    const timestamp = new Date().toISOString()
    
    const logData: DebugLogData = {
      timestamp,
      message,
      data,
      environment: process.env.NODE_ENV,
      component,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      ...additionalContext
    }
    
    if (isProduction) {
      // In production, log with structured format for better debugging
      console.log(`[${component.toUpperCase()} DEBUG ${timestamp}]`, logData)
    } else {
      // In development, use simpler format
      console.log(`[${component}] ${message}`, data || '')
    }
  }
}

/**
 * Debug helper specifically for authentication issues
 */
export const createAuthDebugLogger = (component: string) => {
  const baseLogger = createDebugLogger(component)
  
  return {
    log: baseLogger,
    logSignOut: (userId?: string, sessionId?: string, additionalData?: Record<string, unknown>) => {
      baseLogger('Sign out initiated', {
        userId,
        sessionId,
        ...additionalData
      }, { userId, sessionId })
    },
    logSignOutError: (error: unknown, userId?: string, sessionId?: string) => {
      baseLogger('Sign out error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        sessionId
      }, { userId, sessionId })
    },
    logSessionState: (hasSession: boolean, userId?: string, sessionId?: string) => {
      baseLogger('Session state check', {
        hasSession,
        userId,
        sessionId,
        currentTime: new Date().toISOString()
      }, { userId, sessionId })
    },
    logRedirect: (fromUrl: string, toUrl: string, reason: string) => {
      baseLogger('Redirect initiated', {
        fromUrl,
        toUrl,
        reason,
        timestamp: new Date().toISOString()
      })
    }
  }
}

/**
 * Debug helper for tracking browser storage clearing
 */
export const debugStorageClearing = () => {
  const logger = createDebugLogger('Storage')
  
  if (typeof window === 'undefined') {
    logger('Storage clearing skipped - SSR environment')
    return
  }
  
  // Log localStorage state before clearing
  const localStorageKeys = Object.keys(localStorage)
  const sessionStorageKeys = Object.keys(sessionStorage)
  const cookies = document.cookie.split(';').map(c => c.split('=')[0].trim())
  
  logger('Storage state before clearing', {
    localStorageKeys,
    sessionStorageKeys,
    cookies,
    localStorageSize: localStorageKeys.length,
    sessionStorageSize: sessionStorageKeys.length,
    cookieCount: cookies.length
  })
  
  // Clear storage
  localStorage.clear()
  sessionStorage.clear()
  
  // Clear cookies
  const clearedCookies = cookies.map(cookieName => {
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    return cookieName
  })
  
  logger('Storage cleared', {
    localStorageKeysCleared: localStorageKeys,
    sessionStorageKeysCleared: sessionStorageKeys,
    cookiesCleared: clearedCookies
  })
}

/**
 * Debug helper for tracking navigation issues
 */
export const debugNavigation = (targetUrl: string, method: 'router' | 'window.location' = 'router') => {
  const logger = createDebugLogger('Navigation')
  
  logger('Navigation attempt', {
    targetUrl,
    method,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
    timestamp: new Date().toISOString()
  })
  
  return {
    success: () => logger('Navigation successful', { targetUrl, method }),
    failure: (error: unknown) => logger('Navigation failed', { 
      targetUrl, 
      method, 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
}

/**
 * Debug helper for tracking Supabase auth state changes
 */
export const debugSupabaseAuth = (event: string, data?: unknown) => {
  const logger = createDebugLogger('SupabaseAuth')
  
  logger(`Auth event: ${event}`, {
    event,
    data,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'SSR'
  })
}
