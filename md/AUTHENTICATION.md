# Authentication Documentation

## 🎯 Overview

BookSweeps uses **Supabase Auth** as the foundation for authentication, with a custom user profile system that supports multiple user types and cross-domain authentication across the platform ecosystem.

## 🏗️ Architecture

### Multi-Domain Ecosystem
```
app.booksweeps.com    → Author Platform
staging.booksweeps.com → Main Reader Site (this repo)
read.booksweeps.com   → Reader Subdomain
```

### Authentication Strategy
- **Single Supabase Project**: All domains share the same Supabase project
- **Shared Sessions**: User sessions work seamlessly across all subdomains
- **Cross-Domain Support**: Properly configured CORS and session persistence
- **User Type Management**: Support for reader, author, and dual accounts

## 👥 User Types

### User Type System
The platform supports three user types that determine capabilities and access:

#### 1. **Reader** (`'reader'`)
- **Default type** for new registrations
- Access to book discovery and downloads
- Reader magnet downloads
- Giveaway participation
- Reading preferences and library

#### 2. **Author** (`'author'`)
- Book creation and management
- Campaign creation
- Analytics and insights
- Author dashboard access
- Can also use reader features

#### 3. **Both** (`'both'`)
- Full access to both author and reader features
- Seamless switching between platforms
- Unified dashboard experience

### User Type Management
```typescript
// User type upgrade API
POST /api/auth/upgrade-user-type
{
  "user_id": "uuid",
  "new_user_type": "both",
  "upgrade_reason": "wants_reader_access",
  "domain_referrer": "staging.booksweeps.com"
}
```

## 🔐 Authentication Flow

### 1. **Sign Up Process**

#### Default Registration (Reader)
```typescript
// New users are registered as readers by default
await signUp(email, password, { user_type: 'reader' })
```

**Flow:**
1. User fills signup form (email, password)
2. Supabase creates auth user account
3. System creates user profile in `users` table
4. Default user settings created in `user_settings` table
5. User redirected to dashboard

#### Author Registration
```typescript
// Authors can be created with specific type
await signUp(email, password, { user_type: 'author' })
```

### 2. **Sign In Process**

#### Standard Sign In
```typescript
await signIn(email, password)
```

**Flow:**
1. User enters credentials
2. Supabase validates and creates session
3. **Email verification enforcement** - users must verify email
4. System checks user type
5. Appropriate interface shown based on type

#### Author Choice Modal
When author users sign in, they see a choice modal:
- **Continue as Author** → Redirect to author platform
- **Use Reader Features** → Stay on current site with reader access

### 3. **Session Management**

#### Session Configuration
```typescript
// Supabase client configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

#### Session Features
- **JWT Tokens**: 1-hour expiry with refresh token rotation
- **Cross-Domain**: Sessions work across all subdomains
- **Persistence**: Local storage + cookies for seamless navigation
- **Auto-Refresh**: Automatic token refresh before expiry

## 🛡️ Security Features

### 1. **CSRF Protection**

#### Implementation
```typescript
// CSRF token generation
const csrfToken = generateCsrfToken(userId)

// Token validation in middleware
if (!validateCsrfToken(csrfToken, session.user.id)) {
  // Block request
}
```

#### Protected Endpoints
- All state-changing operations (POST, PUT, DELETE, PATCH)
- Excludes: `/api/auth/`, `/api/csrf/generate`, public endpoints

#### Frontend Usage
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

### 2. **Rate Limiting**

#### Auth Rate Limits
```toml
[auth.rate_limit]
email_sent = 2                    # Emails per hour
sms_sent = 30                     # SMS per hour
anonymous_users = 30              # Anonymous sign-ins per hour
token_refresh = 150               # Token refreshes per 5 minutes
sign_in_sign_ups = 30            # Sign in/up per 5 minutes
token_verifications = 30          # OTP verifications per 5 minutes
```

#### API Rate Limits
- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **File uploads**: 10 uploads per minute

### 3. **Content Security Policy**

#### Production CSP
```typescript
const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co; frame-ancestors 'none';`
```

### 4. **Password Security**

#### Requirements
```typescript
// Password validation
export function validatePassword(password: string) {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return { isValid: errors.length === 0, errors }
}
```

## 🔄 Cross-Domain Authentication

### 1. **Domain Configuration**

#### Supabase Settings
```toml
[auth]
site_url = "https://staging.booksweeps.com"
additional_redirect_urls = [
  "https://app.booksweeps.com",
  "https://read.booksweeps.com",
  "http://localhost:3000"
]
```

#### CORS Configuration
```typescript
// Supabase client with cross-domain support
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### 2. **Platform Redirects**

#### Author Platform Redirect
```typescript
// When author users choose author platform
const authorPlatformUrl = 'https://app.booksweeps.com'
window.location.href = authorPlatformUrl
```

#### Reader Platform Redirect
```typescript
// When users choose reader features
const readerPlatformUrl = 'https://read.booksweeps.com'
window.location.href = readerPlatformUrl
```

### 3. **Access Token System**

#### For Reader Magnets
```typescript
// Generate access token for book downloads
const accessToken = generateAccessToken()
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

// Store in database
await supabase
  .from('reader_deliveries')
  .insert({
    delivery_method_id,
    reader_email,
    reader_name,
    access_token: accessToken,
    expires_at: expiresAt
  })
```

#### Token Validation
```typescript
// Validate token from reader subdomain
POST /api/reader/validate-token
{
  "token": "uuid-token"
}

