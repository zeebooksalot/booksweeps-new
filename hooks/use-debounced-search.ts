import { useState, useEffect, useCallback } from "react"

export interface UseDebouncedSearchOptions {
  delay?: number
  immediate?: boolean
  onDebouncedChange?: (value: string) => void
}

export function useDebouncedSearch(
  callback: (query: string) => void, 
  options: UseDebouncedSearchOptions = {}
) {
  const { delay = 300, immediate = false, onDebouncedChange } = options
  const [debouncedValue, setDebouncedValue] = useState("")
  const [isDebouncing, setIsDebouncing] = useState(false)

  // Debounced effect
  useEffect(() => {
    setIsDebouncing(true)
    
    const handler = setTimeout(() => {
      callback(debouncedValue)
      onDebouncedChange?.(debouncedValue)
      setIsDebouncing(false)
    }, delay)

    return () => {
      clearTimeout(handler)
      setIsDebouncing(false)
    }
  }, [debouncedValue, callback, delay, onDebouncedChange])

  // Immediate callback if needed
  const setValueImmediate = useCallback((value: string) => {
    setDebouncedValue(value)
    if (immediate) {
      callback(value)
    }
  }, [callback, immediate])

  return {
    setValue: setDebouncedValue,
    setValueImmediate,
    value: debouncedValue,
    isDebouncing
  }
}

// Convenience hook for simple use cases
export function useSimpleDebouncedSearch(
  callback: (query: string) => void, 
  delay: number = 300
) {
  return useDebouncedSearch(callback, { delay }).setValue
}
