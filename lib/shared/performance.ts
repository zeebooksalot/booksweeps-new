/**
 * Shared performance utilities
 * Common performance monitoring and optimization utilities
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
  customMetrics?: Record<string, number>
}

/**
 * Performance timer class
 */
export class PerformanceTimer {
  private startTime: number
  private metrics: PerformanceMetrics

  constructor() {
    this.startTime = performance.now()
    this.metrics = {
      startTime: this.startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  }

  /**
   * End the timer and return metrics
   */
  end(): PerformanceMetrics {
    const endTime = performance.now()
    this.metrics.endTime = endTime
    this.metrics.duration = endTime - this.startTime
    this.metrics.memoryUsage = process.memoryUsage()
    this.metrics.cpuUsage = process.cpuUsage()
    
    return { ...this.metrics }
  }

  /**
   * Add custom metric
   */
  addMetric(key: string, value: number): void {
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {}
    }
    this.metrics.customMetrics[key] = value
  }

  /**
   * Get current duration without ending
   */
  getCurrentDuration(): number {
    return performance.now() - this.startTime
  }
}

/**
 * Performance monitoring decorator
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    logResults?: boolean
    threshold?: number
    name?: string
  } = {}
): T {
  return ((...args: Parameters<T>) => {
    const timer = new PerformanceTimer()
    const result = fn(...args)
    
    if (result instanceof Promise) {
      return result.then((res) => {
        const metrics = timer.end()
        if (options.logResults) {
          console.log(`Performance [${options.name || fn.name}]:`, {
            duration: metrics.duration,
            memory: metrics.memoryUsage,
            cpu: metrics.cpuUsage
          })
        }
        if (options.threshold && metrics.duration && metrics.duration > options.threshold) {
          console.warn(`Performance warning: ${options.name || fn.name} took ${metrics.duration}ms (threshold: ${options.threshold}ms)`)
        }
        return res
      })
    } else {
      const metrics = timer.end()
      if (options.logResults) {
        console.log(`Performance [${options.name || fn.name}]:`, {
          duration: metrics.duration,
          memory: metrics.memoryUsage,
          cpu: metrics.cpuUsage
        })
      }
      if (options.threshold && metrics.duration && metrics.duration > options.threshold) {
        console.warn(`Performance warning: ${options.name || fn.name} took ${metrics.duration}ms (threshold: ${options.threshold}ms)`)
      }
      return result
    }
  }) as T
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  let timeoutId: NodeJS.Timeout | undefined
  let maxTimeoutId: NodeJS.Timeout | undefined
  let lastCallTime = 0
  let lastInvokeTime = 0
  let lastArgs: Parameters<T>
  let lastThis: any
  let result: ReturnType<T>

  const leading = options.leading || false
  const trailing = options.trailing !== false
  const maxWait = options.maxWait

  function invokeFunc(time: number) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined as any
    lastThis = undefined
    result = func.apply(thisArg, args)
    lastInvokeTime = time
    return result
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxWait === undefined
      ? timeWaiting
      : Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time: number) {
    timeoutId = undefined

    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined as any
    lastThis = undefined
    return result
  }

  function cancel() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    lastInvokeTime = 0
    lastCallTime = 0
    lastArgs = undefined as any
    lastThis = undefined
    timeoutId = undefined
  }

  function flush() {
    return timeoutId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(this: any, ...args: Parameters<T>) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait) {
        timeoutId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  return debounced as T & { cancel: () => void; flush: () => ReturnType<T> | undefined }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean
    trailing?: boolean
  } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  let timeoutId: NodeJS.Timeout | undefined
  let lastCallTime = 0
  let lastInvokeTime = 0
  let lastArgs: Parameters<T>
  let lastThis: any
  let result: ReturnType<T>

  const leading = options.leading || false
  const trailing = options.trailing !== false

  function invokeFunc(time: number) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined as any
    lastThis = undefined
    result = func.apply(thisArg, args)
    lastInvokeTime = time
    return result
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return timeWaiting
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time: number) {
    timeoutId = undefined

    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined as any
    lastThis = undefined
    return result
  }

  function cancel() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    lastInvokeTime = 0
    lastCallTime = 0
    lastArgs = undefined as any
    lastThis = undefined
    timeoutId = undefined
  }

  function flush() {
    return timeoutId === undefined ? result : trailingEdge(Date.now())
  }

  function throttled(this: any, ...args: Parameters<T>) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime)
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait)
    }
    return result
  }

  throttled.cancel = cancel
  throttled.flush = flush
  return throttled as T & { cancel: () => void; flush: () => ReturnType<T> | undefined }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private initialMemory: NodeJS.MemoryUsage
  private peakMemory: NodeJS.MemoryUsage
  private samples: NodeJS.MemoryUsage[] = []
  private maxSamples: number

  constructor(maxSamples: number = 100) {
    this.initialMemory = process.memoryUsage()
    this.peakMemory = { ...this.initialMemory }
    this.maxSamples = maxSamples
  }

  /**
   * Take a memory sample
   */
  sample(): NodeJS.MemoryUsage {
    const current = process.memoryUsage()
    this.samples.push(current)

    // Update peak memory
    if (current.heapUsed > this.peakMemory.heapUsed) {
      this.peakMemory = { ...current }
    }

    // Keep only the last maxSamples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }

    return current
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    current: NodeJS.MemoryUsage
    peak: NodeJS.MemoryUsage
    average: NodeJS.MemoryUsage
    growth: NodeJS.MemoryUsage
    samples: number
  } {
    const current = process.memoryUsage()
    const average = this.samples.length > 0
      ? {
          rss: this.samples.reduce((sum, sample) => sum + sample.rss, 0) / this.samples.length,
          heapTotal: this.samples.reduce((sum, sample) => sum + sample.heapTotal, 0) / this.samples.length,
          heapUsed: this.samples.reduce((sum, sample) => sum + sample.heapUsed, 0) / this.samples.length,
          external: this.samples.reduce((sum, sample) => sum + sample.external, 0) / this.samples.length,
          arrayBuffers: this.samples.reduce((sum, sample) => sum + sample.arrayBuffers, 0) / this.samples.length
        }
      : current

    const growth = {
      rss: current.rss - this.initialMemory.rss,
      heapTotal: current.heapTotal - this.initialMemory.heapTotal,
      heapUsed: current.heapUsed - this.initialMemory.heapUsed,
      external: current.external - this.initialMemory.external,
      arrayBuffers: current.arrayBuffers - this.initialMemory.arrayBuffers
    }

    return {
      current,
      peak: this.peakMemory,
      average,
      growth,
      samples: this.samples.length
    }
  }

  /**
   * Reset the monitor
   */
  reset(): void {
    this.initialMemory = process.memoryUsage()
    this.peakMemory = { ...this.initialMemory }
    this.samples = []
  }
}

/**
 * Performance cache with TTL
 */
export class PerformanceCache<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map()
  private defaultTTL: number

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiry })
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }
}

/**
 * Batch operations utility
 */
export class BatchProcessor<T, R> {
  private batch: T[] = []
  private batchSize: number
  private flushInterval: number
  private processor: (items: T[]) => Promise<R[]>
  private timeoutId?: NodeJS.Timeout

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    flushInterval: number = 1000
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.flushInterval = flushInterval
  }

  async add(item: T): Promise<R> {
    this.batch.push(item)

    if (this.batch.length >= this.batchSize) {
      return this.flush()
    }

    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.flushInterval)
    }

    // Return a promise that resolves when this item is processed
    return new Promise((resolve, reject) => {
      // This is a simplified implementation
      // In a real implementation, you'd need to track individual items
      this.flush().then(resolve).catch(reject)
    })
  }

  async flush(): Promise<R> {
    if (this.batch.length === 0) {
      return Promise.resolve([] as any)
    }

    const items = [...this.batch]
    this.batch = []

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    try {
      const results = await this.processor(items)
      return results as R
    } catch (error) {
      throw error
    }
  }
}
