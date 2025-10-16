import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
}

export function DashboardStatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card className="transition-all duration-200 border-border/30 rounded-lg py-1">
      <CardContent className="p-2">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/5 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary/60" />
          </div>
          <div className="text-center space-y-0">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="font-medium text-muted-foreground/70 text-sm">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
