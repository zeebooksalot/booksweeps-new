'use client'

import { useState } from 'react'
import { useApiClient } from '@/hooks/use-api-client'
import { useApiErrorHandler } from '@/hooks/use-api-error-handler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react'

export function SecurityExample() {
  const [testResults, setTestResults] = useState<Array<{
    test: string
    status: 'success' | 'error' | 'warning'
    message: string
    details?: string
  }>>([])

  // API client with security features
  const apiClient = useApiClient({
    baseURL: '/api',
    timeout: 10000,
    retries: 3,
    showToast: true
  })

  // Error handler for security testing
  const errorHandler = useApiErrorHandler({
    showToast: true,
    maxRetries: 3
  })

  // Test security headers
  const testSecurityHeaders = async () => {
    try {
      const response = await fetch('/api/books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const headers = response.headers
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy',
        'Permissions-Policy'
      ]

      const presentHeaders = securityHeaders.filter(header => headers.has(header))
      const missingHeaders = securityHeaders.filter(header => !headers.has(header))

      setTestResults(prev => [...prev, {
        test: 'Security Headers',
        status: missingHeaders.length === 0 ? 'success' : 'warning',
        message: `${presentHeaders.length}/${securityHeaders.length} security headers present`,
        details: missingHeaders.length > 0 ? `Missing: ${missingHeaders.join(', ')}` : undefined
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Security Headers',
        status: 'error',
        message: 'Failed to test security headers',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }
  }

  // Test CORS configuration
  const testCors = async () => {
    try {
      const response = await fetch('/api/books', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      })

      const corsHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials'
      ]

      const presentHeaders = corsHeaders.filter(header => response.headers.has(header))
      const isConfigured = presentHeaders.length >= 2

      setTestResults(prev => [...prev, {
        test: 'CORS Configuration',
        status: isConfigured ? 'success' : 'warning',
        message: `CORS ${isConfigured ? 'properly' : 'partially'} configured`,
        details: `Headers present: ${presentHeaders.join(', ')}`
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'CORS Configuration',
        status: 'error',
        message: 'Failed to test CORS',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }
  }

  // Test rate limiting
  const testRateLimit = async () => {
    const requests = []
    const startTime = Date.now()

    // Make multiple rapid requests to test rate limiting
    for (let i = 0; i < 20; i++) {
      requests.push(
        fetch('/api/books', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => ({
          status: res.status,
          headers: Object.fromEntries(res.headers.entries())
        }))
      )
    }

    try {
      const responses = await Promise.all(requests)
      const rateLimited = responses.some(res => res.status === 429)
      const avgResponseTime = (Date.now() - startTime) / responses.length

      setTestResults(prev => [...prev, {
        test: 'Rate Limiting',
        status: rateLimited ? 'success' : 'warning',
        message: `Rate limiting ${rateLimited ? 'active' : 'not detected'}`,
        details: `Average response time: ${avgResponseTime.toFixed(2)}ms`
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Rate Limiting',
        status: 'error',
        message: 'Failed to test rate limiting',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }
  }

  // Test input sanitization
  const testInputSanitization = async () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '../../../etc/passwd',
      "'; DROP TABLE users; --",
      '<img src="x" onerror="alert(1)">'
    ]

    try {
      const results = await Promise.all(
        maliciousInputs.map(async (input, index) => {
          const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: input })
          })
          return { input, status: response.status, index }
        })
      )

      const blocked = results.filter(r => r.status === 400 || r.status === 403)
      const sanitized = results.filter(r => r.status === 200 || r.status === 201)

      setTestResults(prev => [...prev, {
        test: 'Input Sanitization',
        status: blocked.length > 0 ? 'success' : 'warning',
        message: `${blocked.length}/${results.length} malicious inputs blocked`,
        details: `Blocked: ${blocked.length}, Sanitized: ${sanitized.length}`
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Input Sanitization',
        status: 'error',
        message: 'Failed to test input sanitization',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }
  }

  // Test CSRF protection
  const testCsrfProtection = async () => {
    try {
      // Try to make a POST request without CSRF token
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test comment' })
      })

      const isProtected = response.status === 403
      const hasCsrfError = response.headers.get('x-csrf-error')

      setTestResults(prev => [...prev, {
        test: 'CSRF Protection',
        status: isProtected ? 'success' : 'warning',
        message: `CSRF protection ${isProtected ? 'active' : 'not detected'}`,
        details: hasCsrfError ? 'CSRF error header present' : 'No CSRF error header'
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'CSRF Protection',
        status: 'error',
        message: 'Failed to test CSRF protection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }
  }

  // Run all security tests
  const runAllTests = async () => {
    setTestResults([])
    
    await testSecurityHeaders()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait between tests
    
    await testCors()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testRateLimit()
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait longer for rate limit test
    
    await testInputSanitization()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testCsrfProtection()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Fail</Badge>
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features Demonstration
          </CardTitle>
          <CardDescription>
            Comprehensive security testing and validation for the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Security Test Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testSecurityHeaders} variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Test Headers
            </Button>
            <Button onClick={testCors} variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Test CORS
            </Button>
            <Button onClick={testRateLimit} variant="outline" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Test Rate Limit
            </Button>
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Run All Tests
            </Button>
          </div>

          {/* Security Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Security Headers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Content Security Policy</li>
                  <li>• X-Frame-Options</li>
                  <li>• X-XSS-Protection</li>
                  <li>• HSTS</li>
                  <li>• Referrer Policy</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Input Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• XSS Protection</li>
                  <li>• SQL Injection Prevention</li>
                  <li>• Path Traversal Protection</li>
                  <li>• HTML Sanitization</li>
                  <li>• Input Length Limits</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• IP-based limiting</li>
                  <li>• User-based limiting</li>
                  <li>• Suspicious activity detection</li>
                  <li>• Concurrent request limits</li>
                  <li>• Custom rate limits</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Alert key={index} className={result.status === 'error' ? 'border-red-200' : result.status === 'warning' ? 'border-yellow-200' : 'border-green-200'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.test}</div>
                          <AlertDescription>{result.message}</AlertDescription>
                          {result.details && (
                            <div className="text-xs text-gray-500 mt-1">{result.details}</div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Production Checklist</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Set strong CSRF_SECRET environment variable</li>
                    <li>• Configure proper CORS origins</li>
                    <li>• Enable HSTS in production</li>
                    <li>• Set up monitoring for security events</li>
                    <li>• Regular security audits</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Monitoring</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Track failed authentication attempts</li>
                    <li>• Monitor rate limit violations</li>
                    <li>• Log suspicious IP addresses</li>
                    <li>• Alert on security header changes</li>
                    <li>• Regular penetration testing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  )
}
