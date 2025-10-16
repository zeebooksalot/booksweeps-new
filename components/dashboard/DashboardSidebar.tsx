"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, Plus, BookOpen, Trophy, Library, Heart, Home, SettingsIcon, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (collapsed: boolean) => void
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "active-entries", label: "Active Entries", icon: BookOpen },
  { id: "books-won", label: "Books Won", icon: Trophy },
  { id: "your-books", label: "Your Books", icon: Library },
  { id: "following", label: "Following", icon: Heart },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: DashboardSidebarProps) {
  return (
    <aside className={cn("flex-shrink-0 transition-all duration-300", isSidebarCollapsed ? "w-20" : "w-80")}>
      <Card className="py-0 sticky top-8 border-border/50 shadow-xl rounded-lg mr-4 mb-4 min-h-[calc(100vh-6rem)] flex flex-col">
        {/* Header with Menu Toggle */}
        <div className="p-4 border-b border-border/50">
          <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between")}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            {!isSidebarCollapsed && (
              <>
                <h2 className="text-base font-semibold">Dashboard</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  aria-label="Quick actions"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <CardContent className="p-3 flex-1">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isSidebarCollapsed && "justify-center px-2",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </CardContent>

        {/* Discovery Sections (only when expanded) */}
        {!isSidebarCollapsed && (
          <div className="p-3 space-y-3 border-t border-border/50">
            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1.5">Discover New Giveaways</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Browse trending book giveaways in your favorite genres
              </p>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs h-8">
                Explore Giveaways
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1.5">Follow Your Favorite Authors</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Get notified when they launch new giveaways
              </p>
              <Button size="sm" variant="outline" className="w-full text-xs h-8 bg-transparent">
                Browse Authors
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed state - show Plus button */}
        {isSidebarCollapsed && (
          <div className="p-3 border-t border-border/50 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </aside>
  )
}
