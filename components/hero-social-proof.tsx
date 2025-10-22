"use client"

import { AnimatedCounter } from "@/components/animated-counter"
import { Users, Gift } from "lucide-react"

export function HeroSocialProof() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 pt-8 pb-8 max-w-3xl mx-auto">
      {/* User avatars and count */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 hover:z-10">
            JD
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-background flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 hover:z-10">
            SM
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 border-2 border-background flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 hover:z-10">
            AL
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 border-2 border-background flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 hover:z-10">
            KR
          </div>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" />
            <AnimatedCounter end={50000} suffix="+" /> readers
          </div>
          <p className="text-xs text-muted-foreground">joined this month</p>
        </div>
      </div>

      {/* Active giveaways stat */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Gift className="h-6 w-6 text-primary" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold">
            <AnimatedCounter end={2847} /> giveaways
          </div>
          <p className="text-xs text-muted-foreground">active right now</p>
        </div>
      </div>

    </div>
  )
}
