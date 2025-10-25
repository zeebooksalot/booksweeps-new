"use client"

import type React from "react"
import ConfettiExplosion from "react-confetti-explosion"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Twitter, Facebook, Mail, Pencil } from "lucide-react"

interface GiveawayBonusEntriesFormProps {
  email: string
  entries: {
    email: boolean
    twitter: boolean
    facebook: boolean
    newsletter: boolean
    earlyBirdBooks: boolean
  }
  onEntriesChange: (entries: any) => void
  onEditEmail: () => void
  onSubmit: (e: React.FormEvent) => void
  totalEntries: number
  isExploding: boolean
}

export function GiveawayBonusEntriesForm({
  email,
  entries,
  onEntriesChange,
  onEditEmail,
  onSubmit,
  totalEntries,
  isExploding,
}: GiveawayBonusEntriesFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">Boost Your Chances</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each action below gives you additional chances to win
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400 flex-1 truncate">{email}</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded whitespace-nowrap">
              1 entry
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              onClick={onEditEmail}
              title="Change email"
            >
              <Pencil className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 bg-muted/40 p-4 rounded-lg border border-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bonus Entries</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-background/50 transition-colors">
              <Checkbox
                id="twitter"
                checked={entries.twitter}
                onCheckedChange={(checked) => onEntriesChange({ ...entries, twitter: checked as boolean })}
                className="mt-0.5 bg-white"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="twitter" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-sky-500 flex-shrink-0" />
                  <span>Follow @ElenaRodriguez on Twitter</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">Stay updated on new releases</p>
              </div>
              <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
                +2
              </span>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-background/50 transition-colors">
              <Checkbox
                id="facebook"
                checked={entries.facebook}
                onCheckedChange={(checked) => onEntriesChange({ ...entries, facebook: checked as boolean })}
                className="mt-0.5 bg-white"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="facebook" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Share this giveaway on Facebook</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">Help spread the word</p>
              </div>
              <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
                +2
              </span>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-background/50 transition-colors">
              <Checkbox
                id="newsletter"
                checked={entries.newsletter}
                onCheckedChange={(checked) => onEntriesChange({ ...entries, newsletter: checked as boolean })}
                className="mt-0.5 bg-white"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="newsletter" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Subscribe to the newsletter</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">Get exclusive book updates</p>
              </div>
              <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
                +1
              </span>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-background/50 transition-colors">
              <Checkbox
                id="earlyBirdBooks"
                checked={entries.earlyBirdBooks}
                onCheckedChange={(checked) => onEntriesChange({ ...entries, earlyBirdBooks: checked as boolean })}
                className="mt-0.5 bg-white"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="earlyBirdBooks" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span>Subscribe to the Early Bird Books newsletter</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">Get free ebook discounts in your favorite genres</p>
              </div>
              <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
                +1
              </span>
            </div>
          </div>
        </div>

        {totalEntries > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            You have {totalEntries} {totalEntries === 1 ? "chance" : "chances"} to win
          </p>
        )}

        <div className="relative">
          {isExploding && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
              <ConfettiExplosion
                particleCount={150}
                duration={3000}
                force={0.6}
                width={1600}
                colors={["#FFC700", "#FF0000", "#2E3191", "#41BBC7", "#10b981"]}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-auto py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            Submit Entry
          </Button>
        </div>
      </div>
    </form>
  )
}
