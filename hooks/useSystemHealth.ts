'use client'

import { useState, useEffect, useCallback } from 'react'
import { AUTH_TIMING } from '@/constants/auth'

interface SystemHealthState {
  status: 'checking' | 'healthy' | 'unhealthy'
  timestamp: number
  lastCheck: number
}

interface SystemHealthCache {
  status: 'checking' | 'healthy' | 'unhealthy'
  timestamp: number
}

export function useSystemHealth() {
  const [healthState, setHealthState] = useState<SystemHealthState>({
    status: 'checking',
    timestamp: 0,
    lastCheck: 0
  })
  
  const [healthCache, setHealthCache] = useState<SystemHealthCache | null>(null)
  const [pendingCheck, setPendingCheck] = useState<Promise<boolean> | null>(null)

  // Check system health with caching and race condition protection
  const checkSystemHealth = useCallback(async (forceCheck = false) => {
    const now = Date.now()
    
    // Check cache first (unless forced)
    if (!forceCheck && healthCache && (now - healthCache.timestamp) < AUTH_TIMING.HEALTH_CHECK_CACHE) {
      setHealthState(prev => ({
        ...prev,
        status: healthCache.status,
        lastCheck: now
      }))
      return healthCache.status === 'healthy'
    }
    
    // Prevent concurrent health checks
    if (pendingCheck) {
      return await pendingCheck
    }
    
    setHealthState(prev => ({ ...prev, status: 'checking' }))
    
    const healthCheckPromise = (async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        if (!supabase) {
          const status: 'unhealthy' = 'unhealthy'
          const newCache = { status, timestamp: now }
          setHealthCache(newCache)
          setHealthState({
            status,
            timestamp: now,
            lastCheck: now
          })
          return false
        }
        
        // Simple health check - try to access the users table
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        if (error) {
          console.warn('System health check failed:', error)
          const status: 'unhealthy' = 'unhealthy'
          const newCache = { status, timestamp: now }
          setHealthCache(newCache)
          setHealthState({
            status,
            timestamp: now,
            lastCheck: now
          })
          return false
        }
        
        const status: 'healthy' = 'healthy'
        const newCache = { status, timestamp: now }
        setHealthCache(newCache)
        setHealthState({
          status,
          timestamp: now,
          lastCheck: now
        })
        return true
      } catch (error) {
        console.error('System health check error:', error)
        const status: 'unhealthy' = 'unhealthy'
        const newCache = { status, timestamp: now }
        setHealthCache(newCache)
        setHealthState({
          status,
          timestamp: now,
          lastCheck: now
        })
        return false
      } finally {
        setPendingCheck(null)
      }
    })()
    
    setPendingCheck(healthCheckPromise)
    return await healthCheckPromise
  }, [healthCache])

  // Get health status
  const getHealthStatus = useCallback(() => {
    return healthState.status
  }, [healthState.status])

  // Check if system is healthy
  const isHealthy = useCallback(() => {
    return healthState.status === 'healthy'
  }, [healthState.status])

  // Check if health check is stale (older than cache duration)
  const isHealthCheckStale = useCallback(() => {
    const now = Date.now()
    return !healthCache || (now - healthCache.timestamp) >= AUTH_TIMING.HEALTH_CHECK_CACHE
  }, [healthCache])

  // Get time since last health check
  const getTimeSinceLastCheck = useCallback(() => {
    return Date.now() - healthState.lastCheck
  }, [healthState.lastCheck])

  // Force refresh health check
  const refreshHealth = useCallback(async () => {
    return await checkSystemHealth(true)
  }, [checkSystemHealth])

  // Clean up stale cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now()
    if (healthCache && (now - healthCache.timestamp) > AUTH_TIMING.HEALTH_CHECK_CACHE * 2) {
      setHealthCache(null)
    }
  }, [healthCache])

  // Initialize health check on mount
  useEffect(() => {
    let isMounted = true
    
    const initializeHealthCheck = async () => {
      if (isMounted) {
        await checkSystemHealth()
      }
    }
    
    initializeHealthCheck()
    
    // Set up periodic cache cleanup
    const cleanupInterval = setInterval(() => {
      if (isMounted) {
        cleanupCache()
      }
    }, AUTH_TIMING.HEALTH_CHECK_CACHE)
    
    return () => {
      isMounted = false
      // Clear any pending health check
      setPendingCheck(null)
      // Clear cleanup interval
      clearInterval(cleanupInterval)
    }
  }, [checkSystemHealth, cleanupCache])

  return {
    // State
    healthStatus: healthState.status,
    isHealthy: isHealthy(),
    isChecking: healthState.status === 'checking',
    isUnhealthy: healthState.status === 'unhealthy',
    
    // Cache info
    isHealthCheckStale: isHealthCheckStale(),
    timeSinceLastCheck: getTimeSinceLastCheck(),
    
    // Actions
    checkHealth: checkSystemHealth,
    refreshHealth,
    forceCheck: () => checkSystemHealth(true),
    cleanupCache,
    
    // Raw state for advanced usage
    healthState,
    healthCache
  }
}
