'use client'

import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { useState } from 'react'
import { getPlatformUrls, validateCrossDomainConfig } from '@/lib/config'

export default function TestCrossDomainAuthPage() {
  const { user, userProfile, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="text-gray-600 dark:text-gray-400">
          This page is disabled in production.
        </div>
      </div>
    )
  }

  // Get platform URLs from config
  const { mainSite, reader, author } = getPlatformUrls()
  
  // Validate configuration
  const configErrors = validateCrossDomainConfig()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInLoading(true)
    
    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Sign in failed: ' + (error as Error).message)
    } finally {
      setSignInLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cross-Domain Auth Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Auth Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            
            {user ? (
              <div className="space-y-4">
                <div>
                  <strong>User ID:</strong> {user.id}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>User Type:</strong> {userProfile?.user_type || 'Unknown'}
                </div>
                <div>
                  <strong>Current Domain:</strong> {window.location.hostname}
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Not signed in</p>
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {signInLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Platform URLs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Platform URLs</h2>
            
            <div className="space-y-4">
              <div>
                <strong>Main Site:</strong>
                <div className="text-sm text-gray-600 break-all">{mainSite}</div>
              </div>
              
              <div>
                <strong>Reader Site:</strong>
                <div className="text-sm text-gray-600 break-all">{reader}</div>
              </div>
              
              <div>
                <strong>Author Site:</strong>
                <div className="text-sm text-gray-600 break-all">{author}</div>
              </div>
            </div>
          </div>

          {/* Configuration Validation */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Configuration Validation</h2>
            
            {configErrors.length > 0 ? (
              <div className="space-y-2">
                <div className="text-red-600 font-semibold">⚠️ Configuration Issues Found:</div>
                {configErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-green-600 font-semibold">✅ Configuration is valid</div>
            )}
          </div>

          {/* Test Scenarios */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h3 className="font-semibold mb-2">1. Author User Login Test</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Sign in with an author account to test the choice modal
                </p>
                <p className="text-xs text-gray-500">
                  Expected: Should show modal asking to go to author site or upgrade
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h3 className="font-semibold mb-2">2. Reader User Login Test</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Sign in with a reader account to test normal flow
                </p>
                <p className="text-xs text-gray-500">
                  Expected: Should proceed normally without modal
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h3 className="font-semibold mb-2">3. New User Registration Test</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Register a new account to test default user type
                </p>
                <p className="text-xs text-gray-500">
                  Expected: Should default to &apos;reader&apos; type
                </p>
              </div>
            </div>
          </div>

          {/* Current Configuration */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
            
            <div className="space-y-2 text-sm">
              <div>
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>NEXT_PUBLIC_SITE_URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_AUTHOR_URL:</strong> {process.env.NEXT_PUBLIC_AUTHOR_URL || 'Not set'}
              </div>
              <div>
                <strong>NEXT_PUBLIC_READER_URL:</strong> {process.env.NEXT_PUBLIC_READER_URL || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
