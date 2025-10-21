import { withApiHandler } from '@/lib/api-middleware'
import { successResponse } from '@/lib/api-response'
import { generateCsrfToken } from '@/lib/csrf'

export const POST = withApiHandler(
  async (req, { clientMetadata }) => {
    console.log('🔍 CSRF Generate API - User ID:', clientMetadata.userId)

    // If no authenticated user, generate a temporary token for unauthenticated users
    if (!clientMetadata.userId) {
      const tempToken = generateCsrfToken('anonymous')
      
      return successResponse({
        token: tempToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        temporary: true
      })
    }

    // Generate CSRF token for the authenticated user
    const token = generateCsrfToken(clientMetadata.userId)

    return successResponse({
      token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      temporary: false
    })
  },
  {
    auth: 'optional',
    clientType: 'authenticated'
  }
)
