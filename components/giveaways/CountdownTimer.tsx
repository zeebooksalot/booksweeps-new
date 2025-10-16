"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  endDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
        setIsExpired(false)
      } else {
        setTimeLeft(null)
        setIsExpired(true)
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <Clock className="h-4 w-4" />
        <span className="font-semibold text-sm">Giveaway Ended</span>
      </div>
    )
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Clock className="h-4 w-4" />
        <span className="font-semibold text-sm">Calculating...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-emerald-600" />
      <div className="flex items-center gap-1 text-sm">
        {timeLeft.days > 0 && (
          <>
            <span className="font-semibold text-emerald-600">{timeLeft.days}</span>
            <span className="text-gray-600 dark:text-gray-400">d</span>
          </>
        )}
        <span className="font-semibold text-emerald-600">{timeLeft.hours}</span>
        <span className="text-gray-600 dark:text-gray-400">h</span>
        <span className="font-semibold text-emerald-600">{timeLeft.minutes}</span>
        <span className="text-gray-600 dark:text-gray-400">m</span>
        <span className="font-semibold text-emerald-600">{timeLeft.seconds}</span>
        <span className="text-gray-600 dark:text-gray-400">s</span>
      </div>
    </div>
  )
}
