import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function DashboardEmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 opacity-50" />
      </div>
      <p className="text-base text-muted-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
