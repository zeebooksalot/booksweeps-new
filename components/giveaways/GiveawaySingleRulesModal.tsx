"use client"

import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GiveawaySingleRulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Giveaway Rules</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Eligibility</p>
                <p className="text-muted-foreground">Open to US residents 18 years or older</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Entry Limit</p>
                <p className="text-muted-foreground">One entry per person, duplicate entries will be disqualified</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Winner Selection</p>
                <p className="text-muted-foreground">
                  Winners selected randomly and notified via email within 48 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Prize Delivery</p>
                <p className="text-muted-foreground">Prizes shipped within 2-3 weeks of winner confirmation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">No Purchase Necessary</p>
                <p className="text-muted-foreground">Entry is free and no purchase is required to participate</p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              By entering this giveaway, you agree to these terms and conditions. BookSweeps reserves the right to
              modify or cancel this giveaway at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
