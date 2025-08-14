'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AUTH_TIMING } from '@/constants/auth'

const MAX_RETRY_ATTEMPTS = 3

export default function TestDashboardAccess() {
  const { user, userProfile, profileLoading, loadUserProfile } = useAuth()
  const { healthStatus, isHealthy, isUnhealthy, refreshHealth, timeSinceLastCheck } = useSystemHealth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testProfileLoading = async () => {
    addTestResult('Testing profile loading...')
    try {
      await loadUserProfile()
      addTestResult('Profile loading completed successfully')
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      addTestResult(`Profile loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setRetryCount(prev => prev + 1)
    }
  }

  const testFallbackProfile = () => {
    addTestResult('Testing fallback profile creation...')
    const fallbackProfile = {
      id: user?.id || '',
      email: user?.email || '',
      user_type: 'reader',
      display_name: user?.email?.split('@')[0] || 'User',
      favorite_genres: [],
      reading_preferences: {
        email_notifications: true,
        marketing_emails: true,
        giveaway_reminders: true,
        weekly_reports: false,
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    addTestResult('Fallback profile created successfully')
    return fallbackProfile
  }

  const testRetryLimit = () => {
    addTestResult(`Testing retry limit (${retryCount}/${MAX_RETRY_ATTEMPTS})...`)
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      addTestResult('Retry limit reached - this simulates the new retry limit functionality')
    } else {
      addTestResult(`Retry ${retryCount + 1} of ${MAX_RETRY_ATTEMPTS} - would allow retry`)
    }
  }

  const testSystemHealth = async () => {
    addTestResult('Testing system health check...')
    try {
      const isHealthy = await refreshHealth()
      addTestResult(`System health check completed: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)
    } catch (error) {
      addTestResult(`System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testTimingConstants = () => {
    addTestResult('Testing shared timing constants...')
    addTestResult(`Login timeout: ${AUTH_TIMING.LOGIN_TIMEOUT}ms (${AUTH_TIMING.LOGIN_TIMEOUT / 1000}s)`)
    addTestResult(`Error auto-clear: ${AUTH_TIMING.ERROR_AUTO_CLEAR}ms (${AUTH_TIMING.ERROR_AUTO_CLEAR / 1000}s)`)
    addTestResult(`Health check cache: ${AUTH_TIMING.HEALTH_CHECK_CACHE}ms (${AUTH_TIMING.HEALTH_CHECK_CACHE / 1000 / 60}min)`)
    addTestResult(`Session establishment: ${AUTH_TIMING.SESSION_ESTABLISHMENT_TIMEOUT}ms (${AUTH_TIMING.SESSION_ESTABLISHMENT_TIMEOUT / 1000}s)`)
  }

  const resetRetryCount = () => {
    setRetryCount(0)
    addTestResult('Retry count reset to 0')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Access Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing the dashboard access fixes and error handling with enhanced integration
          </p>
        </div>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Authenticated" : "Not Authenticated"}
              </Badge>
              {user && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
              )}
            </div>
            
            {user && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={userProfile ? "default" : "secondary"}>
                    {userProfile ? "Profile Loaded" : "No Profile"}
                  </Badge>
                  {profileLoading && (
                    <Badge variant="outline">Loading...</Badge>
                  )}
                </div>
                
                {userProfile && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Display Name: {userProfile.display_name || 'Not set'}</p>
                    <p>User Type: {userProfile.user_type}</p>
                    <p>Favorite Genres: {userProfile.favorite_genres.length}</p>
                  </div>
                )}
              </div>
            )}

            {/* Retry Count Display */}
            <div className="flex items-center gap-2">
              <Badge variant={retryCount >= MAX_RETRY_ATTEMPTS ? "destructive" : "outline"}>
                Retry Count: {retryCount}/{MAX_RETRY_ATTEMPTS}
              </Badge>
              {retryCount >= MAX_RETRY_ATTEMPTS && (
                <Badge variant="destructive">Max Retries Reached</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Health Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={isHealthy ? "default" : isUnhealthy ? "destructive" : "secondary"}>
                {healthStatus.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last check: {Math.round(timeSinceLastCheck / 1000)}s ago
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Status: {healthStatus}</p>
              <p>Is Healthy: {isHealthy ? 'Yes' : 'No'}</p>
              <p>Is Unhealthy: {isUnhealthy ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={testProfileLoading} 
                disabled={!user || profileLoading || retryCount >= MAX_RETRY_ATTEMPTS}
              >
                Test Profile Loading
              </Button>
              <Button onClick={testFallbackProfile} disabled={!user}>
                Test Fallback Profile
              </Button>
              <Button onClick={testRetryLimit} disabled={!user}>
                Test Retry Limit
              </Button>
              <Button onClick={testSystemHealth}>
                Test System Health
              </Button>
              <Button onClick={testTimingConstants}>
                Test Timing Constants
              </Button>
              <Button onClick={resetRetryCount} variant="outline">
                Reset Retry Count
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                disabled={!user}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No tests run yet</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Enhanced Integration Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✅ <strong>Shared Timing Constants:</strong> Login and dashboard use same timeouts</li>
                <li>✅ <strong>System Health Sharing:</strong> Health status shared between components</li>
                <li>✅ <strong>Consistent Error Clearing:</strong> 30-second auto-clear across all components</li>
                <li>✅ <strong>Health-Based Decisions:</strong> Login blocks when system is unhealthy</li>
                <li>✅ <strong>Unified Health Checks:</strong> Cached health checks reduce database load</li>
                <li>✅ <strong>Enhanced User Feedback:</strong> Clear indicators for system status</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">How to Test Enhanced Features:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Click &quot;Test System Health&quot; to check current system status</li>
                <li>Click &quot;Test Timing Constants&quot; to verify shared timing values</li>
                <li>Test login flow and verify health indicators appear</li>
                <li>Test dashboard access and verify shared health status</li>
                <li>Verify error messages show auto-clear timing</li>
                <li>Check that system health affects login button state</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">New Integration Benefits:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li><strong>Consistent UX:</strong> Same timeouts and error handling across components</li>
                <li><strong>Shared Health Status:</strong> System health visible in both login and dashboard</li>
                <li><strong>Performance Optimization:</strong> Cached health checks reduce API calls</li>
                <li><strong>Better Error Handling:</strong> Health-aware error messages and decisions</li>
                <li><strong>Unified Constants:</strong> Single source of truth for timing values</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
