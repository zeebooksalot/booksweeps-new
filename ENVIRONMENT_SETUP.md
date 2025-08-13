# Environment Variables Setup

## Security Update

The sensitive environment variables have been removed from `netlify.toml` to prevent them from being exposed in version control. You need to set these variables in your Netlify dashboard.

## Required Environment Variables

### For Netlify Dashboard

1. Go to your Netlify dashboard
2. Navigate to your site settings
3. Go to "Environment variables"
4. Add the following variables:

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbW5pdHhlZnJrdXZuYm5iaHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzE3NDgsImV4cCI6MjA2NzYwNzc0OH0.Imw2JQVeQdAr-FjvBP_4Xbl2QxmREB8S_pfuFgr2GTQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbW5pdHhlZnJrdXZuYm5iaHV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAzMTc0OCwiZXhwIjoyMDY3NjA3NzQ4fQ.ecvDjITJYvbiL1vgZUiO4FRH46yHxlthxU5t0FsIChU
```

### For Local Development

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yomnitxefrkuvnbnbhut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Platform URLs
NEXT_PUBLIC_SITE_URL=https://staging.booksweeps.com
NEXT_PUBLIC_READER_URL=https://read.booksweeps.com
NEXT_PUBLIC_AUTHOR_URL=https://app.booksweeps.com
```

## Setting Environment Variables via Netlify CLI

Alternatively, you can use the Netlify CLI:

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_anon_key_here"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_service_role_key_here"

# Deploy with new environment variables
netlify deploy --prod
```

## Security Best Practices

1. **Never commit sensitive keys to version control**
2. **Use different keys for development and production**
3. **Rotate keys regularly**
4. **Use the minimum required permissions for each key**
5. **Monitor key usage and access logs**

## Verification

After setting the environment variables:

1. Deploy your site to Netlify
2. Check that the application loads correctly
3. Verify that authentication works
4. Test API endpoints that require the service role key

## Troubleshooting

If you encounter issues:

1. **Check Netlify build logs** for environment variable errors
2. **Verify variable names** match exactly (case-sensitive)
3. **Ensure no extra spaces** in the variable values
4. **Redeploy** after setting environment variables

## CSRF Protection

The CSRF protection system has been implemented and will automatically:

- Generate tokens for authenticated users
- Validate tokens on state-changing requests
- Clean up expired tokens
- Provide hooks for frontend integration

### CSRF Implementation Details

**How it works:**
1. When a user authenticates, a CSRF token is generated and stored server-side
2. The token is sent to the frontend via the `/api/csrf/generate` endpoint
3. All state-changing requests (POST, PUT, DELETE, PATCH) must include the token in the `x-csrf-token` header
4. The middleware validates the token before allowing the request to proceed

**Protected endpoints:**
- All API routes except those in the skip list
- Skip list includes: `/api/auth/`, `/api/csrf/generate`, `/api/reader-magnets/downloads`, `/api/entries`, `/api/votes`

**Frontend usage:**
```typescript
import { useCsrf } from '@/hooks/useCsrf'

function MyComponent() {
  const { csrfToken, fetchWithCsrf } = useCsrf()
  
  const handleSubmit = async (data) => {
    const response = await fetchWithCsrf('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
}
```

**Production considerations:**
- Consider using Redis or database storage for CSRF tokens in production
- Monitor CSRF validation failures for potential attacks
- Rotate CSRF tokens periodically for enhanced security

No additional setup is required for CSRF protection.