// Response
{
  "success": true,
  "book": { /* book data */ },
  "delivery": { /* delivery data */ }
}
```

## 📊 Database Schema

### 1. **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  user_type TEXT DEFAULT 'reader' CHECK (user_type IN ('reader', 'author', 'both')),
  auth_source TEXT,
  favorite_genres TEXT[],
  reading_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **User Settings Table**
```sql
CREATE TABLE user_settings (
  user_id UUID REFERENCES users(id),
  theme TEXT DEFAULT 'auto',
  font TEXT DEFAULT 'Inter',
  sidebar_collapsed BOOLEAN DEFAULT false,
  keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  usage_analytics BOOLEAN DEFAULT true,
  auto_save_drafts BOOLEAN DEFAULT true
);
```

### 3. **User Upgrade Logs**
```sql
CREATE TABLE user_upgrade_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  from_user_type TEXT,
  to_user_type TEXT,
  upgrade_reason TEXT,
  domain_referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  upgraded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ Implementation Guide

### 1. **Setting Up Authentication**

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Supabase Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null
```

### 2. **Using Auth Provider**

#### Wrap Your App
```typescript
// app/layout.tsx
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### Use Auth Hook
```typescript
import { useAuth } from '@/components/auth/AuthProvider'

function MyComponent() {
  const { 
    user, 
    userProfile, 
    userSettings, 
    loading, 
    signIn, 
    signUp, 
    signOut 
  } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {userProfile?.display_name}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => signIn(email, password)}>Sign In</button>
      )}
    </div>
  )
}
```

### 3. **Protected Routes**

#### Middleware Protection
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if no session
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}
```

#### Component-Level Protection
```typescript
function ProtectedComponent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content</div>
}
```

## 🚨 Error Handling

### 1. **Auth Error Types**
```typescript
export interface AuthError {
  message: string
  code?: string
  context?: string
}
```

### 2. **Common Error Handling**
```typescript
import { handleAuthError } from '@/lib/auth-utils'

try {
  await signIn(email, password)
} catch (error) {
  const authError = handleAuthError(error, 'sign in')
  console.error(authError.message)
  // Show user-friendly error message
}
```

### 3. **Error Messages**
```typescript
export const AUTH_ERROR_MESSAGES = {
  emailNotVerified: 'Please verify your email address before signing in.',
  invalidCredentials: 'Invalid email or password.',
  weakPassword: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
  emailAlreadyExists: 'An account with this email already exists.',
  networkError: 'Network error. Please check your connection.',
  sessionExpired: 'Your session has expired. Please sign in again.'
}
```

## 🔧 Testing

### 1. **Test Auth Page**
```typescript
// app/test-auth/page.tsx
export default function TestAuthPage() {
  const { user, loading, signIn, signOut } = useAuth()
  
  // Test authentication flows
  const testSignIn = async () => {
    try {
      await signIn('test@example.com', 'password123')
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div>
      <h1>Auth Test Page</h1>
      {user ? (
        <div>
          <p>Signed in as: {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={testSignIn}>Test Sign In</button>
      )}
    </div>
  )
}
```

### 2. **Cross-Domain Testing**
```typescript
// app/test-cross-domain-auth/page.tsx
export default function TestCrossDomainAuth() {
  const { user, userProfile } = useAuth()
  const { mainSite, reader, author } = getPlatformUrls()

  const testPlatformRedirect = (platform: string) => {
    const url = platform === 'author' ? author : reader
    window.open(url, '_blank')
  }

  return (
    <div>
      <h1>Cross-Domain Auth Test</h1>
      <div>
        <button onClick={() => testPlatformRedirect('author')}>
          Test Author Platform
        </button>
        <button onClick={() => testPlatformRedirect('reader')}>
          Test Reader Platform
        </button>
      </div>
    </div>
  )
}
```

## 📋 Best Practices

### 1. **Security**
- Always validate user input
- Use CSRF tokens for state-changing operations
- Implement proper rate limiting
- Log security events
- Use HTTPS in production

### 2. **User Experience**
- Show loading states during auth operations
- Provide clear error messages
- Remember user preferences
- Support seamless cross-domain navigation

### 3. **Performance**
- Cache user type information
- Optimize database queries
- Use efficient session management
- Implement proper error boundaries

### 4. **Accessibility**
- Support keyboard navigation
- Provide ARIA labels
- Ensure screen reader compatibility
- Support high contrast modes

## 🆘 Troubleshooting

### Common Issues

#### 1. **Session Not Persisting**
- Check Supabase configuration
- Verify CORS settings
- Ensure proper domain configuration

#### 2. **Cross-Domain Auth Failing**
- Verify additional redirect URLs
- Check CORS headers
- Ensure shared Supabase project

#### 3. **CSRF Token Errors**
- Check token generation
- Verify middleware configuration
- Ensure proper headers in requests

#### 4. **User Type Not Updating**
- Check database permissions
- Verify API endpoint
- Check user type cache

### Debug Tools
```typescript
// Enable debug logging
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

## 📚 Related Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - API authentication details
- **[Database Schema](DATABASE_SCHEMA.md)** - User tables and relationships
- **[Security & Performance](SECURITY_AND_PERFORMANCE.md)** - Security features
- **[Technical Architecture](TECHNICAL_ARCHITECTURE.md)** - System architecture
- **[Reader Integration](READER_INTEGRATION.md)** - Cross-domain integration
