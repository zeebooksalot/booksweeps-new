"use client"
import ConfettiExplosion from "react-confetti-explosion"
import { Button } from "@/components/ui/button"

interface GiveawayEntrySuccessMessageProps {
  totalEntries: number
  onAddMoreEntries: () => void
  isExploding: boolean
  onConfettiComplete: () => void
}

export function GiveawayEntrySuccessMessage({
  totalEntries,
  onAddMoreEntries,
  isExploding,
  onConfettiComplete,
}: GiveawayEntrySuccessMessageProps) {
  return (
    <div className="text-center space-y-3 py-4">
      <div className="text-4xl">🎉</div>
      <div className="relative flex justify-center">
        <h3 className="font-medium text-foreground">You're entered!</h3>
        {isExploding && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <ConfettiExplosion
              particleCount={150}
              duration={3000}
              force={0.6}
              width={1600}
              colors={["#FFC700", "#FF0000", "#2E3191", "#41BBC7", "#10b981"]}
              onComplete={onConfettiComplete}
            />
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        You have {totalEntries} {totalEntries === 1 ? "entry" : "entries"} in this giveaway. Good luck!
      </p>
      <Button variant="outline" size="sm" onClick={onAddMoreEntries} className="mt-2 bg-transparent">
        Add more entries
      </Button>
    </div>
  )
}
