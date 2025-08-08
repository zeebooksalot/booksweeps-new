import { useState, useEffect } from "react"

export const useDebouncedSearch = (callback: (query: string) => void, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      callback(debouncedValue)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [debouncedValue, callback, delay])

  return setDebouncedValue
}
