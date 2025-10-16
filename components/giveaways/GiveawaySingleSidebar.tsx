"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface GiveawaySidebarProps {
  onShowRules: () => void
  giveaway?: {
    title: string
    prize_description: string
    entry_count: number
    number_of_winners: number
    end_date: string
    status: string
  }
}

export function GiveawaySingleSidebar({ onShowRules, giveaway }: GiveawaySidebarProps) {
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  
  const giveawayData = giveaway || {
    title: "Ocean's Echo Giveaway",
    prize_description: "Win a signed copy of Ocean's Echo plus exclusive bookmarks and a personal letter from author Elena Rodriguez",
    entry_count: 1247,
    number_of_winners: 5,
    end_date: "2024-12-30",
    status: "ended"
  }

  const isEnded = giveawayData.status === "ended" || new Date(giveawayData.end_date) < new Date()

  const handleEmailSubmit = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      })
      return
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success!",
      description: isEnded 
        ? "You'll be notified about future giveaways!" 
        : "You've successfully entered the giveaway!",
    })
    
    setEmail("")
  }

  return (
    <Card className="w-full gap-0">
      <CardHeader className="pb-4">
        <h2 className="text-xl font-semibold">{giveawayData.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {giveawayData.prize_description}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-4 text-center mb-5">
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground">{giveawayData.entry_count.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Entries</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground">{giveawayData.number_of_winners}</div>
            <div className="text-xs text-muted-foreground">Winners</div>
          </div>
          <div className="space-y-1">
            <div className={`text-lg font-bold ${isEnded ? 'text-destructive' : 'text-foreground'}`}>
              {isEnded ? 'Ended' : 'Active'}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(giveawayData.end_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="pt-5 pb-5 border-t border-border">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">
                {isEnded ? "This giveaway is over..." : "Enter to win!"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isEnded 
                  ? "Don't miss another great book giveaway — leave your email to get notified!"
                  : "Enter your email below to participate in this giveaway."
                }
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <Input 
              placeholder="Email" 
              className="bg-background" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleEmailSubmit}
            >
              {isEnded ? "Stay in the know" : "Enter Giveaway"}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onShowRules}
          >
            Giveaway Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
