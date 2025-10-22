'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookCoverImage, AuthorAvatarImage } from '@/components/ui/optimized-image'
import { 
  Zap, 
  Image as ImageIcon, 
  Database, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface PerformanceMetrics {
  imageLoadTime: number
  apiResponseTime: number
  cacheHitRate: number
  bundleSize: number
  memoryUsage: number
}

export function PerformanceExample() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    imageLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    bundleSize: 0,
    memoryUsage: 0
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<Array<{
    test: string
    status: 'success' | 'warning' | 'error'
    message: string
    value?: number
    unit?: string
  }>>([])

  // Simulate performance testing
  const runPerformanceTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    const tests = [
      {
        test: 'Image Optimization',
        status: 'success' as const,
        message: 'Next.js Image components with lazy loading',
        value: 85,
        unit: '% optimized'
      },
      {
        test: 'API Caching',
        status: 'success' as const,
        message: 'Database queries cached for 2 minutes',
        value: 92,
        unit: '% cache hit rate'
      },
      {
        test: 'Bundle Size',
        status: 'warning' as const,
        message: 'Bundle size could be optimized further',
        value: 204,
        unit: 'KB'
      },
      {
        test: 'Memory Usage',
        status: 'success' as const,
        message: 'Memory usage within acceptable limits',
        value: 45,
        unit: 'MB'
      },
      {
        test: 'Response Time',
        status: 'success' as const,
        message: 'API responses under 200ms',
        value: 150,
        unit: 'ms'
      }
    ]
    
    // Simulate test execution
    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setTestResults(prev => [...prev, test])
    }
    
    setIsLoading(false)
  }

  // Performance monitoring
  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        setMetrics(prev => ({
          ...prev,
          imageLoadTime: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          apiResponseTime: navigation.responseEnd - navigation.requestStart,
          memoryUsage: ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0) / 1024 / 1024
        }))
      }
    }

    measurePerformance()
    const interval = setInterval(measurePerformance, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Optimal</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Good</Badge>
      case 'error':
        return <Badge variant="destructive">Needs Work</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimization Demo
          </CardTitle>
          <CardDescription>
            Demonstrating image optimization, caching strategies, and performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Performance Test Controls */}
          <div className="flex gap-4">
            <Button 
              onClick={runPerformanceTests} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {isLoading ? 'Running Tests...' : 'Run Performance Tests'}
            </Button>
          </div>

          {/* Optimized Images Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Optimized Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Book Cover (Optimized)</h4>
                <BookCoverImage
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=120&fit=crop"
                  alt="Sample book cover"
                  priority={false}
                />
                <p className="text-sm text-gray-600">Lazy loaded, WebP format, responsive sizing</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Author Avatar (Optimized)</h4>
                <AuthorAvatarImage
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Sample author"
                  priority={false}
                />
                <p className="text-sm text-gray-600">Circular crop, optimized for avatars</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Hero Image (Priority)</h4>
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <BookCoverImage
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop"
                    alt="Hero image"
                    priority={true}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600">Priority loading, full width</p>
              </div>
            </div>
          </div>

          {/* Caching Strategy Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Caching Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Static Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">1 Year</div>
                  <p className="text-xs text-gray-600">Images, CSS, JS</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">API Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">5 Min</div>
                  <p className="text-xs text-gray-600">Database queries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">User Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">1 Min</div>
                  <p className="text-xs text-gray-600">Personalized data</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sitemaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">1 Hour</div>
                  <p className="text-xs text-gray-600">SEO content</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Image Load Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.imageLoadTime.toFixed(0)}ms</div>
                  <Progress value={Math.min(100, (1000 - metrics.imageLoadTime) / 10)} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">API Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.apiResponseTime.toFixed(0)}ms</div>
                  <Progress value={Math.min(100, (500 - metrics.apiResponseTime) / 5)} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}MB</div>
                  <Progress value={Math.min(100, (100 - metrics.memoryUsage) * 2)} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className={result.status === 'error' ? 'border-red-200' : result.status === 'warning' ? 'border-yellow-200' : 'border-green-200'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">{result.test}</div>
                            <div className="text-sm text-gray-600">{result.message}</div>
                            {result.value && (
                              <div className="text-sm font-medium text-gray-800">
                                {result.value} {result.unit}
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Performance Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Image Optimization</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Use Next.js Image component</li>
                    <li>• Implement lazy loading</li>
                    <li>• Add WebP format support</li>
                    <li>• Optimize image sizes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Caching Strategy</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Cache API responses</li>
                    <li>• Use Redis for production</li>
                    <li>• Implement cache invalidation</li>
                    <li>• Add CDN for static assets</li>
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
