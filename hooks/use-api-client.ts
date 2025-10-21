'use client'

import { useCallback, useState, useRef } from 'react'
import { useApiErrorHandler } from '@/hooks/use-api-error-handler'
import { useToast } from '@/hooks/use-toast'

interface ApiClientOptions {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  showToast?: boolean
  onError?: (error: any) => void
  onSuccess?: (data: any) => void
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  showToast?: boolean
}

export function useApiClient(options: ApiClientOptions = {}) {
  const {
    baseURL = '',
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    showToast = true,
    onError,
    onSuccess
  } = options

  const { toast } = useToast()
  const errorHandler = useApiErrorHandler({
    showToast,
    maxRetries: retries,
    retryDelay,
    onError,
    onSuccess: onSuccess ? () => onSuccess(null) : undefined
  })

  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)

  const getCacheKey = useCallback((url: string, options?: RequestOptions) => {
    return `${url}:${JSON.stringify(options || {})}`
  }, [])

  const isCacheValid = useCallback((timestamp: number, maxAge: number = 5 * 60 * 1000) => {
    return Date.now() - timestamp < maxAge
  }, [])

  const request = useCallback(async <T>(
    url: string,
    requestOptions: RequestOptions = {}
  ): Promise<T | null> => {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout: requestTimeout = timeout,
      retries: requestRetries = retries,
      showToast: requestShowToast = showToast
    } = requestOptions

    const fullUrl = baseURL ? `${baseURL}${url}` : url
    const cacheKey = getCacheKey(fullUrl, requestOptions)

    // Check cache for GET requests
    if (method === 'GET' && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      if (isCacheValid(cached.timestamp)) {
        return cached.data
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    const executeRequest = async (): Promise<T> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

      try {
        const response = await fetch(fullUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        // Cache successful GET requests
        if (method === 'GET') {
          setCache(prev => new Map(prev).set(cacheKey, {
            data,
            timestamp: Date.now()
          }))
        }

        return data
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }

    return errorHandler.executeWithErrorHandling(executeRequest)
  }, [baseURL, timeout, retries, showToast, getCacheKey, isCacheValid, errorHandler])

  const get = useCallback(<T>(url: string, options: Omit<RequestOptions, 'method'> = {}) => {
    return request<T>(url, { ...options, method: 'GET' })
  }, [request])

  const post = useCallback(<T>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
    return request<T>(url, { ...options, method: 'POST', body })
  }, [request])

  const put = useCallback(<T>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
    return request<T>(url, { ...options, method: 'PUT', body })
  }, [request])

  const patch = useCallback(<T>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
    return request<T>(url, { ...options, method: 'PATCH', body })
  }, [request])

  const del = useCallback(<T>(url: string, options: Omit<RequestOptions, 'method'> = {}) => {
    return request<T>(url, { ...options, method: 'DELETE' })
  }, [request])

  const invalidateCache = useCallback((pattern?: string) => {
    if (pattern) {
      setCache(prev => {
        const newCache = new Map(prev)
        for (const [key] of newCache) {
          if (key.includes(pattern)) {
            newCache.delete(key)
          }
        }
        return newCache
      })
    } else {
      setCache(new Map())
    }
  }, [])

  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    ...errorHandler,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    invalidateCache,
    clearCache,
    abort,
    cacheSize: cache.size
  }
}

// Specialized hook for REST API endpoints
export function useRestApi<T = any>(baseURL: string, options: ApiClientOptions = {}) {
  const apiClient = useApiClient({ ...options, baseURL })

  const create = useCallback((data: Partial<T>) => {
    return apiClient.post<T>('', data)
  }, [apiClient])

  const read = useCallback((id: string) => {
    return apiClient.get<T>(`/${id}`)
  }, [apiClient])

  const update = useCallback((id: string, data: Partial<T>) => {
    return apiClient.put<T>(`/${id}`, data)
  }, [apiClient])

  const remove = useCallback((id: string) => {
    return apiClient.delete(`/${id}`)
  }, [apiClient])

  const list = useCallback((params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params)
    const queryString = searchParams.toString()
    const url = queryString ? `?${queryString}` : ''
    return apiClient.get<T[]>(url)
  }, [apiClient])

  return {
    ...apiClient,
    create,
    read,
    update,
    delete: remove,
    list
  }
}

// Hook for handling paginated API responses
export function usePaginatedApi<T>(
  baseURL: string,
  options: ApiClientOptions = {}
) {
  const apiClient = useApiClient({ ...options, baseURL })
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchPage = useCallback(async (page: number = 1, limit: number = 10) => {
    const result = await apiClient.get<{
      data: T[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(`?page=${page}&limit=${limit}`)

    if (result) {
      setData(result.data)
      setPagination(result.pagination)
    }

    return result
  }, [apiClient])

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      return fetchPage(pagination.page + 1, pagination.limit)
    }
    return Promise.resolve(null)
  }, [fetchPage, pagination])

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      return fetchPage(pagination.page - 1, pagination.limit)
    }
    return Promise.resolve(null)
  }, [fetchPage, pagination])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      return fetchPage(page, pagination.limit)
    }
    return Promise.resolve(null)
  }, [fetchPage, pagination])

  return {
    ...apiClient,
    data,
    pagination,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1
  }
}
