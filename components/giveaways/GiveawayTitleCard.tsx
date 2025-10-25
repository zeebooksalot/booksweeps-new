"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Book, Trophy } from "lucide-react"

interface GiveawayTitleCardProps {
  giveaway?: {
    title: string
    description: string
    entry_count: number
    number_of_winners: number
    end_date: string
    prize_description?: string
  }
}

export function GiveawayTitleCard({ giveaway }: GiveawayTitleCardProps) {
  const giveawayData = giveaway || {
    title: "Enter to Win Ocean's Echo by Elena Rodriguez",
    description: "Win a signed copy of Ocean's Echo plus exclusive bookmarks and a personal letter from author Elena Rodriguez",
    entry_count: 1247,
    number_of_winners: 5,
    end_date: "2024-12-30",
    prize_description: "Win a signed copy of Ocean's Echo plus exclusive bookmarks and a personal letter from author Elena Rodriguez"
  }

  const totalDays = 30
  const daysRemaining = Math.ceil((new Date(giveawayData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const progressPercentage = Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100)

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const endDate = new Date(giveawayData.end_date)
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [giveawayData.end_date])

  return (
    <Card className="w-full shadow-sm overflow-hidden p-0 rounded-b-none gap-0">
      <div className="bg-[#F2F5F8]">
        <div className="grid grid-cols-3 gap-4 px-6 pt-6 pb-4">
          <div className="text-center space-y-1 border-r border-border/40">
            <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">0</div>
            <div className="text-sm text-muted-foreground">Your Entries</div>
          </div>
          <div className="text-center space-y-1 border-r border-border/40">
            <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{giveawayData.entry_count.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{Math.max(0, daysRemaining)}</div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </div>
        </div>
        {/* Colorful gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500" />
      </div>

      <CardContent className="pt-6 pb-4 px-6 md:pt-10 md:pb-6 md:px-10 bg-[#F2F5F8]">
        <div className="space-y-6 text-center px-10">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-10">
              {giveawayData.title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-border/50">
                <Book className="h-4 w-4 text-[goldenrod]" />
                <span className="font-semibold text-foreground">{giveawayData.number_of_winners} Winners</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-border/50">
                <Trophy className="h-4 w-4 text-[goldenrod]" />
                <span className="font-semibold text-foreground">$100 Prize Value</span>
              </div>
            </div>
            <p className="text-base text-muted-foreground leading-loose text-pretty max-w-2xl mx-auto pb-0">
              {giveawayData.prize_description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
