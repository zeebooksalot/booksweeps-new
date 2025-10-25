"use client"

interface GiveawayFooterProps {
  endDate: string
  onShowRules: () => void
}

export function GiveawayFooter({ endDate, onShowRules }: GiveawayFooterProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs text-muted-foreground">
        <span>Open: Internationally</span>
        <span className="hidden sm:inline">•</span>
        <span>Ends: {endDate}</span>
        <span className="hidden sm:inline">•</span>
        <button
          type="button"
          className="text-muted-foreground hover:underline text-xs cursor-pointer"
          onClick={onShowRules}
        >
          View Official Rules
        </button>
      </div>
    </div>
  )
}
