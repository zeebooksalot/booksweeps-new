import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { checkRateLimit, createRateLimitIdentifier, RATE_LIMITS, RateLimitConfig } from '@/lib/rate-limiter'
import { getClientIP } from '@/lib/client-ip'
import { serverError, unauthorizedError, rateLimitError } from '@/lib/api-response'
import { DatabaseError, ConfigurationError, logError, safeExecuteAsync } from '@/lib/shared/errors'

export interface HandlerContext {
  supabase: SupabaseClient
  body: unknown
  query: Record<string, string | string[] | undefined>
  clientMetadata: {
    ip: string
    userAgent: string | null
    userId?: string
  }
}

export interface ApiHandlerOptions {
  auth?: 'required' | 'optional' | 'none'
  rateLimit?: {
    type: 'ip' | 'user'
    action: string
    config: RateLimitConfig
  }
  clientType?: 'service' | 'authenticated'
}

export function withApiHandler(
  handler: (req: NextRequest, context: HandlerContext) => Promise<Response>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Create appropriate Supabase client
      let supabase: SupabaseClient
      let userId: string | undefined

      if (options.clientType === 'service') {
        // Use service role client for public access
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      } else {
        // Use authenticated client
        const routeHandlerClient = createRouteHandlerClient({ 
          cookies: async () => await cookies() 
        })
        supabase = routeHandlerClient

        // Check authentication if required
        if (options.auth === 'required') {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error || !session) {
            return unauthorizedError('Authentication required')
          }
          userId = session.user.id
        } else if (options.auth === 'optional') {
          const { data: { session } } = await supabase.auth.getSession()
          userId = session?.user?.id
        }
      }

      // Parse request body if it's a POST/PUT/PATCH request
      let body: unknown = null
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          body = await request.json()
        } catch {
          // Body parsing will be handled by individual handlers if needed
        }
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const query: Record<string, string | string[] | undefined> = {}
      for (const [key, value] of searchParams.entries()) {
        query[key] = value
      }

      // Get client metadata
      const clientIP = getClientIP(request)
      const userAgent = request.headers.get('user-agent')

      // Apply rate limiting if configured
      if (options.rateLimit) {
        const identifier = options.rateLimit.type === 'user' && userId
          ? createRateLimitIdentifier('user', userId, options.rateLimit.action)
          : createRateLimitIdentifier('ip', clientIP, options.rateLimit.action)

        const rateLimitResult = await checkRateLimit(identifier, options.rateLimit.config)
        if (!rateLimitResult.allowed) {
          return rateLimitError(Math.ceil(rateLimitResult.resetTime / 1000))
        }
      }

      // Create context object
      const context: HandlerContext = {
        supabase,
        body,
        query,
        clientMetadata: {
          ip: clientIP,
          userAgent,
          userId
        }
      }

      // Call the actual handler
      return await handler(request, context)

    } catch (error) {
      logError(error as Error, {
        requestId: request.headers.get('x-request-id') || undefined,
        metadata: {
          url: request.url,
          method: request.method,
          userAgent: request.headers.get('user-agent')
        }
      })
      return serverError(error)
    }
  }
}

// Helper function to create rate limit configs
export function createRateLimitConfig(action: string, limits: RateLimitConfig) {
  return {
    type: 'ip' as const,
    action,
    config: limits
  }
}

// Helper function to create user-based rate limit configs
export function createUserRateLimitConfig(action: string, limits: RateLimitConfig) {
  return {
    type: 'user' as const,
    action,
    config: limits
  }
}
