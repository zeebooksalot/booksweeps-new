'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useState } from 'react'
import { getPlatformUrls } from '@/lib/config'

export default function TestAuthPage() {
  const { user, loading, signIn, signOut } = useAuth()
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cross-Domain Auth Test</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          
          <div className="space-y-2 mb-4">
            <div>
              <strong>Current Domain:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}
            </div>
            
            <div>
              <strong>User:</strong> {user ? user.email : 'Not signed in'}
            </div>
            
            <div>
              <strong>User ID:</strong> {user?.id || 'N/A'}
            </div>
            
            <div>
              <strong>Session:</strong> {user ? 'Active' : 'None'}
            </div>
          </div>
          
          {user && (
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        {!user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sign In</h2>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
              
              <button 
                type="submit"
                disabled={signInLoading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {signInLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cross-Domain Navigation</h2>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = `${reader}/test-auth`}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to {new URL(reader).hostname}
            </button>
            
            <button 
              onClick={() => window.location.href = `${author}/test-auth`}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Go to {new URL(author).hostname}
            </button>
            
            <button 
              onClick={() => window.location.href = `${mainSite}/test-auth`}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Go to {new URL(mainSite).hostname}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
