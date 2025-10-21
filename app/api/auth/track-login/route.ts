import { withApiHandler } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { successResponse, badRequestError } from '@/lib/api-response'
import { FailedLoginTracker } from '@/lib/failed-login-tracker'
import { getReferringURL } from '@/lib/referring-url'
import { z } from 'zod'

const TrackLoginSchema = z.object({
  email: z.string().email(),
  success: z.boolean(),
  loginPageUrl: z.string().url().optional()
})

const CheckLoginSchema = z.object({
  email: z.string().email()
})

export const POST = withApiHandler(
  async (req, { clientMetadata, body }) => {
    // Validate the body using Zod schema
    const result = TrackLoginSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }
    
    const { email, success, loginPageUrl } = result.data
    const ipAddress = clientMetadata.ip
    
    // Get referring URL safely
    let referringUrl: string | null = null
    try {
      const url = await getReferringURL()
      referringUrl = url || null
    } catch (error) {
      console.warn('Could not get referring URL:', error)
      referringUrl = null
    }

    console.log('🔍 Track Login API - Email:', email, 'Success:', success)

    if (success) {
      // Track successful login and clear failed attempts
      await FailedLoginTracker.trackSuccessfulAttempt(email, ipAddress, referringUrl || undefined, loginPageUrl)
      return successResponse({ message: 'Login tracked and failed attempts cleared' })
    } else {
      // Track failed attempt
      const result = await FailedLoginTracker.trackFailedAttempt(email, ipAddress, referringUrl || undefined, loginPageUrl)
      return successResponse(result)
    }
  },
  {
    auth: 'none',
    clientType: 'authenticated'
  }
)

export const GET = withApiHandler(
  async (req, { query, clientMetadata }) => {
    const { email } = query
    
    if (!email || typeof email !== 'string') {
      return badRequestError('Email parameter required')
    }

    // Validate email format
    const emailValidation = z.string().email().safeParse(email)
    if (!emailValidation.success) {
      return badRequestError('Invalid email format')
    }

    console.log('🔍 Check Login API - Email:', email)

    const result = await FailedLoginTracker.isLoginAllowed(email, clientMetadata.ip)
    return successResponse(result)
  },
  {
    auth: 'none',
    clientType: 'authenticated'
  }
)
