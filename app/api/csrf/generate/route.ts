import { generateCsrfToken } from '@/lib/csrf'

export const POST = async (req: Request) => {
  try {
    console.log('🔍 CSRF Generate API - Simple mode')

    // Generate a simple token for development
    const token = generateCsrfToken('anonymous')
    
    return new Response(
      JSON.stringify({
        success: true,
        token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        temporary: true,
        mode: 'development'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('CSRF Generate Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate CSRF token' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}
